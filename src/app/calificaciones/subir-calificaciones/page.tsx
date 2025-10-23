// src/app/calificaciones/subir-excel/page.tsx
'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';

// Definiciones de interfaz para asegurar el tipado
interface CalificacionExcel {
    matricula: string;
    codigo_materia: string;
    periodo: string;
    // ... otros campos
}

interface ErrorDetail {
    fila: CalificacionExcel;
    error: string;
}

interface UploadResponse {
    mensaje: string;
    totalActualizados?: number;
    totalErrores?: number;
    detalles?: ErrorDetail[];
}

export default function UploadGradesPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [responseDetails, setResponseDetails] = useState<UploadResponse | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const uploadedFile = e.target.files[0];
            
            if (!uploadedFile.name.match(/\.(xlsx|xls)$/i)) {
                setError('Por favor, seleccione un archivo de Excel válido (.xlsx o .xls).');
                setFile(null);
            } else {
                setFile(uploadedFile);
                setError(null);
                setMessage(null);
                setResponseDetails(null);
            }
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        
        if (!file) {
            setError('Debe seleccionar un archivo para subir.');
            return;
        }

        setIsLoading(true);
        setMessage(null);
        setError(null);
        setResponseDetails(null);

        const formData = new FormData();
        formData.append('excel', file); 

        try {
            const res = await fetch('/api/upload-calificaciones', {
                method: 'POST',
                body: formData,
            });

            const data: UploadResponse = await res.json();
            
            // SOLUCIÓN DE DEPURACIÓN
            if (data.totalErrores && data.totalErrores > 0) {
                console.error("ERRORES DETALLADOS DE PROCESAMIENTO:", data.detalles);
            }
            
            if (!res.ok && res.status !== 202) {
                throw new Error(data.mensaje || 'Error desconocido al subir el archivo.');
            }

            setMessage(data.mensaje);
            setResponseDetails(data);
            setFile(null);

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Error de conexión con el servidor.');
        } finally {
            setIsLoading(false);
        }
    };

    const isSuccess = responseDetails && responseDetails.totalErrores === 0 && message && !error;
    const isWarning = responseDetails && responseDetails.totalErrores! > 0 && message && !error;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-8">
                
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h1 className="text-3xl font-bold text-gray-800">
                        PR7. Subir Calificaciones vía Excel
                    </h1>
                    <Link href="/" className="text-blue-600 hover:text-blue-800 transition">
                        ← Volver al inicio
                    </Link>
                </div>

                {/* Instrucciones de formato */}
                <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800">
                    <h3 className="font-semibold text-lg mb-2">Instrucciones y Formato de Archivo</h3>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>**No cambies los encabezados** de la hoja PLANTILLA (primera fila).</li>
                        <li>**Campos obligatorios:** <code className="bg-yellow-100 p-0.5 rounded font-mono">matricula</code>, <code className="bg-yellow-100 p-0.5 rounded font-mono">codigo\_materia</code>, <code className="bg-yellow-100 p-0.5 rounded font-mono">periodo</code>.</li>
                        <li>**Formato de fecha** para <code className="bg-yellow-100 p-0.5 rounded font-mono">fecha\_cierre</code>: <span className="font-mono">YYYY-MM-DD</span>.</li>
                        <li>**Rangos de calificaciones:** <span className="font-medium">0.00 - 100.00</span>.</li>
                        <li>Si una calificación no aplica, **deja la celda vacía**.</li>
                    </ol>
                    <p className="mt-4 font-semibold text-gray-700">Columnas esperadas (deben estar TODAS):</p>
                    <code className="block bg-yellow-100 p-2 mt-2 rounded font-mono text-sm overflow-x-auto">
                        matricula | nombre | apellido\_paterno | apellido\_materno | correo | codigo\_materia | periodo | ordinario | extraordinario | final | estatus\_kardex | fecha\_cierre | comentario
                    </code>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="file-upload" className="block text-lg font-medium text-gray-700 mb-2">
                            Seleccionar Archivo Excel
                        </label>
                        <input
                            id="file-upload"
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-blue-50 file:text-blue-700
                            hover:file:bg-blue-100"
                            disabled={isLoading}
                        />
                        {file && (
                            <p className="mt-2 text-sm text-gray-600">Archivo seleccionado: <span className="font-medium">{file.name}</span></p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition ${
                            (isLoading || !file) ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                        disabled={isLoading || !file}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Subiendo y Procesando...
                            </div>
                        ) : 'Subir y Procesar Calificaciones'}
                    </button>
                </form>

                {/* 3. Área de Mensajes y Resultados */}
                <div className="mt-8">
                    {error && (
                        <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-100 border border-red-300" role="alert">
                            <span className="font-medium">Error Crítico:</span> {error}
                        </div>
                    )}

                    {isSuccess && (
                        <div className="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-100 border border-green-300" role="alert">
                            <span className="font-medium">¡Proceso Exitoso!</span> {message}
                            <p className="mt-1 text-xs">Se actualizaron {responseDetails!.totalActualizados} calificaciones.</p>
                        </div>
                    )}
                    
                    {isWarning && (
                        <div className="p-4 mb-4 text-sm text-yellow-800 rounded-lg bg-yellow-100 border border-yellow-300" role="alert">
                            <span className="font-medium">Advertencia:</span> {message}
                            <p className="mt-1 text-xs">Actualizados: {responseDetails!.totalActualizados} | Errores: {responseDetails!.totalErrores}</p>
                            
                            {/* ESTE BLOQUE MUESTRA LOS DETALLES DEL ERROR SQL */}
                            {responseDetails!.detalles && responseDetails!.detalles.length > 0 && (
                                <div className="mt-3 max-h-40 overflow-y-auto p-2 bg-yellow-50 rounded-md border border-yellow-300">
                                    <p className="font-semibold underline">Detalles de Errores (FALLO DE BÚSQUEDA):</p>
                                    <ul className="list-disc list-inside text-xs space-y-1">
                                        {responseDetails!.detalles.map((detail, index) => (
                                            <li key={index} className="break-words">
                                                **Fila: {detail.fila.matricula}** ({detail.fila.codigo_materia}, {detail.fila.periodo}): <span className="font-bold text-red-700">{detail.error}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}