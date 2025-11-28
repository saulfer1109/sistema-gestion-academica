import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/app/lib/db";

interface AlumnoData {
    id: number;
    expediente: string;
    matricula: string;
    nombreCompleto: string;
    correo: string;
    estadoAcademico: string;
    faltas: number;
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const grupoId = searchParams.get('grupoId');
    const profesorId = searchParams.get('profesorId');

    if (!grupoId || !profesorId) {
        return NextResponse.json({ error: "Faltan parámetros." }, { status: 400 });
    }

    try {
        // 1. Validar permisos (Se mantiene igual)
        const permisoResult = await pool.query(
            `SELECT g.id, COUNT(ap.profesor_id) as tiene_permiso 
             FROM grupo g 
             LEFT JOIN asignacion_profesor ap ON ap.grupo_id = g.id AND ap.profesor_id = $2
             WHERE g.id = $1 GROUP BY g.id`,
            [grupoId, profesorId]
        );

        if (permisoResult.rows.length === 0 || Number(permisoResult.rows[0].tiene_permiso) === 0) {
            return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });
        }

        // 2. Consultar alumnos (CORREGIDO: Unión de Kardex + Lista Excel)
        // Ahora buscamos alumnos que estén en Kardex O en la tabla alumno_grupo
        const alumnosResult = await pool.query(
            `
            SELECT 
                a.id,
                a.expediente, 
                a.matricula,
                a.nombre || ' ' || a.apellido_paterno || ' ' || COALESCE(a.apellido_materno, '') AS "nombreCompleto",
                a.correo,
                a.estado_academico AS "estadoAcademico",
                -- Calculamos faltas reales
                (
                    SELECT GREATEST(0, 
                        COUNT(CASE WHEN tipo = 'FALTA' THEN 1 END) - 
                        COUNT(CASE WHEN tipo = 'JUSTIFICACION' THEN 1 END)
                    )
                    FROM incidencia i
                    WHERE i.alumno_id = a.id AND i.grupo_id = $1
                ) AS faltas_reales
            FROM alumno a
            WHERE a.id IN (
                -- Opción A: Alumnos oficiales (Kardex)
                SELECT k.alumno_id 
                FROM kardex k
                JOIN grupo g ON g.id = $1
                WHERE k.materia_id = g.materia_id AND k.periodo_id = g.periodo_id
                
                UNION
                
                -- Opción B: Alumnos subidos por Excel (alumno_grupo)
                SELECT ag.alumno_id
                FROM alumno_grupo ag
                WHERE ag.grupo_id = $1
            )
            ORDER BY a.apellido_paterno ASC;
            `,
            [grupoId]
        );

        const alumnosData: AlumnoData[] = alumnosResult.rows.map(row => ({
            id: row.id,
            expediente: String(row.expediente),
            matricula: row.matricula,
            nombreCompleto: row.nombreCompleto,
            correo: row.correo,
            estadoAcademico: row.estadoAcademico,
            faltas: Number(row.faltas_reales) || 0
        }));

        return NextResponse.json(alumnosData);

    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: "Error interno." }, { status: 500 });
    }
}