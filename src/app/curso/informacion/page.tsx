"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ModalAsistencia from "@/components/ui/ModalAsistencia";
import ModalConfirmacion from "@/components/ui/ModalConfirmacion";

// Definición del alumno
interface AlumnoInfo {
  expediente: string;
  matricula: string;
  nombreCompleto: string;
  correo: string;
  estadoAcademico: string;
  faltas?: number; // Opcional si la API aun no lo devuelve
}

function CursoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const grupoId = searchParams.get("grupoId");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  
  const [alumnos, setAlumnos] = useState<AlumnoInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Cargar alumnos reales
  useEffect(() => {
    if (!grupoId) return;

    const fetchAlumnos = async () => {
      try {
        setLoading(true);
        // Usamos el endpoint existente que devuelve alumnos por grupo
        const res = await fetch(`/api/student-groups?grupoId=${grupoId}`);
        if (!res.ok) throw new Error("Error al cargar alumnos");
        
        const data = await res.json();
        
        // Mapeamos los datos para añadir campos visuales (faltas mockeadas por ahora si no vienen)
        const alumnosMapeados = data.map((a: any) => ({
            ...a,
            faltas: 0, // Mock inicial
            permitidas: "0/14",
            promedio: "-"
        }));
        
        setAlumnos(alumnosMapeados);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAlumnos();
  }, [grupoId]);

  const handleConfirmarAsistencia = () => {
    // Aquí iría la lógica para enviar la asistencia al backend (POST /api/attendance...)
    // Por ahora solo cerramos y mostramos confirmación
    setIsModalOpen(false);
    setIsConfirmOpen(true);
  };

  if (!grupoId) return <div className="p-10 text-red-500">Error: Grupo no especificado.</div>;

  return (
    <div className="p-10 font-sans text-[#16469B]">
      <h2 className="text-2xl font-bold mb-6">Información del curso</h2>

      {/* Info básica del grupo (Podrías hacer otro fetch para traer el nombre exacto de la materia si quisieras) */}
      <div className="mb-4 bg-blue-50 p-4 rounded-lg inline-block">
        <p>
          <strong>ID Grupo:</strong> {grupoId}&nbsp;&nbsp;
          {/* Aquí podrías mostrar más info si la trajeras del backend */}
        </p>
      </div>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#16469B] hover:bg-[#E6B10F] text-white font-semibold px-6 py-2 rounded transition shadow-md"
          disabled={loading || alumnos.length === 0}
        >
          Realizar pase de lista
        </button>
      </div>

      <div className="overflow-x-auto shadow-sm rounded-lg border border-gray-200">
        <table className="min-w-full text-sm text-center border-collapse">
          <thead>
            <tr className="bg-[#E6E6E6] text-[#16469B] font-semibold">
              <th className="py-3 px-4">Expediente</th>
              <th className="py-3 px-4 text-left">Nombre Completo</th>
              <th className="py-3 px-4">Correo</th>
              <th className="py-3 px-4">Estatus</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
                <tr><td colSpan={4} className="py-8 text-gray-500">Cargando alumnos...</td></tr>
            ) : alumnos.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-gray-500">No hay alumnos inscritos en este grupo.</td></tr>
            ) : (
                alumnos.map((a, index) => (
                <tr key={a.expediente} className={`border-t ${index % 2 === 0 ? "bg-white" : "bg-[#F9FAFB]"}`}>
                    <td 
                        className="py-3 px-4 text-blue-700 hover:text-[#E6B10F] cursor-pointer font-medium"
                        onClick={() => router.push(`/alumno/${a.expediente}`)}
                    >
                        {a.expediente}
                    </td>
                    <td className="py-3 px-4 text-left text-gray-800">{a.nombreCompleto}</td>
                    <td className="py-3 px-4 text-gray-600">{a.correo}</td>
                    <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${a.estadoAcademico === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {a.estadoAcademico}
                        </span>
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      <button
        onClick={() => router.back()}
        className="mt-6 bg-gray-200 text-[#16469B] font-semibold px-6 py-2 rounded hover:bg-gray-300 transition"
      >
        Atrás
      </button>

      {/* Modales */}
      {isModalOpen && (
        <ModalAsistencia
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmarAsistencia}
        />
      )}
      {isConfirmOpen && (
        <ModalConfirmacion onClose={() => setIsConfirmOpen(false)} />
      )}
    </div>
  );
}

// Wrapper Suspense requerido por Next.js para useSearchParams
export default function InformacionCursoPage() {
    return (
        <Suspense fallback={<div className="p-10">Cargando curso...</div>}>
            <CursoContent />
        </Suspense>
    );
}