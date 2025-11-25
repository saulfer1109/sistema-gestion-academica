import { NextResponse } from 'next/server';
import { pool } from "@/app/lib/db";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const grupoId = params.id;

    // 1. Primero obtenemos los detalles del grupo para saber Materia y Periodo
    const grupoQuery = `SELECT materia_id, periodo_id FROM grupo WHERE id = $1`;
    const grupoRes = await pool.query(grupoQuery, [grupoId]);
    
    if (grupoRes.rows.length === 0) {
      return NextResponse.json({ error: 'Grupo no encontrado' }, { status: 404 });
    }

    const { materia_id, periodo_id } = grupoRes.rows[0];

    // 2. Buscamos en KARDEX los alumnos que coincidan con esa materia y periodo
    // y traemos sus datos de la tabla ALUMNO
    const alumnosQuery = `
      SELECT 
        a.expediente,
        a.nombre,
        a.apellido_paterno,
        a.apellido_materno,
        k.calificacion
      FROM kardex k
      JOIN alumno a ON k.alumno_id = a.id
      WHERE k.materia_id = $1 AND k.periodo_id = $2
      ORDER BY a.apellido_paterno ASC
    `;

    const alumnosRes = await pool.query(alumnosQuery, [materia_id, periodo_id]);

    return NextResponse.json(alumnosRes.rows);

  } catch (error) {
    console.error('Error obteniendo detalles del grupo:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}