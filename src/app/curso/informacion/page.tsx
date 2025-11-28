"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ModalAsistencia from "@/components/ui/ModalAsistencia";
import ModalConfirmacion from "@/components/ui/ModalConfirmacion";
import { UploadCloud } from "lucide-react"; // Icono opcional para el botón

// Definición adaptada a tu tabla visual
interface AlumnoInfo {
  id: number;
  expediente: string;
  matricula: string;
  nombreCompleto: string;
  correo: string;
  estadoAcademico: string;
  faltas: number;
  permitidas: string;
  promedio: number | string;
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
  const [profesorId, setProfesorId] = useState<string>("");

  const fetchAlumnos = async () => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
        setError("No hay sesión activa.");
        setLoading(false);
        return;
    }
    
    const user = JSON.parse(storedUser);
    setProfesorId(user.profesorId);

    try {
      setLoading(true);
      const res = await fetch(`/api/student-groups?grupoId=${grupoId}&profesorId=${user.profesorId}`);
      
      if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Error al cargar alumnos");
      }
      
      const data = await res.json();
      
      const alumnosMapeados = data.map((a: any) => ({
          ...a,
          faltas: Number(a.faltas) || 0,
          permitidas: `${Number(a.faltas) || 0}/14`,
          promedio: 0
      }));
      
      setAlumnos(alumnosMapeados);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (grupoId) fetchAlumnos();
  }, [grupoId]);

  const handleConfirmarAsistencia = () => {
    setIsModalOpen(false);
    setIsConfirmOpen(true);
    fetchAlumnos();
  };

  if (!grupoId) return <div className="p-10 text-red-500">Error: Grupo no especificado.</div>;

  return (
    <div className="p-10 font-sans text-[#16469B]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Información del curso</h2>
        {/* ID del grupo discreto */}
        <span className="text-sm bg-blue-50 px-3 py-1 rounded-full text-blue-800">
            Grupo ID: {grupoId}
        </span>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md border border-red-200">
            {error}
        </div>
      )}

      {/* 🟢 BOTONERA DE ACCIONES */}
      <div className="flex justify-end gap-4 mb-4">
        {/* Botón Nuevo: Ir a Cargar Excel */}
        <button
          onClick={() => router.push(`/curso?grupoId=${grupoId}`)}
          className="flex items-center gap-2 bg-gray-100 text-[#16469B] hover:bg-gray-200 font-semibold px-5 py-2 rounded transition border border-gray-300"
        >
          <UploadCloud size={18} />
          {alumnos.length === 0 ? "Cargar Lista Inicial" : "Actualizar Lista (Excel)"}
        </button>

        {/* Botón Existente: Pase de Lista */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#16469B] hover:bg-[#E6B10F] text-white font-semibold px-6 py-2 rounded transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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
              <th className="py-3 px-4 text-left">Nombre</th>
              <th className="py-3 px-4">Faltas</th>
              <th className="py-3 px-4">Faltas Permitidas</th>
              <th className="py-3 px-4">Promedio</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
                <tr><td colSpan={5} className="py-8 text-gray-500">Cargando alumnos...</td></tr>
            ) : alumnos.length === 0 && !error ? (
                <tr>
                    <td colSpan={5} className="py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                            <p className="text-lg mb-2">No hay alumnos inscritos en este grupo.</p>
                            <p className="text-sm">Usa el botón <strong>"Cargar Lista Inicial"</strong> para subir el Excel.</p>
                        </div>
                    </td>
                </tr>
            ) : (
                alumnos.map((a, index) => (
                <tr key={a.expediente} className={`border-t ${index % 2 === 0 ? "bg-white" : "bg-[#F3F3F3]"}`}>
                    <td 
                        className="py-3 px-4 text-blue-700 hover:text-[#E6B10F] cursor-pointer font-medium"
                        onClick={() => router.push(`/alumno/${a.expediente}`)}
                    >
                        {a.expediente}
                    </td>
                    <td className="py-3 px-4 text-left text-gray-800">{a.nombreCompleto}</td>
                    
                    <td className="py-3 px-4 flex items-center justify-center gap-2">
                        <span className={`inline-block w-3 h-3 rounded-full ${a.faltas === 0 ? "bg-green-500" : a.faltas <= 4 ? "bg-yellow-400" : "bg-red-500"}`}></span>
                        {a.faltas}
                    </td>

                    <td className="py-3 px-4 text-gray-700">{a.permitidas}</td>
                    <td className="py-3 px-4 font-semibold text-gray-700">{a.promedio}</td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      <button
        onClick={() => router.back()}
        className="mt-6 bg-[#BFBFBF] text-[#16469B] font-semibold px-6 py-2 rounded hover:opacity-90"
      >
        Atrás
      </button>

      {/* Modales */}
      {isModalOpen && (
        <ModalAsistencia
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmarAsistencia}
          alumnos={alumnos}
          grupoId={grupoId}
          profesorId={profesorId}
        />
      )}
      {isConfirmOpen && (
        <ModalConfirmacion onClose={() => setIsConfirmOpen(false)} />
      )}
    </div>
  );
}

export default function InformacionCursoPage() {
    return (
        <Suspense fallback={<div className="p-10">Cargando curso...</div>}>
            <CursoContent />
        </Suspense>
    );
}