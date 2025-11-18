import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/app/lib/db";
import type { QueryResult } from "pg";

// Límite de faltas (puedes hacerlo dinámico después si está en la BD)
const LIMIT_FALTAS = 14;

// 1. Interfaz para el resultado de la consulta SQL
// Nota: pg-node devuelve SUM() como string, por eso usamos string aquí.
interface QueryResultRow {
  alumno_id: number;
  expediente: string;
  nombreCompleto: string;
  correo: string;
  faltas_brutas: string;
  justificaciones: string;
}

// 2. Interfaz para el objeto que se mapea y se envía al frontend
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
    // 1. Obtenemos alumnos del grupo y contamos sus incidencias tipo 'FALTA' y 'JUSTIFICACION'
    const query = `
      SELECT
        a.id AS alumno_id,
        a.expediente,
        TRIM(CONCAT(a.nombre, ' ', a.apellido_paterno, ' ', COALESCE(a.apellido_materno, ''))) as "nombreCompleto",
        a.correo,
        COALESCE(SUM(CASE WHEN i.tipo = 'FALTA' THEN 1 ELSE 0 END), 0) as faltas_brutas,
        COALESCE(SUM(CASE WHEN i.tipo = 'JUSTIFICACION' THEN 1 ELSE 0 END), 0) as justificaciones
      FROM grupo g
      JOIN kardex k ON k.materia_id = g.materia_id AND k.periodo_id = g.periodo_id
      JOIN alumno a ON k.alumno_id = a.id
      LEFT JOIN incidencia i ON i.alumno_id = a.id AND i.grupo_id = g.id
      WHERE g.id = $1
      GROUP BY a.id, a.expediente, a.nombre, a.apellido_paterno, a.apellido_materno, a.correo
    `;

    // 3. Cast del resultado: Le decimos a pool.query qué forma esperamos
    const result = await pool.query(query, [grupoId]);
    const rows = result.rows as QueryResultRow[];

    // 4. Procesamos los datos para el frontend
    const alumnos: AlumnoFaltasAPI[] = rows.map((row) => {
      const faltasNetas =
        parseInt(row.faltas_brutas) - parseInt(row.justificaciones);
      const faltasReales = faltasNetas < 0 ? 0 : faltasNetas;

      return {
        id: row.alumno_id,
        expediente: row.expediente,
        nombreCompleto: row.nombreCompleto,
        email: row.correo,
        faltas: faltasReales,
        faltasPermitidas: LIMIT_FALTAS,
      };
    });

    // 5. Ordenamos los alumnos por riesgo de faltas
    alumnos.sort(
      (a: AlumnoFaltasAPI, b: AlumnoFaltasAPI) =>
        b.faltas / b.faltasPermitidas - a.faltas / a.faltasPermitidas
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
