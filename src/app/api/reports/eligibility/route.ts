// src/app/api/reports/eligibility/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getEligibleStudents } from "@/app/lib/reports"; 

type ReportType = 'Practicas Profesionales' | 'Servicio Social';

/**
 * PR6.4: Valida el tipo de reporte.
 * Llama a PR6.6 para obtener los datos.
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const reportType = searchParams.get('type') as ReportType | null;

        // PR6.4: Validación del tipo de reporte
        if (!reportType || (reportType !== 'Practicas Profesionales' && reportType !== 'Servicio Social')) {
            return NextResponse.json(
                { error: "Parámetro 'type' (tipo de reporte) inválido. Debe ser 'Practicas Profesionales' o 'Servicio Social'." },
                { status: 400 }
            );
        }

        // PR6.6: Consultar alumnos
        const students = await getEligibleStudents(reportType);

        // PR6.7: Devolver la lista
        return NextResponse.json(students);
        
    } catch (error) {
        return NextResponse.json(
            { error: "Error interno al procesar el reporte de elegibilidad." },
            { status: 500 }
        );
    }
}