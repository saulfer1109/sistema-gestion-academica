// src/app/calificaciones/alumnos-por-grupo/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';

// Interfaz para el Dropdown (Grupo)
interface Grupo { 
    id: string; // ID de BD (num) como string
    clave: string; 
    nombre: string; 
}

// Interfaz para la Tabla (Alumno - PR9.7)
interface AlumnoGrupo {
    expediente: string;
    matricula: string;
    nombreCompleto: string;
    correo: string;
    estadoAcademico: string; // (Ej: Activo, Baja Temporal, Activo)
}

export default function AlumnosPorGrupoPage() {
    const [grupos, setGrupos] = useState<Grupo[]>([]);
    const [grupoId, setGrupoId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingGrupos, setIsLoadingGrupos] = useState(true);
    const [alumnos, setAlumnos] = useState<AlumnoGrupo[]>([]);
    const [filtroTexto, setFiltroTexto] = useState<string>(''); // PR9.3: Filtro
    const [hasConsultado, setHasConsultado] = useState(false);

    // 1. Cargar grupos (dropdown) al montar la página
    useEffect(() => {
        const fetchGrupos = async () => {
            try {
                // Llama a la API que lista los grupos asignados al profesor
                const res = await fetch('/api/groups'); 
                const data: Grupo[] = await res.json();
                setGrupos(data);
                if (data.length > 0) {
                    setGrupoId(data[0].id); // Seleccionar el primer grupo por defecto
                }
            } catch (e) {
                console.error("Error al cargar grupos", e);
                alert("No se pudieron cargar los grupos asignados al profesor.");
            } finally {
                setIsLoadingGrupos(false);
            }
        };
        fetchGrupos();
    }, []);

    // 2. Función 'consultar' (PR9.2 y PR9.6)
    const consultar = async () => {
        if (!grupoId) {
            alert("Por favor, seleccione un grupo.");
            return;
        }
        setHasConsultado(true);
        setIsLoading(true);
        setAlumnos([]); // Limpiar la lista anterior
        try {
            // Llama al Route Handler con la URL /api/student-groups
            const res = await fetch(`/api/student-groups?grupoId=${grupoId}`);
            
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Error al cargar datos del grupo. El profesor no tiene permiso o el grupo no existe.');
            }
            
            const data: AlumnoGrupo[] = await res.json();
            setAlumnos(data);
            
        } catch (err: any) {
            console.error(err);
            alert(err.message || "Error cargando alumnos.");
        } finally {
            setIsLoading(false);
        }
    };

    // 3. PR9.3: Lógica de filtrado en el FrontEnd (por nombre o expediente)
    const alumnosFiltrados = useMemo(() => {
        if (!filtroTexto) return alumnos;
        const texto = filtroTexto.toLowerCase();
        
        return alumnos.filter(alumno => 
            alumno.nombreCompleto.toLowerCase().includes(texto) ||
            alumno.expediente.toLowerCase().includes(texto) ||
            alumno.matricula.toLowerCase().includes(texto) 
        );
    }, [alumnos, filtroTexto]);

    // 4. Efecto para consultar si el grupoId cambia
    useEffect(() => {
        if (hasConsultado) consultar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [grupoId]);


    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* PR9.1: Encabezado de página */}
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Lista de Alumnos por Grupo</h1>

                {/* Tarjeta de filtros */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        
                        {/* Dropdown de Grupo */}
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Grupo Asignado</label>
                            <select
                                value={grupoId}
                                onChange={(e) => setGrupoId(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-72"
                                disabled={isLoading || isLoadingGrupos}
                            >
                                {isLoadingGrupos ? (
                                    <option>Cargando grupos...</option>
                                ) : (
                                    grupos.map((g) => (
                                        <option key={g.id} value={g.id}>({g.clave}) - {g.nombre}</option>
                                    ))
                                )}
                            </select>
                        </div>

                        {/* Botón de Consultar */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={consultar}
                                disabled={isLoading || isLoadingGrupos || !grupoId}
                                className="inline-flex items-center gap-2 py-2 px-6 rounded-md font-medium transition disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700"
                            >
                                <Search size={16} />
                                {isLoading ? 'Consultando…' : 'Consultar Lista'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* PR9.2: Tarjeta de tabla y PR9.3: Filtro de Texto */}
                {hasConsultado && (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden p-6">
                         <div className="mb-4">
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Filtrar Alumnos (Nombre, Expediente o Matrícula)</label>
                            <input
                                type="text"
                                value={filtroTexto}
                                onChange={(e) => setFiltroTexto(e.target.value)}
                                placeholder="Escribe nombre, expediente o matrícula..."
                                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-96"
                                disabled={isLoading}
                            />
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {['Expediente', 'Matrícula', 'Nombre Completo', 'Correo', 'Estado Académico'].map((th) => (
                                            <th 
                                                key={th} 
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                {th}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {isLoading ? (
                                        <tr><td colSpan={5} className="p-10 text-center text-sm text-gray-500">Cargando alumnos...</td></tr>
                                    ) : alumnosFiltrados.length === 0 ? (
                                        <tr><td colSpan={5} className="p-10 text-center text-sm text-gray-500">No se encontraron alumnos para este grupo o no cumplen con el filtro.</td></tr>
                                    ) : (
                                        alumnosFiltrados.map((alumno) => (
                                            <tr key={alumno.expediente}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{alumno.expediente}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{alumno.matricula}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{alumno.nombreCompleto}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">{alumno.correo}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${alumno.estadoAcademico === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {alumno.estadoAcademico}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}