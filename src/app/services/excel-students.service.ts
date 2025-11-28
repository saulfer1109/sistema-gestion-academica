import * as XLSX from 'xlsx';

interface StudentExcelRow {
    expediente: string;
    nombre?: string;
}

export const parseStudentsFile = (buffer: Buffer) => {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convertimos a array de arrays para buscar la fila de cabecera
    const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

    // 1. Buscar en qué fila empieza la tabla (buscamos la celda que diga "Expediente")
    let headerRowIndex = -1;
    for (let i = 0; i < rawData.length; i++) {
        const row = rawData[i];
        // Buscamos si alguna celda de la fila contiene "Expediente"
        if (row.some((cell: any) => String(cell).trim().toLowerCase().includes('expediente'))) {
            headerRowIndex = i;
            break;
        }
    }

    if (headerRowIndex === -1) {
        throw new Error("No se encontró la columna 'Expediente' en el archivo.");
    }

    // 2. Volver a parsear usando esa fila como cabecera
    const jsonData = XLSX.utils.sheet_to_json(sheet, {
        range: headerRowIndex, // Empezar desde la fila encontrada
        defval: ""
    });

    // 3. Limpiar y validar datos
    const estudiantes: StudentExcelRow[] = [];

    for (const row of jsonData as any[]) {
        // Normalizar claves (a minúsculas) para evitar problemas
        const keys = Object.keys(row);
        const expedienteKey = keys.find(k => k.trim().toLowerCase() === 'expediente');
        const nombreKey = keys.find(k => k.trim().toLowerCase() === 'nombre');

        if (expedienteKey && row[expedienteKey]) {
            estudiantes.push({
                expediente: String(row[expedienteKey]).trim(),
                nombre: nombreKey ? String(row[nombreKey]).trim() : undefined
            });
        }
    }

    return estudiantes;
};