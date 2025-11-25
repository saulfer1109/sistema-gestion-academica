"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, Users, Calendar, XCircle, CheckCircle, AlertTriangle, Search } from 'lucide-react';

// --- CONFIGURACIÓN DE COLORES ---
const AZUL_UNISON = "#16469B";
const FONDO_CLARO = "#F5F0FF";

type FiltroSeleccionado = 'Expediente' | 'Grupo' | 'Semestre';

// Tipos para los datos que vienen de la BD
type GrupoOption = {
  id: number;
  clave_grupo: string;
  materia_nombre: string;
  periodo: string;
};

type AlumnoResultado = {
  expediente: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  calificacion: number | null;
};

export default function ConsultarCalificaciones() {
  const [filtro, setFiltro] = useState<FiltroSeleccionado>('Expediente');
  const router = useRouter();

  // Estados de Inputs
  const [expediente, setExpediente] = useState('');
  const [grupoSeleccionado, setGrupoSeleccionado] = useState('');
  
  // Estados de Datos (Listas y Resultados)
  const [listaGrupos, setListaGrupos] = useState<GrupoOption[]>([]);
  const [resultadosTabla, setResultadosTabla] = useState<AlumnoResultado[] | null>(null);

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState<'success' | 'error' | null>(null);
  const [mensajeError, setMensajeError] = useState('');

  // --- EFECTO: Cargar lista de grupos al montar o cambiar filtro ---
  useEffect(() => {
    if (filtro === 'Grupo') {
      const fetchGrupos = async () => {
        try {
          const res = await fetch('/api/grupos'); // Llama a tu API real
          if (res.ok) {
            const data = await res.json();
            setListaGrupos(data);
          } else {
            console.error("Error cargando grupos");
          }
        } catch (error) {
          console.error("Error de red", error);
        }
      };
      fetchGrupos();
    }
  }, [filtro]);

  const handleFiltroClick = (f: FiltroSeleccionado) => {
    setFiltro(f);
    setExpediente('');
    setGrupoSeleccionado('');
    setResultadosTabla(null); // Limpiar tabla anterior
    setMensajeError('');
    setModalVisible(null);
  };

  // --- LÓGICA 1: Consultar por EXPEDIENTE (Redirección) ---
  const handleConsultarExpediente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expediente.trim() || !/^\d+$/.test(expediente)) {
        setMensajeError('Ingrese un expediente válido (solo números).');
        setModalVisible('error');
        return;
    }
    setLoading(true);
    // Simulación de redirección (puedes descomentar tu fetch real aquí)
    setTimeout(() => {
        setLoading(false);
        router.push(`/alumno/${expediente}`);
    }, 1000);
  };

  // --- LÓGICA 2: Consultar por GRUPO (Mostrar Tabla) ---
  const handleConsultarGrupo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grupoSeleccionado) {
        setMensajeError('Por favor selecciona un grupo.');
        setModalVisible('error');
        return;
    }

    setLoading(true);
    setResultadosTabla(null); // Limpiar tabla previa

    try {
      const res = await fetch(`/api/grupos/${grupoSeleccionado}`);
      if (!res.ok) throw new Error('Error al obtener datos del grupo');
      
      const data = await res.json();
      setResultadosTabla(data); // Guardamos los datos para mostrar la tabla

    } catch (err: any) {
      setMensajeError(err.message);
      setModalVisible('error');
    } finally {
      setLoading(false);
    }
  };

  const commonClasses = "bg-white p-8 rounded-xl shadow-lg mt-6 max-w-3xl mx-auto border border-gray-200";
  const labelClasses = "block text-sm font-semibold text-gray-700 mb-2";
  const inputClasses = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-700";
  const buttonClasses = "w-full py-3 mt-6 bg-[#16469B] hover:bg-[#0f357a] text-white font-bold rounded-lg transition-colors shadow-md flex justify-center items-center";

  // --- RENDERIZADO DE FORMULARIOS ---
  const renderFormulario = useCallback(() => {
    switch (filtro) {
      case 'Expediente':
        return (
          <div className={commonClasses}>
            <h3 className="text-xl font-bold mb-6 text-[#16469B]">Buscar por Expediente</h3>
            <form onSubmit={handleConsultarExpediente}>
              <div className="mb-2">
                <label className={labelClasses}>Número de Expediente</label>
                <input
                  type="text"
                  value={expediente}
                  onChange={(e) => setExpediente(e.target.value)}
                  placeholder="Ej: 202000123"
                  className={inputClasses}
                />
              </div>
              <button type="submit" className={buttonClasses} disabled={loading}>
                {loading ? 'Buscando...' : 'Consultar'}
              </button>
            </form>
          </div>
        );

      case 'Grupo':
        return (
          <div className={commonClasses}>
            <h3 className="text-xl font-bold mb-6 text-[#16469B]">Buscar por Grupo</h3>
            <form onSubmit={handleConsultarGrupo}>
              <div>
                <label className={labelClasses}>Selecciona un Grupo Actual</label>
                <select 
                    className={inputClasses}
                    value={grupoSeleccionado}
                    onChange={(e) => setGrupoSeleccionado(e.target.value)}
                >
                  <option value="">-- Seleccionar Grupo --</option>
                  {/* Mapeo dinámico de la base de datos */}
                  {listaGrupos.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.clave_grupo} - {g.materia_nombre} ({g.periodo})
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className={buttonClasses} disabled={loading}>
                {loading ? 'Cargando Tabla...' : 'Ver Lista de Grupo'}
              </button>
            </form>
          </div>
        );
      
      case 'Semestre':
        return <div className={commonClasses}><p className="text-gray-500">Funcionalidad en desarrollo...</p></div>;

      default: return null;
    }
  }, [filtro, expediente, grupoSeleccionado, listaGrupos, loading]);


  // --- COMPONENTE DE TABLA DE RESULTADOS ---
  const renderTablaResultados = () => {
    if (!resultadosTabla) return null;

    if (resultadosTabla.length === 0) {
      return (
        <div className="max-w-4xl mx-auto mt-8 p-6 bg-yellow-50 rounded-xl border border-yellow-200 text-center">
            <p className="text-yellow-800 font-semibold">Este grupo no tiene alumnos registrados.</p>
        </div>
      );
    }

    return (
      <div className="max-w-5xl mx-auto mt-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-[#16469B] p-4 flex justify-between items-center">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <Users className="w-5 h-5"/> Lista de Alumnos del Grupo
                </h3>
                <span className="bg-blue-800 text-blue-100 text-xs px-3 py-1 rounded-full">
                    {resultadosTabla.length} Alumnos
                </span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-gray-600 font-bold text-sm">Expediente</th>
                            <th className="px-6 py-4 text-gray-600 font-bold text-sm">Nombre Completo</th>
                            <th className="px-6 py-4 text-gray-600 font-bold text-sm text-center">Calificación</th>
                            <th className="px-6 py-4 text-gray-600 font-bold text-sm text-center">Estatus</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {resultadosTabla.map((alumno) => (
                            <tr key={alumno.expediente} className="hover:bg-blue-50 transition-colors">
                                <td className="px-6 py-4 text-gray-700 font-medium font-mono">{alumno.expediente}</td>
                                <td className="px-6 py-4 text-gray-800">
                                    {alumno.apellido_paterno} {alumno.apellido_materno} {alumno.nombre}
                                </td>
                                <td className="px-6 py-4 text-center font-bold text-gray-700">
                                    {alumno.calificacion !== null ? alumno.calificacion : '-'}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {alumno.calificacion !== null && Number(alumno.calificacion) >= 60 ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Aprobado
                                        </span>
                                    ) : alumno.calificacion !== null ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                            Reprobado
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            Cursando
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: FONDO_CLARO }}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-2 text-[#16469B]">Consultar Calificaciones</h2>
        <p className="text-gray-600 mb-8 text-lg">Seleccione el filtro de consulta:</p>

        {/* --- TARJETAS DE FILTRO --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <button onClick={() => handleFiltroClick('Expediente')} 
                className={`group relative flex flex-col items-start p-6 rounded-xl border-2 transition-all duration-200 text-left h-40 ${filtro === 'Expediente' ? 'bg-white border-blue-500 ring-4 ring-blue-100 shadow-xl' : 'bg-white border-gray-200 hover:border-blue-300'}`}>
                <User className={`w-10 h-10 mb-3 ${filtro === 'Expediente' ? 'text-[#16469B]' : 'text-[#FFD100]'}`} />
                <span className="text-xl font-bold text-[#16469B]">Por Expediente</span>
            </button>

            <button onClick={() => handleFiltroClick('Grupo')} 
                className={`group relative flex flex-col items-start p-6 rounded-xl border-2 transition-all duration-200 text-left h-40 ${filtro === 'Grupo' ? 'bg-white border-blue-500 ring-4 ring-blue-100 shadow-xl' : 'bg-white border-gray-200 hover:border-blue-300'}`}>
                <Users className={`w-10 h-10 mb-3 ${filtro === 'Grupo' ? 'text-[#16469B]' : 'text-[#FFD100]'}`} />
                <span className="text-xl font-bold text-[#16469B]">Por Grupo</span>
            </button>

            <button onClick={() => handleFiltroClick('Semestre')} 
                className={`group relative flex flex-col items-start p-6 rounded-xl border-2 transition-all duration-200 text-left h-40 ${filtro === 'Semestre' ? 'bg-white border-blue-500 ring-4 ring-blue-100 shadow-xl' : 'bg-white border-gray-200 hover:border-blue-300'}`}>
                <Calendar className={`w-10 h-10 mb-3 ${filtro === 'Semestre' ? 'text-[#16469B]' : 'text-[#FFD100]'}`} />
                <span className="text-xl font-bold text-[#16469B]">Por Semestre</span>
            </button>
        </div>

        {/* --- FORMULARIO --- */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderFormulario()}
        </div>

        {/* --- TABLA DE RESULTADOS --- */}
        {renderTablaResultados()}

        {/* --- MODAL ERROR --- */}
        {modalVisible === 'error' && (
             <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
                <div className="bg-white rounded-xl p-6 shadow-2xl max-w-sm w-full">
                    <h3 className="text-red-600 font-bold flex items-center gap-2 mb-4"><AlertTriangle/> Error</h3>
                    <p>{mensajeError}</p>
                    <button onClick={() => setModalVisible(null)} className="mt-4 w-full bg-red-600 text-white py-2 rounded-lg font-bold">Cerrar</button>
                </div>
             </div>
        )}
      </div>
    </div>
  );
}