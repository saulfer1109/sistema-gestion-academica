import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/app/lib/db";
import { parseStudentsFile } from "@/app/services/excel-students.service";

export async function POST(req: NextRequest) {
    let client = null;
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const grupoId = formData.get('grupoId') as string;

        if (!file || !grupoId) {
            return NextResponse.json({ error: "Faltan datos (archivo o grupoId)." }, { status: 400 });
        }

        // 1. Procesar el Buffer del archivo
        const buffer = Buffer.from(await file.arrayBuffer());
        // Aquí usamos el servicio que creamos en el paso 1
        const alumnosExcel = parseStudentsFile(buffer);

        if (alumnosExcel.length === 0) {
            return NextResponse.json({ error: "No se encontraron alumnos en el archivo." }, { status: 400 });
        }

        client = await pool.connect();
        await client.query("BEGIN");

        let insertados = 0;
        let yaExistian = 0;
        let noEncontradosEnBD = 0;

        // 2. Iterar por cada alumno del Excel
        for (const al of alumnosExcel) {
            // A. Buscar el ID del alumno en tu base de datos usando el expediente del Excel
            const resAlumno = await client.query(
                "SELECT id FROM alumno WHERE TRIM(expediente) = $1",
                [al.expediente]
            );

            if (resAlumno.rows.length > 0) {
                const alumnoId = resAlumno.rows[0].id;

                // B. Verificar si ya está en el grupo para no duplicar
                const checkExist = await client.query(
                    "SELECT id FROM alumno_grupo WHERE alumno_id = $1 AND grupo_id = $2",
                    [alumnoId, grupoId]
                );

                if (checkExist.rows.length === 0) {
                    // C. Insertar en la tabla alumno_grupo
                    await client.query(
                        `INSERT INTO alumno_grupo (alumno_id, grupo_id, fuente, fecha_alta) 
                         VALUES ($1, $2, 'EXCEL_PROFESOR', NOW())`,
                        [alumnoId, grupoId]
                    );
                    insertados++;
                } else {
                    yaExistian++;
                }
            } else {
                // El expediente está en el Excel pero NO en tu tabla 'alumno'
                console.warn(`Expediente ${al.expediente} no encontrado en la base de datos.`);
                noEncontradosEnBD++;
            }
        }

        await client.query("COMMIT");

        return NextResponse.json({
            success: true,
            message: `Carga exitosa. Alumnos vinculados: ${insertados}. (Ya existían: ${yaExistian}, No encontrados: ${noEncontradosEnBD})`,
        });

    } catch (error: any) {
        if (client) await client.query("ROLLBACK");
        console.error("Error al subir alumnos:", error);
        return NextResponse.json({ error: error.message || "Error interno al procesar el archivo." }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}