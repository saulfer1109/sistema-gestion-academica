// src/app/api/upload-calificaciones/route.ts

import { NextResponse } from 'next/server';
import { procesarArchivoCalificaciones, CalificacionExcel } from '@/app/services/excel.service'; 

import { pool } from "@/app/lib/db"; 

const fs = require('fs');

export async function POST(request: Request) {
    let pgClient: any = null; 

    try {
        const data = await request.formData();
        const fileEntry = data.get('excel'); 
        
        if (!fileEntry || !(fileEntry instanceof File)) {
            return NextResponse.json({ mensaje: 'No se subió ningún archivo con el nombre "excel" o el formato es incorrecto.' }, { status: 400 });
        }
        
        const file = fileEntry as File;
        const fileBuffer = Buffer.from(await file.arrayBuffer());

        // PR7.2 y PR7.3: Leer y validar el archivo (usando la nueva lista de obligatorios)
        const calificacionesData = procesarArchivoCalificaciones({
            data: fileBuffer,
            name: file.name,
        });

        // B. PR7.4: Conexión y Escritura en la Base de Datos (Transacción)
        pgClient = await pool.connect(); 
        await pgClient.query('BEGIN'); 

        let totalActualizados = 0;
        const detalles: { fila: CalificacionExcel, error: string }[] = []; 
        
        for (const fila of calificacionesData) {
            try {
                // 1. Obtener KARDEX_ID y MATERIA_ID 
                const searchResult = await pgClient.query(`
                    SELECT
                        k.id AS kardex_id,
                        m.id AS materia_id
                    FROM
                        kardex k
                    JOIN
                        alumno a ON a.id = k.alumno_id
                    JOIN
                        materia m ON m.id = k.materia_id
                    JOIN
                        periodo p ON p.id = k.periodo_id
                    WHERE
                        a.matricula = $1 
                        AND m.codigo = $2 
                        AND p.etiqueta = $3
                `, [fila.matricula, fila.codigo_materia, fila.periodo]);

                if (searchResult.rows.length === 0) {
                    detalles.push({ fila, error: `No se encontró Kardex para Matrícula ${fila.matricula} en Materia ${fila.codigo_materia} y Periodo ${fila.periodo}.` });
                    continue;
                }

                const { kardex_id, materia_id } = searchResult.rows[0];
                
                // 2. PR7.4: Actualizar Calificación y Kardex
                const fechaCierre = fila.fecha_cierre || new Date().toISOString().slice(0, 10); 
                
                // Actualizar Calificación (6 parámetros)
                await pgClient.query(`
                    UPDATE calificacion
                    SET
                        ordinario = $1,
                        extraordinario = $2,
                        final = $3,
                        fecha_cierre = $4
                    WHERE
                        kardex_id = $5 AND materia_id = $6;
                `, [fila.ordinario, fila.extraordinario, fila.final, fechaCierre, kardex_id, materia_id]);

                // Actualizar Kardex (2 parámetros: 'estatus' e 'id')
                await pgClient.query(`
                    UPDATE kardex
                    SET
                        estatus = $1
                        -- COMENTARIO ELIMINADO
                    WHERE
                        id = $2;
                `, [
                    fila.estatus_kardex || null, // $1
                    kardex_id // $2
                ]);
                
                totalActualizados++;

            } catch (error: any) {
                console.error('Error al procesar fila:', error);
                detalles.push({ fila, error: `Error DB para la fila: ${error.message}` });
            }
        }
        
        await pgClient.query('COMMIT'); 
        
        const responseData = { totalActualizados, totalErrores: detalles.length, detalles };
        
        const status = detalles.length > 0 ? 202 : 200;
        return NextResponse.json({ 
            mensaje: `Proceso completado. Actualizados: ${totalActualizados}, Errores: ${detalles.length}.`,
            ...responseData
        }, { status });

    } catch (error: any) {
        if (pgClient) {
            await pgClient.query('ROLLBACK'); 
        }
        console.error('Error en el controlador (CRÍTICO):', error);
        return NextResponse.json({ 
            mensaje: error.message || 'Error interno del servidor al procesar el archivo.'
        }, { status: 400 });

    } finally {
        if (pgClient) {
            pgClient.release(); 
        }
    }
}