import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // alumnoId (el ID numérico) es requerido por la FK en la tabla 'incidencia'
    const { alumnoId, grupoId, cantidad, motivo } = body; 

    if (!alumnoId || !grupoId || !cantidad || cantidad < 1) {
      return NextResponse.json({ error: 'Datos incompletos (alumnoId, grupoId, cantidad son requeridos)' }, { status: 400 });
    }

    // Obtenemos IDs necesarios para la tabla 'incidencia'
    // Asumimos que el profesor_id = 1 (debería venir de la sesión)
    const profesorId = 1; 
    const grupoData = await pool.query('SELECT materia_id FROM grupo WHERE id = $1', [grupoId]);
    if (grupoData.rows.length === 0) {
      return NextResponse.json({ error: 'Grupo no encontrado' }, { status: 404 });
    }
    const materiaId = grupoData.rows[0].materia_id;

    // Usamos una transacción para insertar todas las justificaciones
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      for (let i = 0; i < cantidad; i++) {
        await client.query(
          `INSERT INTO incidencia 
           (alumno_id, profesor_id, materia_id, grupo_id, tipo, fecha, descripcion)
           VALUES ($1, $2, $3, $4, 'JUSTIFICACION', NOW(), $5)`,
          [alumnoId, profesorId, materiaId, grupoId, motivo || 'Justificación manual por profesor']
        );
      }

      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e; // Lanza el error para que lo capture el catch principal
    } finally {
      client.release();
    }

    return NextResponse.json({ success: true, message: 'Faltas justificadas correctamente' });

  } catch (error) {
    console.error('Error justificando faltas:', error);
    return NextResponse.json({ error: 'Error interno al justificar las faltas' }, { status: 500 });
  }
}