'use client';

import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';

// ... (Tipos e interfaces se mantienen igual) ...
type Semaforo = 'ok' | 'warning' | 'danger';

interface Grupo { 
  id: string; 
  clave: string; 
  nombre: string; 
}

interface AlumnoFaltas {
  id: number;
  expediente: string;
  nombreCompleto: string;
  faltas: number;
  faltasPermitidas: number;
}

const getSemaforo = (faltas: number, permitidas: number): Semaforo => {
  if (permitidas <= 0) return 'ok';
  const r = faltas / permitidas;
  if (r >= 0.75) return 'danger';
  if (r >= 0.5) return 'warning';
  return 'ok';
};

export default function AlertasFaltasPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [grupoId, setGrupoId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingGrupos, setIsLoadingGrupos] = useState(true);
  const [rows, setRows] = useState<AlumnoFaltas[]>([]);
  const [hasConsultado, setHasConsultado] = useState(false);

  // Modales
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAlumno, setSelectedAlumno] = useState<AlumnoFaltas | null>(null);
  const [justificarCount, setJustificarCount] = useState<number>(1);
  const [motivo, setMotivo] = useState<string>('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  // 1. Cargar grupos asignados al profesor
  useEffect(() => {
    const fetchGrupos = async () => {
      // 🟢 OBTENER USUARIO DEL LOCALSTORAGE
      const storedUser = localStorage.getItem('user');
      if (!storedUser) return; // O redirigir a login

      try {
        const user = JSON.parse(storedUser);
        const profesorId = user.profesorId; // Este ID viene del login corregido

        // 🟢 ENVIAR ID EN LA PETICIÓN
        const res = await fetch(`/api/groups?profesorId=${profesorId}`);
        
        if (!res.ok) throw new Error("Error al cargar grupos");
        
        const data: Grupo[] = await res.json();
        setGrupos(data);
        
        if (data.length > 0) {
          setGrupoId(data[0].id);
        }
      } catch (e) {
        console.error("Error al cargar grupos", e);
        // alert("No se pudieron cargar sus grupos asignados.");
      } finally {
        setIsLoadingGrupos(false);
      }
    };
    fetchGrupos();
  }, []);

  const consultar = async () => {
    if (!grupoId) {
      alert("Por favor, seleccione un grupo.");
      return;
    }
    setHasConsultado(true);
    setIsLoading(true);
    try {
      const res = await fetch(`/api/attendance/alerts?grupoId=${grupoId}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al cargar datos');
      }
      const data: AlumnoFaltas[] = await res.json();
      setRows(data);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error cargando alumnos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJustificar = async () => {
    if (!selectedAlumno || justificarCount < 1) return;
    
    // Obtener ID de profesor para la justificación también (opcional, el backend de justify ya lo quemaba a 1, pero idealmente debería ser dinámico)
    // Por ahora mantenemos la lógica visual
    try {
      const res = await fetch('/api/attendance/justify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alumnoId: selectedAlumno.id,
          grupoId: grupoId,
          cantidad: justificarCount,
          motivo: motivo
        })
      });

      if (res.ok) {
        setModalOpen(false);
        setConfirmOpen(true);
        consultar(); 
      } else {
        const err = await res.json();
        alert(err.error || "Error al justificar");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión al justificar.");
    }
  };

  // ... (El resto del renderizado se mantiene idéntico) ...
  // Solo asegúrate de copiar el resto del return del archivo original si lo necesitas completo
  // Aquí resumo la parte del return para no hacer la respuesta gigante, ya que no cambia.
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Alerta por faltas</h1>

        {/* Tarjeta de filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Mis Grupos</label>
              <select
                value={grupoId}
                onChange={(e) => setGrupoId(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
                disabled={isLoading || isLoadingGrupos}
              >
                {isLoadingGrupos ? (
                  <option>Cargando mis grupos...</option>
                ) : grupos.length === 0 ? (
                  <option>No tiene grupos asignados</option>
                ) : (
                  grupos.map((g) => (
                    <option key={g.id} value={g.id}>{g.clave} - {g.nombre}</option>
                  ))
                )}
              </select>
            </div>

            <button
              onClick={consultar}
              disabled={isLoading || isLoadingGrupos || grupos.length === 0}
              className="inline-flex items-center gap-2 py-2 px-6 rounded-md font-medium transition disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700"
            >
              <Search size={16} />
              {isLoading ? 'Consultando…' : 'Consultar'}
            </button>
          </div>
        </div>

        {/* Tabla de Resultados (Misma lógica visual) */}
        {hasConsultado && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
             {/* ... Header y Body de la tabla original ... */}
             <div className="grid grid-cols-[140px_minmax(320px,1fr)_120px_160px_120px] border-b bg-gray-100 text-gray-700">
              {['Expediente', 'Nombre', 'Faltas', 'Faltas Permitidas', 'Justificar'].map((th) => (
                <div key={th} className="px-4 py-3 text-sm font-semibold">{th}</div>
              ))}
            </div>
            <div className="max-h-[460px] overflow-y-auto">
              {rows.length === 0 ? (
                <div className="p-10 text-center text-sm text-gray-500">No hay registros para este grupo.</div>
              ) : (
                rows.map((alumno, idx) => {
                  const status = getSemaforo(alumno.faltas, alumno.faltasPermitidas);
                  return (
                    <div
                      key={`${alumno.expediente}-${idx}`}
                      className={`grid grid-cols-[140px_minmax(320px,1fr)_120px_160px_120px] items-center border-b ${idx % 2 ? 'bg-gray-50' : 'bg-white'}`}
                      style={{ minHeight: 48 }}
                    >
                        {/* Celdas de la tabla idénticas al original */}
                        <div className="px-4 py-3 text-sm text-gray-900 tabular-nums">{alumno.expediente}</div>
                        <div className="px-4 py-3 text-sm text-gray-900 truncate">{alumno.nombreCompleto}</div>
                        <div className="px-4 py-3 text-sm text-gray-900 flex items-center gap-2">
                            {/* ... semáforo ... */}
                            <span className={`inline-block h-2.5 w-2.5 rounded-full ${status === 'ok' ? 'bg-emerald-500' : status === 'warning' ? 'bg-amber-500' : 'bg-rose-600'}`} />
                            {alumno.faltas}
                        </div>
                        <div className="px-4 py-3 text-sm text-gray-900">{alumno.faltas}/{alumno.faltasPermitidas}</div>
                        <div className="px-4 py-2">
                            <button
                                type="button"
                                className="inline-flex items-center gap-1.5 rounded-md border border-blue-600 px-2.5 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-50"
                                onClick={() => {
                                    setSelectedAlumno(alumno);
                                    setJustificarCount(1);
                                    setMotivo('');
                                    setModalOpen(true);
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                            </button>
                        </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Modales (sin cambios en su estructura, solo renderizado) */}
        {modalOpen && selectedAlumno && (
             /* ... Copiar el modal de justificación del código original ... */
             <div className="fixed inset-0 z-50" aria-modal="true" role="dialog">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" onClick={() => setModalOpen(false)} />
                <div className="absolute inset-0 flex items-center justify-center p-4">
                    <div className="relative w-full max-w-[640px] rounded-xl bg-white shadow-2xl">
                        {/* Header Modal */}
                        <div className="flex items-center gap-3 border-b px-6 py-4">
                            <h2 className="text-lg font-semibold text-gray-800">Motivo de Justificación</h2>
                            <button className="ml-auto text-gray-500" onClick={() => setModalOpen(false)}><X size={18} /></button>
                        </div>
                        {/* Body Modal */}
                        <div className="px-6 py-4">
                            <p className="text-sm">Alumno: {selectedAlumno.nombreCompleto}</p>
                            <div className="mt-4 flex items-center gap-2">
                                <label className="text-sm font-medium">Justificar:</label>
                                <input type="number" min={1} max={selectedAlumno.faltas} value={justificarCount} onChange={(e) => setJustificarCount(Number(e.target.value))} className="h-8 w-12 border rounded text-center" />
                                <span className="text-sm">Faltas</span>
                            </div>
                            <div className="mt-3">
                                <label className="mb-1 block text-sm font-medium">Motivo:</label>
                                <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} rows={4} className="w-full border rounded p-2 text-sm" placeholder="Ej: Receta médica" />
                            </div>
                        </div>
                        {/* Footer Modal */}
                        <div className="flex justify-between px-6 pb-4">
                            <button className="border px-3 py-1 rounded" onClick={() => setModalOpen(false)}>Cancelar</button>
                            <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={handleJustificar}>Aceptar</button>
                        </div>
                    </div>
                </div>
             </div>
        )}

        {confirmOpen && (
            /* ... Copiar el modal de confirmación del código original ... */
            <div className="fixed inset-0 z-50 flex items-center justify-center" role="alertdialog">
                 <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" onClick={() => setConfirmOpen(false)} />
                 <div className="bg-white p-6 rounded-xl shadow-2xl z-10 max-w-sm">
                    <h2 className="text-lg font-bold mb-2 text-green-600">Éxito</h2>
                    <p>Justificación realizada correctamente.</p>
                    <button className="mt-4 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 w-full" onClick={() => setConfirmOpen(false)}>Aceptar</button>
                 </div>
            </div>
        )}
      </div>
    </div>
  );
}