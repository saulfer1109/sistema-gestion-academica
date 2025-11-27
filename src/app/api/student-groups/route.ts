import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/app/lib/db";

// Definiciones de tipos para la respuesta
interface AlumnoData {
    expediente: string;
    matricula: string;
    nombreCompleto: string;
    correo: string;
    estadoAcademico: string;
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const grupoId = searchParams.get('grupoId');
    const profesorId = searchParams.get('profesorId'); // 🟢 Ahora lo leemos de la URL

    if (!grupoId || !profesorId) {
        return NextResponse.json({ error: "Faltan parámetros: grupoId y profesorId son obligatorios." }, { status: 400 });
    }

    try {
        // Validar que el grupo exista y que el profesor tenga permiso real
        const permisoResult = await pool.query(
            `
            SELECT
                g.id AS grupo_id,
                g.clave_grupo,
                COUNT(ap.profesor_id) AS tiene_permiso
            FROM grupo g
            LEFT JOIN asignacion_profesor ap 
                ON ap.grupo_id = g.id AND ap.profesor_id = $2
            WHERE g.id = $1
            GROUP BY g.id, g.clave_grupo;
            `,
            [grupoId, profesorId]
        );

        if (permisoResult.rows.length === 0) {
             return NextResponse.json({ error: "El grupo no existe." }, { status: 404 });
        }
        
        const grupo = permisoResult.rows[0];
        // Convertimos a número para asegurar la comparación
        if (Number(grupo.tiene_permiso) === 0) {
            return NextResponse.json({ error: "Acceso denegado. No tiene asignado este grupo." }, { status: 403 });
        }

        // Consultar alumnos
        const alumnosResult = await pool.query(
            `
            SELECT 
                a.expediente, 
                a.matricula,
                a.nombre || ' ' || a.apellido_paterno || ' ' || COALESCE(a.apellido_materno, '') AS "nombreCompleto",
                a.correo,
                a.estado_academico AS "estadoAcademico"
            FROM alumno a
            JOIN kardex k ON k.alumno_id = a.id 
            JOIN grupo g ON g.materia_id = k.materia_id AND g.periodo_id = k.periodo_id 
            WHERE g.id = $1
            ORDER BY a.apellido_paterno ASC;
            `,
            [grupoId]
        );

        const alumnosData: AlumnoData[] = alumnosResult.rows.map(row => ({
            expediente: String(row.expediente),
            matricula: row.matricula,
            nombreCompleto: row.nombreCompleto,
            correo: row.correo,
            estadoAcademico: row.estadoAcademico,
        }));

        return NextResponse.json(alumnosData);

    } catch (error) {
        console.error("Error consultando alumnos:", error);
        return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
    }
}