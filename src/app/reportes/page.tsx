// src/app/reportes/page.tsx

'use client';

import { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';

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
    // Estado para mostrar el detalle de un alumno seleccionado
    const [selectedStudent, setSelectedStudent] = useState<EligibleStudent | null>(null);
    
    // Simulación de datos adicionales para el perfil de detalle (PR6.7)
    const [progress, setProgress] = useState(45); // Ejemplo
    const [kardexAverage, setKardexAverage] = useState(90); // Ejemplo

    // PR6.6: Llama a la API para obtener alumnos
    const handleGenerateReport = useCallback(async () => {
        if (!selectedReportType) return;

        setIsLoading(true);
        setError(null);
        setStudents([]);
        setSelectedStudent(null); // Limpiar detalle al consultar

        try {
            const res = await fetch(`/api/reports/eligibility?type=${selectedReportType}`);
            
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || `Error al cargar el reporte: ${res.status}`);
            }

            const data: EligibleStudent[] = await res.json();
            setStudents(data);

        } catch (err: any) {
            setError(err.message || 'Error desconocido al generar el reporte.');
        } finally {
            setIsLoading(false);
        }
    }, [selectedReportType]);

    // Función que simula la determinación de "Candidato" para el diseño del perfil
    const isCandidate = (student: EligibleStudent) => {
        // En el diseño, es un ejemplo. Aquí usamos el criterio del 70% de créditos.
        const CREDITOS_CARRERA = 393;
        const CREDITOS_MINIMOS = Math.ceil(CREDITOS_CARRERA * 0.70);
        return student.creditos_aprobados >= CREDITOS_MINIMOS; 
    }

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
                            <p className="text-gray-600">Progreso: <span className="font-medium">{progress}% de 393 Créditos</span></p>
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
                        {/* ... otros radios si son necesarios ... */}
                    </div>
                </div>

                {/* Mostrar lista de alumnos en tarjetas */}
                <div className="mt-8">
                    {error && <div className="text-center p-4 text-red-600 border border-red-300 bg-red-50 rounded-md">{error}</div>}
                    
                    {students.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {students.map((student) => (
                                <div 
                                    key={student.matricula}
                                    onClick={() => setSelectedStudent(student)} // Al hacer clic, muestra el detalle
                                    className={`p-4 rounded-lg shadow-md cursor-pointer transition transform hover:scale-[1.02] ${
                                        isCandidate(student) ? 'bg-yellow-500 text-white' : 'bg-white text-gray-800 border border-gray-200'
                                    }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 flex items-center justify-center bg-purple-200 text-purple-800 font-bold rounded-full">
                                            A {/* Simula la inicial del alumno */}
                                        </div>
                                        <div>
                                            <p className="font-semibold">{student.nombre_completo}</p>
                                            <p className="text-sm">{student.matricula}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                {/* Botón para Exportar PDF (PR6.3) - Abajo como en el diseño */}
                {students.length > 0 && (
                    <div className="flex justify-end mt-6">
                        <button
                            className="py-2 px-4 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition disabled:opacity-50"
                            disabled
                            title="Funcionalidad de exportación pendiente (PR6.3)"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Descargar PDF
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}