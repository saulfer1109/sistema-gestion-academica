import { NextResponse } from "next/server";
import { pool } from "@/app/lib/db";

export async function GET() {
  try {
    const query = `
      SELECT 
        g.id,
        g.clave_grupo AS clave,
        m.nombre AS nombre
      FROM grupo g
      JOIN materia m ON g.materia_id = m.id
      ORDER BY g.id ASC;
    `;

    const result = await pool.query<{
      id: number;
      clave: string;
      nombre: string;
    }>(query);

    const grupos = result.rows.map((row: {id: number; clave: string; nombre: string}) => ({
    id: String(row.id),
    clave: row.clave,
    nombre: row.nombre
    }));

    return NextResponse.json(grupos);

  } catch (error) {
    console.error("❌ Error en /api/groups:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
