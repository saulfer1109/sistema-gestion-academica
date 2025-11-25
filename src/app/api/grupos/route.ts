import { NextResponse } from 'next/server';
// Asegúrate de importar tu conexión a BD. Ejemplo simulado con 'db':
import { pool } from "@/app/lib/db";

export async function GET() {
  try {
    // Consulta SQL basada en tu esquema:
    // Unimos GRUPO con MATERIA para mostrar el nombre de la materia (ej. "Física II")
    // y GRUPO con PERIODO para mostrar la etiqueta (ej. "2024-2")
    const query = `
      SELECT 
        g.id, 
        g.clave_grupo, 
        m.nombre as materia_nombre, 
        p.etiqueta as periodo
      FROM grupo g
      JOIN materia m ON g.materia_id = m.id
      JOIN periodo p ON g.periodo_id = p.id
      ORDER BY m.nombre ASC
    `;

    const result = await pool.query(query); // Ajusta esto a tu cliente de BD
    return NextResponse.json(result.rows);
    
  } catch (error) {
    console.error('Error obteniendo grupos:', error);
    return NextResponse.json({ error: 'Error al cargar grupos' }, { status: 500 });
  }
}