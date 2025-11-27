"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ModalAsistencia from "@/components/ui/ModalAsistencia";
import ModalConfirmacion from "@/components/ui/ModalConfirmacion";

const AZUL_MARINO = "#16469B";

export default function InformacionCursoPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const alumnos = [
    { expediente: "219214456", nombre: "Apellido Apellido Nombre Nombre", faltas: 3, permitidas: "3/14", promedio: 90 },
    { expediente: "219214457", nombre: "Apellido Apellido Nombre Nombre", faltas: 2, permitidas: "2/14", promedio: 92 },
    { expediente: "219214458", nombre: "Apellido Apellido Nombre Nombre", faltas: 6, permitidas: "6/14", promedio: 84 },
    { expediente: "219214459", nombre: "Apellido Apellido Nombre Nombre", faltas: 8, permitidas: "8/14", promedio: 78 },
    { expediente: "219214460", nombre: "Apellido Apellido Nombre Nombre", faltas: 4, permitidas: "4/14", promedio: 89 },
    { expediente: "219214461", nombre: "Apellido Apellido Nombre Nombre", faltas: 2, permitidas: "2/14", promedio: 92 },
    { expediente: "219214462", nombre: "Apellido Apellido Nombre Nombre", faltas: 0, permitidas: "0/14", promedio: 100 },
  ];

  const handleConfirmarAsistencia = () => {
    setIsModalOpen(false);
    setIsConfirmOpen(true);
  };

  return (
    <div className="p-10 font-sans text-[#16469B]">
      <h2 className="text-2xl font-bold mb-6">Información del curso</h2>

      <div className="mb-4">
        <p>
          <strong>Materia:</strong> (Nombre de la materia)&nbsp;&nbsp;
          <strong>Clave:</strong> (Clave)&nbsp;&nbsp;
          <strong>Grupo:</strong> (num)
        </p>
      </div>

      {/* Botón alineado a la derecha */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#16469B] hover:bg-[#E6B10F] text-white font-semibold px-6 py-2 rounded transition"
        >
          Realizar pase de lista
        </button>
      </div>

      {/* Tabla sin bordes */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-center border-collapse">
          <thead>
            <tr className="bg-[#E6E6E6] text-[#16469B] font-semibold">
              <th className="py-2 px-4">Expediente</th>
              <th className="py-2 px-4">Nombre</th>
              <th className="py-2 px-4">Faltas</th>
              <th className="py-2 px-4">Faltas Permitidas</th>
              <th className="py-2 px-4">Promedio</th>
            </tr>
          </thead>
          <tbody>
            {alumnos.map((a, index) => (
              <tr
                key={a.expediente}
                className={index % 2 === 0 ? "bg-white" : "bg-[#F3F3F3]"}
              >
                <td
                  className="py-2 px-4 text-blue-700 hover:text-[#E6B10F] cursor-pointer"
                  onClick={() => router.push("/alumnos/perfil")}
                >
                  {a.expediente}
                </td>
                <td className="py-2 px-4">{a.nombre}</td>
                <td className="py-2 px-4 flex items-center justify-center gap-2">
                  <span
                    className={`inline-block w-3 h-3 rounded-full ${
                      a.faltas === 0
                        ? "bg-green-500"
                        : a.faltas <= 4
                        ? "bg-yellow-400"
                        : "bg-red-500"
                    }`}
                  ></span>
                  {a.faltas}
                </td>
                <td className="py-2 px-4">{a.permitidas}</td>
                <td className="py-2 px-4">{a.promedio}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={() => history.back()}
        className="mt-6 bg-[#BFBFBF] text-[#16469B] font-semibold px-6 py-2 rounded hover:opacity-90"
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
