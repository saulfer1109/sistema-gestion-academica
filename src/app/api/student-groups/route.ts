// src/app/api/student-groups/route.ts

import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/app/lib/db"; // Tu pool de conexión PostgreSQL

// MOCK: ID del profesor loggeado (Asegúrate de obtener esto de la sesión en producción)
const PROFESSOR_ID_MOCK = 50; 

// Definiciones de tipos para la respuesta (PR9.7)
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
    const profesorId = PROFESSOR_ID_MOCK; 

    if (!grupoId) {
        return NextResponse.json({ error: "El parámetro grupoId es obligatorio." }, { status: 400 });
    }

    try {
        // PR9.4 y PR9.5: Validar que el grupo exista y que el profesor tenga permiso
        const permisoResult = await pool.query(
            `
            SELECT
                g.id AS grupo_id,
                g.clave_grupo,
                COUNT(ap.profesor_id) AS tiene_permiso
            FROM grupo g
            LEFT JOIN asignacion_profesor ap  -- Tabla de permisos verificada
                ON ap.grupo_id = g.id AND ap.profesor_id = $2
            WHERE g.id = $1
            GROUP BY g.id, g.clave_grupo;
            `,
            [grupoId, profesorId]
        );

        if (permisoResult.rows.length === 0) {
             return NextResponse.json({ error: "PR9.4: El grupo no existe o no está activo." }, { status: 404 });
        }
        
        const grupo = permisoResult.rows[0];
        if (Number(grupo.tiene_permiso) === 0) {
            return NextResponse.json({ error: "PR9.5: Acceso denegado. El profesor no está asignado a este grupo." }, { status: 403 });
        }

        // PR9.6: Consultar alumnos
        // Usamos la tabla 'kardex' para encontrar a los alumnos que pertenecen a la Materia/Periodo del grupo.
        const alumnosResult = await pool.query(
            `
            SELECT 
                a.expediente, 
                a.matricula,
                a.nombre || ' ' || a.apellido_paterno || ' ' || a.apellido_materno AS "nombreCompleto",
                a.correo,
                a.estado_academico AS "estadoAcademico"
            FROM alumno a
            -- Usamos kardex como tabla de unión entre alumno y curso/grupo
            JOIN kardex k ON k.alumno_id = a.id 
            -- Unimos el kardex con el grupo a través de materia_id y periodo_id
            JOIN grupo g ON g.materia_id = k.materia_id AND g.periodo_id = k.periodo_id 
            WHERE g.id = $1 -- Filtramos por el ID del grupo
            ORDER BY "nombreCompleto";
            `,
            [grupoId] // Solo necesitamos el ID del grupo
        );

        // PR9.7: Devolver estructura con datos
        const alumnosData: AlumnoData[] = alumnosResult.rows.map(row => ({
            expediente: String(row.expediente),
            matricula: row.matricula,
            nombreCompleto: row.nombreCompleto,
            correo: row.correo,
            estadoAcademico: row.estadoAcademico,
        }));

        return NextResponse.json(alumnosData);

    } catch (error) {
        console.error("Error en PR9 (Alumnos por Grupo):", error);
        return NextResponse.json({ error: "Error interno del servidor al consultar alumnos." }, { status: 500 });
    }
}