import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/app/lib/db";

// Límite de faltas
const LIMIT_FALTAS = 14;

interface AlumnoFaltasAPI {
  id: number;
  expediente: string;
  nombreCompleto: string;
  email: string;
  faltas: number;
  faltasPermitidas: number;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const grupoId = searchParams.get("grupoId");

  if (!grupoId) {
    return NextResponse.json(
      { error: "Grupo ID es requerido" },
      { status: 400 }
    );
  }

  try {
    // Consulta unificada: Kardex (Oficial) + AlumnoGrupo (Excel)
    const query = `
      SELECT
        a.id AS alumno_id,
        a.expediente,
        TRIM(CONCAT(a.nombre, ' ', a.apellido_paterno, ' ', COALESCE(a.apellido_materno, ''))) as "nombreCompleto",
        a.correo,
        -- Contamos incidencias directamente con subconsultas para evitar duplicados por JOINs
        (SELECT COUNT(*) FROM incidencia i WHERE i.alumno_id = a.id AND i.grupo_id = $1 AND i.tipo = 'FALTA') as faltas_brutas,
        (SELECT COUNT(*) FROM incidencia i WHERE i.alumno_id = a.id AND i.grupo_id = $1 AND i.tipo = 'JUSTIFICACION') as justificaciones
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
      ORDER BY a.apellido_paterno, a.nombre;
    `;

    const result = await pool.query(query, [grupoId]);

    // Procesamos los datos
    const alumnos: AlumnoFaltasAPI[] = result.rows.map((row) => {
      // Calculamos faltas netas (Faltas - Justificaciones)
      const faltasBrutas = parseInt(row.faltas_brutas || '0');
      const justificaciones = parseInt(row.justificaciones || '0');
      const faltasReales = Math.max(0, faltasBrutas - justificaciones);

      return {
        id: row.alumno_id,
        expediente: row.expediente,
        nombreCompleto: row.nombreCompleto,
        email: row.correo,
        faltas: faltasReales,
        faltasPermitidas: LIMIT_FALTAS,
      };
    });

    // Ordenamos por riesgo (los que tienen más faltas primero)
    alumnos.sort(
      (a, b) => (b.faltas / b.faltasPermitidas) - (a.faltas / a.faltasPermitidas)
    );

    return NextResponse.json(alumnos);

  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}