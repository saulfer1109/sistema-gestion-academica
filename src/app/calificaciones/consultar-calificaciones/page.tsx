"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, Users, Calendar, AlertTriangle } from 'lucide-react';

// ... (Constantes y tipos se mantienen) ...
const AZUL_UNISON = "#16469B";
const FONDO_CLARO = "#F5F0FF";

type FiltroSeleccionado = 'Expediente' | 'Grupo' | 'Semestre';

type GrupoOption = {
  id: number;
  clave: string; // Ojo: la API devuelve "clave", mapeamos abajo
  nombre: string; // La API devuelve nombre completo
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

  // Estados
  const [expediente, setExpediente] = useState('');
  const [grupoSeleccionado, setGrupoSeleccionado] = useState('');
  const [listaGrupos, setListaGrupos] = useState<GrupoOption[]>([]);
  const [resultadosTabla, setResultadosTabla] = useState<AlumnoResultado[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState<'success' | 'error' | null>(null);
  const [mensajeError, setMensajeError] = useState('');

  // --- EFECTO: Cargar lista de grupos FILTRADA ---
  useEffect(() => {
    if (filtro === 'Grupo') {
      const fetchGrupos = async () => {
        // 🟢 OBTENER USUARIO
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            console.error("No hay sesión activa");
            return;
        }
        
        try {
          const user = JSON.parse(storedUser);
          // 🟢 PETICIÓN CON ID
          const res = await fetch(`/api/groups?profesorId=${user.profesorId}`);
          
          if (res.ok) {
            const data = await res.json();
            setListaGrupos(data);
          } else {
            console.error("Error cargando grupos asignados");
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
    setResultadosTabla(null);
    setMensajeError('');
    setModalVisible(null);
  };

  const handleConsultarExpediente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expediente.trim() || !/^\d+$/.test(expediente)) {
        setMensajeError('Ingrese un expediente válido (solo números).');
        setModalVisible('error');
        return;
    }
    setLoading(true);
    setTimeout(() => {
        setLoading(false);
        router.push(`/alumno/${expediente}`);
    }, 1000);
  };

  const handleConsultarGrupo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grupoSeleccionado) {
        setMensajeError('Por favor selecciona un grupo.');
        setModalVisible('error');
        return;
    }

    setLoading(true);
    setResultadosTabla(null);

    try {
      // Nota: Si este endpoint '/api/grupos/:id' aún no valida profesor, 
      // idealmente también debería validarlo, pero por ahora mostramos la tabla
      const res = await fetch(`/api/grupos/${grupoSeleccionado}`);
      if (!res.ok) throw new Error('Error al obtener datos del grupo');
      
      const data = await res.json();
      setResultadosTabla(data);

    } catch (err: any) {
      setMensajeError(err.message);
      setModalVisible('error');
    } finally {
      setLoading(false);
    }
  };

  // ... (Estilos y Renderizado del formulario se mantienen igual) ...
  // Resumen del renderizado para brevedad:

  const commonClasses = "bg-white p-8 rounded-xl shadow-lg mt-6 max-w-3xl mx-auto border border-gray-200";
  const buttonClasses = "w-full py-3 mt-6 bg-[#16469B] hover:bg-[#0f357a] text-white font-bold rounded-lg transition-colors shadow-md flex justify-center items-center";

  const renderFormulario = useCallback(() => {
    switch (filtro) {
      case 'Expediente':
        return (
          <div className={commonClasses}>
            <h3 className="text-xl font-bold mb-6 text-[#16469B]">Buscar por Expediente</h3>
            <form onSubmit={handleConsultarExpediente}>
              <div className="mb-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Número de Expediente</label>
                <input type="text" value={expediente} onChange={(e) => setExpediente(e.target.value)} placeholder="Ej: 202000123" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-700" />
              </div>
              <button type="submit" className={buttonClasses} disabled={loading}>{loading ? 'Buscando...' : 'Consultar'}</button>
            </form>
          </div>
        );

      case 'Grupo':
        return (
          <div className={commonClasses}>
            <h3 className="text-xl font-bold mb-6 text-[#16469B]">Buscar por Grupo</h3>
            <form onSubmit={handleConsultarGrupo}>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Selecciona un Grupo Actual</label>
                <select 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-700"
                    value={grupoSeleccionado}
                    onChange={(e) => setGrupoSeleccionado(e.target.value)}
                >
                  <option value="">-- Mis Grupos Asignados --</option>
                  {/* Renderizado ajustado a la respuesta de la API */}
                  {listaGrupos.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.clave ? `(${g.clave}) ` : ''}{g.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className={buttonClasses} disabled={loading}>{loading ? 'Cargando Tabla...' : 'Ver Lista de Grupo'}</button>
            </form>
          </div>
        );
      
      case 'Semestre':
        return <div className={commonClasses}><p className="text-gray-500">Funcionalidad en desarrollo...</p></div>;

      default: return null;
    }
  }, [filtro, expediente, grupoSeleccionado, listaGrupos, loading]);

  const renderTablaResultados = () => {
    if (!resultadosTabla) return null;
    // ... (Tabla idéntica al original) ...
    // Solo copio la estructura básica para referencia
    return (
        <div className="max-w-5xl mx-auto mt-10">
            <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="bg-[#16469B] p-4"><h3 className="text-white font-bold">Lista de Alumnos</h3></div>
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr><th className="px-6 py-4">Expediente</th><th className="px-6 py-4">Nombre</th><th className="px-6 py-4">Calificación</th></tr>
                    </thead>
                    <tbody>
                        {resultadosTabla.map(a => (
                            <tr key={a.expediente} className="hover:bg-blue-50">
                                <td className="px-6 py-4">{a.expediente}</td>
                                <td className="px-6 py-4">{a.nombre} {a.apellido_paterno}</td>
                                <td className="px-6 py-4">{a.calificacion ?? '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: FONDO_CLARO }}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-2 text-[#16469B]">Consultar Calificaciones</h2>
        {/* ... Botones de filtro ... */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <button onClick={() => handleFiltroClick('Expediente')} className={`p-6 rounded-xl border-2 ${filtro === 'Expediente' ? 'border-blue-500' : 'bg-white'}`}><User className="w-10 h-10 text-[#16469B] mb-2"/><span className="font-bold text-[#16469B]">Por Expediente</span></button>
            <button onClick={() => handleFiltroClick('Grupo')} className={`p-6 rounded-xl border-2 ${filtro === 'Grupo' ? 'border-blue-500' : 'bg-white'}`}><Users className="w-10 h-10 text-[#16469B] mb-2"/><span className="font-bold text-[#16469B]">Por Grupo</span></button>
            <button onClick={() => handleFiltroClick('Semestre')} className={`p-6 rounded-xl border-2 ${filtro === 'Semestre' ? 'border-blue-500' : 'bg-white'}`}><Calendar className="w-10 h-10 text-[#16469B] mb-2"/><span className="font-bold text-[#16469B]">Por Semestre</span></button>
        </div>

        {renderFormulario()}
        {renderTablaResultados()}
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