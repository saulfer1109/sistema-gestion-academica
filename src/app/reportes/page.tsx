'use client';

import { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';

// 🚨 CORRECCIÓN 1: Importamos jsPDF. Ya no necesitamos la importación del plugin global aquí.
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Nota: La instalación 'npm install jspdf jspdf-autotable' es OBLIGATORIA.
// ------------------------------------------------

// Tipo de dato del alumno (coincide con la salida de la API)
interface EligibleStudent {
    nombre_completo: string;
    matricula: string;
    correo: string;
    creditos_aprobados: number;
    estado_academico: 'ACTIVO' | 'INACTIVO' | 'BAJA' | 'EGRESADO';
    plan_estudio_nombre: string;
    grupo_actual: string;
}

const REPORT_TYPES = ['Practicas Profesionales', 'Servicio Social'] as const;
type ReportType = typeof REPORT_TYPES[number];


export default function ReportesPage() {
    const [selectedReportType, setSelectedReportType] = useState<ReportType>('Servicio Social');
    const [students, setStudents] = useState<EligibleStudent[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<EligibleStudent | null>(null);
    
    // Simulación de datos adicionales para el perfil de detalle (PR6.7)
    const [kardexAverage, setKardexAverage] = useState(90); 

    // PR6.6: Llama a la API para obtener alumnos
    const handleGenerateReport = useCallback(async () => {
        if (!selectedReportType) return;

        setIsLoading(true);
        setError(null);
        setStudents([]);
        setSelectedStudent(null); 

        try {
            const res = await fetch(`/api/reports/eligibility?type=${selectedReportType}`);
            
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || `Error al cargar el reporte: ${res.status}`);
            }

            const data: EligibleStudent[] = await res.json();
            setStudents(data);

        } catch (err: any) {
            // Este catch manejará el error de DB si la conexión se establece
            setError(err.message || 'Error desconocido al generar el reporte.');
        } finally {
            setIsLoading(false);
        }
    }, [selectedReportType]);

    // Función que simula la determinación de "Candidato"
    const isCandidate = (student: EligibleStudent) => {
        const CREDITOS_CARRERA = 393;
        const CREDITOS_MINIMOS = Math.ceil(CREDITOS_CARRERA * 0.70);
        return student.creditos_aprobados >= CREDITOS_MINIMOS; 
    }

    // **********************************************
    // PR6.3: Lógica para generar y descargar el PDF
    // **********************************************
const generatePDFReport = useCallback(() => {
  if (students.length === 0) {
    alert("No hay alumnos para exportar.");
    return;
  }

  // 1️⃣ Crear documento PDF
  const doc = new jsPDF('p', 'mm', 'a4');
  let yOffset = 15;

  // 2️⃣ Encabezado institucional
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('UNIVERSIDAD DE SONORA', 105, yOffset, { align: 'center' });
  yOffset += 7;

  doc.setFontSize(10);
  doc.text(`Reporte de Elegibilidad - ${selectedReportType}`, 105, yOffset, { align: 'center' });
  yOffset += 5;

  doc.setFontSize(8);
  doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-MX')}`, 200, 10, { align: 'right' });
  yOffset += 10;

  // 3️⃣ Detalle general del reporte
  doc.setFontSize(10);
  doc.text('Plan de Estudio Base: IS-UNISON (393 Créditos)', 14, yOffset);
  yOffset += 5;
  doc.text('Créditos Mínimos Requeridos (70%): 275 Créditos', 14, yOffset);
  yOffset += 10;

  // 4️⃣ Construir tabla con los datos
  const tableColumn = [
    'Nombre del Alumno',
    'Expediente',
    'Carrera',
    'Créditos Aprobados',
    'Estado Académico',
    'Promedio'
  ];

  const tableRows = students.map(student => [
    student.nombre_completo,
    student.matricula,
    student.plan_estudio_nombre,
    student.creditos_aprobados.toString(),
    student.estado_academico,
    kardexAverage.toString()
  ]);

  // 5️⃣ Generar la tabla
  autoTable(doc, {
    startY: yOffset,
    head: [tableColumn],
    body: tableRows,
    theme: 'striped',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 10, right: 10 },
  });

  // 6️⃣ Descargar
  const fileName = `Reporte_${selectedReportType.replace(/\s/g, '_')}.pdf`;
  doc.save(fileName);
}, [students, selectedReportType, kardexAverage]);


    // Si hay un alumno seleccionado, muestra la vista de detalle
    if (selectedStudent) {
        const candidateStatus = isCandidate(selectedStudent) ? "Sí es candidato" : "No es candidato";
        const statusColor = isCandidate(selectedStudent) ? "text-green-600" : "text-red-600";

        // Vista detallada del perfil (similar a image_96d518.png)
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">Detalle de Candidato - {selectedStudent.nombre_completo}</h1>
                    
                    <div className="flex items-start space-x-8">
                        {/* Avatar */}
                        <div className="w-48 h-48 relative flex-shrink-0 bg-purple-100 rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                        </div>
                        
                        {/* Info */}
                        <div className="space-y-3 pt-5">
                            <h2 className="text-xl font-bold text-gray-900">{selectedStudent.nombre_completo}</h2>
                            <p className="text-gray-600">Expediente: <span className="font-medium">{selectedStudent.matricula}</span></p>
                            <p className="text-gray-600">Carrera: <span className="font-medium">{selectedStudent.plan_estudio_nombre}</span></p>
                            <p className="text-gray-600">Progreso: <span className="font-medium">{selectedStudent.creditos_aprobados} Créditos ({Math.round((selectedStudent.creditos_aprobados / 393) * 100)}%)</span></p>
                            <p className="text-gray-600">Promedio de kardex: <span className="font-medium">{kardexAverage}</span></p>
                            <p className={`font-bold text-lg ${statusColor}`}>Estado: {candidateStatus}</p>
                            
                            <button 
                                onClick={() => setSelectedStudent(null)} 
                                className="mt-4 py-2 px-6 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition"
                            >
                                ← Atrás
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
    // Vista de listado (similar a image_96d464.png)
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Reportes Académicos</h1>

                {/* PR6.1: Interfaz para seleccionar el tipo de reporte */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex space-x-4 items-end">
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Tipo de Reporte</label>
                            <select
                                value={selectedReportType}
                                onChange={(e) => setSelectedReportType(e.target.value as ReportType)}
                                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={isLoading}
                            >
                                {REPORT_TYPES.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                        
                        <button
                            onClick={handleGenerateReport}
                            disabled={isLoading}
                            className={`py-2 px-6 rounded-md font-medium transition disabled:opacity-50 ${
                                selectedReportType 
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-400 text-white cursor-not-allowed'
                            }`}
                        >
                            {isLoading ? 'Consultando...' : 'Consultar'}
                        </button>
                    </div>
                    
                    {/* Filtros de estado (similar a Todos, Candidato, etc.) */}
                    <div className="mt-4 space-x-4">
                        <label className="inline-flex items-center">
                            <input type="radio" className="form-radio" name="status" value="Todos" defaultChecked />
                            <span className="ml-2 text-sm font-medium text-gray-700">Todos</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input type="radio" className="form-radio" name="status" value="Candidato" />
                            <span className="ml-2 text-sm font-medium text-gray-700">Candidato</span>
                        </label>
                    </div>
                </div>

                {/* Mostrar lista de alumnos en tarjetas */}
                <div className="mt-8">
                    {error && <div className="text-center p-4 text-red-600 border border-red-300 bg-red-50 rounded-md">{error}</div>}
                    
                    {students.length > 0 && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {students.map((student) => (
                                    <div 
                                        key={student.matricula}
                                        onClick={() => setSelectedStudent(student)} 
                                        className={`p-4 rounded-lg shadow-md cursor-pointer transition transform hover:scale-[1.02] ${
                                            isCandidate(student) ? 'bg-yellow-500 text-white' : 'bg-white text-gray-800 border border-gray-200'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 flex items-center justify-center bg-purple-200 text-purple-800 font-bold rounded-full">
                                                {student.nombre_completo.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold">{student.nombre_completo}</p>
                                                <p className="text-sm">{student.matricula}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Botón para Exportar PDF (PR6.3) */}
                            <div className="flex justify-end mt-6">
                                <button
                                    onClick={generatePDFReport}
                                    className="py-2 px-4 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    Descargar PDF
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
