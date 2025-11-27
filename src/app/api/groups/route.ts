import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/app/lib/db";

export async function GET(req: NextRequest) {
  try {
    // 1. Obtener el ID del profesor de los parámetros de la URL
    const { searchParams } = new URL(req.url);
    const profesorId = searchParams.get('profesorId');

    if (!profesorId) {
      return NextResponse.json({ error: "Profesor ID es requerido para consultar grupos." }, { status: 400 });
    }

    // 2. Consulta filtrada: Solo grupos asignados a ese profesor
    const query = `
      SELECT 
        g.id,
        g.clave_grupo AS clave,
        m.nombre AS nombre,
        p.etiqueta AS periodo
      FROM grupo g
      JOIN materia m ON g.materia_id = m.id
      JOIN periodo p ON g.periodo_id = p.id
      JOIN asignacion_profesor ap ON g.id = ap.grupo_id -- Unimos con asignaciones
      WHERE ap.profesor_id = $1 -- Filtramos por el profesor logueado
      ORDER BY m.nombre ASC;
    `;

    const result = await pool.query(query, [profesorId]);

    const grupos = result.rows.map((row: any) => ({
      id: String(row.id),
      clave: row.clave,
      nombre: `${row.nombre} (${row.periodo})` // Agregué el periodo para mayor claridad
    }));

    return NextResponse.json(grupos);

  } catch (error) {
    console.error("❌ Error en /api/groups:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al cargar grupos." },
      { status: 500 }
    );
  }
}