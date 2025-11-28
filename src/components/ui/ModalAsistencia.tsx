"use client";

import { useState } from "react";

interface Alumno {
  id: number; // ID real
  expediente: string;
  nombreCompleto: string;
}

interface ModalAsistenciaProps {
  onClose: () => void;
  onConfirm: () => void; // Solo para cerrar y notificar al padre
  alumnos: Alumno[];     // Recibe la lista real
  grupoId: string;
  profesorId: string;
}

export default function ModalAsistencia({ onClose, onConfirm, alumnos, grupoId, profesorId }: ModalAsistenciaProps) {
  // Estado de checkboxes: true = Asistencia, false = Falta
  // Inicializamos todos en true (asistieron)
  const [asistencias, setAsistencias] = useState<Record<number, boolean>>(
    alumnos.reduce((acc, curr) => ({ ...acc, [curr.id]: true }), {})
  );
  
  const [isSaving, setIsSaving] = useState(false);

  const toggle = (id: number) => {
    setAsistencias(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleGuardar = async () => {
    setIsSaving(true);
    
    // Identificar quiénes tienen false (FALTA)
    const faltas = alumnos
        .filter(a => asistencias[a.id] === false)
        .map(a => a.id);

    try {
        const res = await fetch('/api/attendance/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                grupoId,
                profesorId,
                faltas
            })
        });

        if (!res.ok) throw new Error("Error al guardar");

        onConfirm(); // Notificar éxito al padre
    } catch (error) {
        console.error(error);
        alert("Error al guardar la asistencia.");
    } finally {
        setIsSaving(false);
    }
  };

  const fechaHoy = new Date().toLocaleDateString('es-MX');

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-[#E6E6E6] w-[800px] rounded-md shadow-md overflow-hidden flex flex-col max-h-[90vh]">
        {/* Encabezado */}
        <div className="flex justify-between items-center px-6 py-3 border-b border-gray-400 bg-[#E6E6E6]">
          <h3 className="text-lg font-bold text-[#16469B]">Fecha: {fechaHoy}</h3>
          <button onClick={onClose} className="bg-red-700 hover:bg-red-800 text-white w-8 h-8 rounded-sm">✕</button>
        </div>

        {/* Contenido (Scrollable) */}
        <div className="px-6 py-4 text-[#16469B] flex-1 overflow-y-auto">
          <p className="mb-3 font-medium">Lista de Asistencia</p>

          <table className="w-full text-sm border-collapse">
            <thead className="bg-[#E6E6E6] sticky top-0 shadow-sm">
              <tr>
                <th className="px-3 py-2 text-left">Expediente</th>
                <th className="px-3 py-2 text-left">Nombre</th>
                <th className="px-3 py-2 text-center">Asistencia</th>
              </tr>
            </thead>
            <tbody>
              {alumnos.map((alumno, i) => (
                <tr key={alumno.id} className={i % 2 === 0 ? "bg-white" : "bg-[#F3F3F3]"}>
                  <td className="px-3 py-2 font-mono text-blue-700">{alumno.expediente}</td>
                  <td className="px-3 py-2">{alumno.nombreCompleto}</td>
                  <td className="px-3 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={asistencias[alumno.id] ?? true}
                      onChange={() => toggle(alumno.id)}
                      className="w-5 h-5 accent-[#16469B] cursor-pointer"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-300 bg-gray-100 flex justify-end items-center gap-4">
            <p className="text-sm text-gray-600">¿Desea finalizar el pase de lista?</p>
            <button
              onClick={handleGuardar}
              disabled={isSaving}
              className="bg-[#16469B] hover:bg-[#E6B10F] text-white font-semibold px-6 py-1.5 rounded transition disabled:opacity-50"
            >
              {isSaving ? "Guardando..." : "Aceptar"}
            </button>
        </div>
      </div>
    </div>
  );
}