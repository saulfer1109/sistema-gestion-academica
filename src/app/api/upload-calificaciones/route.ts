import { NextResponse } from 'next/server';
import { procesarArchivoCalificaciones } from '@/app/services/excel.service';
import { pool } from "@/app/lib/db";

export async function POST(request: Request) {
    let pgClient: any = null;

    try {
        const data = await request.formData();
        const fileEntry = data.get('excel');
        
        if (!fileEntry || !(fileEntry instanceof File)) {
            return NextResponse.json({ mensaje: 'No se subió ningún archivo.' }, { status: 400 });
        }
        
        const file = fileEntry as File;
        const buffer = Buffer.from(await file.arrayBuffer());
        
        // Leer Excel
        const filas = procesarArchivoCalificaciones({
            data: buffer,
            name: file.name,
        });

        pgClient = await pool.connect();
        await pgClient.query("BEGIN");

        let totalActualizados = 0;
        let totalCreados = 0;
        const errores: any[] = [];

        for (const fila of filas) {
            try {
                /** --- Buscar Alumno --- **/
                const qAlumno = await pgClient.query(
                    `SELECT id FROM alumno WHERE TRIM(matricula)=TRIM($1)`,
                    [fila.matricula]
                );
                if (qAlumno.rows.length === 0)
                    throw new Error(`Alumno no existe: ${fila.matricula}`);

                /** --- Buscar Materia --- **/
                const qMateria = await pgClient.query(
                    `SELECT id FROM materia WHERE TRIM(codigo)=TRIM($1)`,
                    [fila.codigo_materia]
                );
                if (qMateria.rows.length === 0)
                    throw new Error(`Materia no existe: ${fila.codigo_materia}`);

                /** --- Buscar Periodo --- **/
                const qPeriodo = await pgClient.query(
                    `SELECT id FROM periodo WHERE TRIM(etiqueta)=TRIM($1)`,
                    [fila.periodo]
                );
                if (qPeriodo.rows.length === 0)
                    throw new Error(`Periodo no existe: ${fila.periodo}`);

                const alumnoId = qAlumno.rows[0].id;
                const materiaId = qMateria.rows[0].id;
                const periodoId = qPeriodo.rows[0].id;

                /** --- Buscar Kardex --- **/
                const qKardex = await pgClient.query(
                    `SELECT id FROM kardex
                     WHERE alumno_id=$1 AND materia_id=$2 AND periodo_id=$3`,
                    [alumnoId, materiaId, periodoId]
                );

                let kardexId;

                /** --- Si NO existe, crear kardex --- **/
                if (qKardex.rows.length === 0) {
                    const nuevo = await pgClient.query(`
                        INSERT INTO kardex (alumno_id, materia_id, periodo_id, estatus, calificacion)
                        VALUES ($1, $2, $3, 'Ordinario', $4)
                        RETURNING id
                    `, [alumnoId, materiaId, periodoId, fila.final]);

                    kardexId = nuevo.rows[0].id;
                    totalCreados++;
                } else {
                    kardexId = qKardex.rows[0].id;
                }

                /** --- Upsert calificación --- **/
                const qCal = await pgClient.query(
                    `SELECT id FROM calificacion WHERE kardex_id=$1`,
                    [kardexId]
                );

                const fechaCierre = fila.fecha_cierre ?? new Date().toISOString().slice(0, 10);

                if (qCal.rows.length > 0) {
                    // UPDATE
                    await pgClient.query(
                        `UPDATE calificacion
                         SET ordinario=$1,
                             extraordinario=$2,
                             final=$3,
                             fecha_cierre=$4
                         WHERE kardex_id=$5`,
                        [
                            fila.ordinario,
                            fila.extraordinario ?? 0,
                            fila.final,
                            fechaCierre,
                            kardexId
                        ]
                    );
                } else {
                    // INSERT
                    await pgClient.query(
                        `INSERT INTO calificacion (kardex_id, ordinario, extraordinario, final, fecha_cierre)
                         VALUES ($1, $2, $3, $4, $5)`,
                        [
                            kardexId,
                            fila.ordinario,
                            fila.extraordinario ?? 0,
                            fila.final,
                            fechaCierre
                        ]
                    );
                }

                /** --- Actualizar kardex --- **/
                await pgClient.query(`
                    UPDATE kardex
                    SET estatus=$1, calificacion=$2
                    WHERE id=$3
                `, [fila.estatus_kardex ?? "Ordinario", fila.final, kardexId]);

                totalActualizados++;

            } catch (err: any) {
                errores.push({ fila, error: err.message });
            }
        }

        await pgClient.query("COMMIT");

        return NextResponse.json({
            mensaje: "Proceso completado",
            totalActualizados,
            totalCreados,
            errores
        });

    } catch (err: any) {
        if (pgClient) await pgClient.query("ROLLBACK");
        return NextResponse.json({ mensaje: err.message }, { status: 500 });
    } finally {
        if (pgClient) pgClient.release();
    }
}
