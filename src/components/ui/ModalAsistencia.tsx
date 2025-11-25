"use client";

import { useState } from "react";

interface ModalAsistenciaProps {
  onClose: () => void;
  onConfirm: () => void;
}

export default function ModalAsistencia({ onClose, onConfirm }: ModalAsistenciaProps) {
  const alumnos = [
    "219214456",
    "219214457",
    "219214458",
    "219214459",
    "219214460",
    "219214461",
    "219214462",
  ];

  const [checked, setChecked] = useState(Array(alumnos.length).fill(true));

  const toggle = (i: number) =>
    setChecked((prev) => prev.map((v, index) => (index === i ? !v : v)));

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-[#E6E6E6] w-[800px] rounded-md shadow-md">
        {/* Encabezado */}
        <div className="flex justify-between items-center px-6 py-3 border-b border-gray-400">
          <h3 className="text-lg font-bold text-[#16469B]">Fecha: 14/09/2025</h3>
          <button
            onClick={onClose}
            className="bg-red-700 hover:bg-red-800 text-white w-8 h-8 rounded-sm"
          >
            ✕
          </button>
        </div>

        {/* Contenido */}
        <div className="px-6 py-4 text-[#16469B]">
          <p className="mb-3 font-medium flex gap-4">
            <span>(Nombre de la materia)</span>
            <span>Grupo: (grupo)</span>
          </p>



          <table className="w-full text-sm border-collapse">
            <thead className="bg-[#E6E6E6]">
              <tr>
                <th className="px-3 py-2">Expediente</th>
                <th className="px-3 py-2">Nombre</th>
                <th className="px-3 py-2">Asistencia</th>
              </tr>
            </thead>
            <tbody>
              {alumnos.map((expediente, i) => (
                <tr
                  key={expediente}
                  className={i % 2 === 0 ? "bg-white" : "bg-[#F3F3F3]"}
                >
                  <td className="px-3 py-2 text-blue-700 hover:text-[#E6B10F] cursor-pointer">
                    {expediente}
                  </td>
                  <td className="px-3 py-2">Apellido Apellido Nombre Nombre</td>
                  <td className="px-3 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={checked[i]}
                      onChange={() => toggle(i)}
                      style={{ accentColor: "#16469B" }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end items-center mt-4 gap-4">
            <p>¿Desea finalizar el pase de lista?</p>
            <button
              onClick={onConfirm}
              className="bg-[#16469B] hover:bg-[#E6B10F] text-white font-semibold px-6 py-1.5 rounded transition"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
