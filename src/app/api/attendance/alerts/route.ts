import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/app/lib/db";

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

  if (!grupoId) return NextResponse.json({ error: "Grupo ID es requerido" }, { status: 400 });

  try {
    const query = `
      SELECT
        a.id AS alumno_id,
        a.expediente,
        -- 🟢 CAMBIO: Apellidos primero
        TRIM(a.apellido_paterno || ' ' || COALESCE(a.apellido_materno, '') || ' ' || a.nombre) as "nombreCompleto",
        a.correo,
        (SELECT COUNT(*) FROM incidencia i WHERE i.alumno_id = a.id AND i.grupo_id = $1 AND i.tipo = 'FALTA') as faltas_brutas,
        (SELECT COUNT(*) FROM incidencia i WHERE i.alumno_id = a.id AND i.grupo_id = $1 AND i.tipo = 'JUSTIFICACION') as justificaciones
      FROM alumno a
      WHERE a.id IN (
          SELECT k.alumno_id FROM kardex k JOIN grupo g ON g.id = $1 WHERE k.materia_id = g.materia_id AND k.periodo_id = g.periodo_id
          UNION
          SELECT ag.alumno_id FROM alumno_grupo ag WHERE ag.grupo_id = $1
      )
      -- Ordenar base alfabéticamente (aunque luego el frontend pueda reordenar por riesgo)
      ORDER BY a.apellido_paterno ASC, a.apellido_materno ASC, a.nombre ASC;
    `;

    const result = await pool.query(query, [grupoId]);

    const alumnos: AlumnoFaltasAPI[] = result.rows.map((row) => {
      const faltasBrutas = parseInt(row.faltas_brutas || '0');
      const justificaciones = parseInt(row.justificaciones || '0');
      return {
        id: row.alumno_id,
        expediente: row.expediente,
        nombreCompleto: row.nombreCompleto, // Ya viene con Apellidos primero
        email: row.correo,
        faltas: Math.max(0, faltasBrutas - justificaciones),
        faltasPermitidas: LIMIT_FALTAS,
      };
    });

    // Nota: Esta API suele reordenar por número de faltas al final para mostrar los riesgos primero.
    // Si prefieres que SIEMPRE salga por apellido sin importar las faltas, borra el alumnos.sort siguiente.
    alumnos.sort((a, b) => (b.faltas / b.faltasPermitidas) - (a.faltas / a.faltasPermitidas));

    return NextResponse.json(alumnos);

  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}