"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // 👈 importamos el router

interface FileUploadProps {
  fileLoaded: boolean;
  setFileLoaded: (value: boolean) => void;
}

export default function FileUpload({ fileLoaded, setFileLoaded }: FileUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter(); // 👈 inicializamos router

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileLoaded(true);
    }
  };

  const handleConfirm = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFileLoaded(false);
    setFileName(null);
  };

  const handleCancel = () => {
    setFileLoaded(false);
    setFileName(null);
  };

  // 👇 Nuevo: cancelar y volver al inicio
  const handleCancelToInicio = () => {
    router.push("/inicio");
  };

  return (
    <div
      className="max-w-[700px] mx-auto flex flex-col items-center"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* Estado: sin archivo */}
      {!fileLoaded && (
        <div className="w-full flex flex-col items-center">
          {/* Cuadro principal de carga */}
          <div className="border-2 border-dashed border-[#16469B]/50 rounded-lg p-10 text-center max-w-[450px] mx-auto">
            <div className="flex flex-col items-center justify-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-14 w-14 text-[#16469B]/70"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 16V4m0 0l-3.5 3.5M12 4l3.5 3.5M6 20h12a2 2 0 002-2v-4a2 2 0 00-2-2H6a2 2 0 00-2 2v4a2 2 0 002 2z"
                />
              </svg>

              {/* Texto de carga en negro */}
              <p className="text-black font-medium">
                Arrastra tu archivo aquí <br />
                <span className="text-black/80 text-sm">
                  o haz click para seleccionarlo
                </span>
              </p>

              <p className="text-xs text-black/70 mb-4">
                Formatos permitidos: PDF (máx. 5MB)
              </p>

              {/* Botón de carga */}
              <label className="cursor-pointer">
                <span className="bg-[#16469B] hover:bg-[#0D1D4B] text-white py-2 px-6 rounded-md text-sm transition">
                  Cargar
                </span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* 🔹 Botón Cancelar (fuera del cuadro, centrado, regresa a inicio) */}
          <button
            onClick={handleCancelToInicio}
            className="bg-gray-300 text-[#16469B] py-2 px-6 rounded-md text-sm mt-6 hover:bg-gray-400 transition"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Estado: vista previa */}
      {fileLoaded && (
        <div className="w-full">
          <p className="text-[#16469B] font-medium mb-3">
            El archivo válido: Vista previa
          </p>

          <div className="border border-gray-400 bg-gray-200 rounded-md overflow-auto h-[250px] mb-6">
            <div className="p-6 text-sm text-[#16469B] leading-relaxed">
              <p>
                <strong>clave:</strong> 1234 <br />
                <strong>materia:</strong> ejemplo
              </p>
              <table className="mt-4 w-full text-left border-collapse text-xs">
                <thead className="border-b border-gray-400">
                  <tr>
                    <th>expediente</th>
                    <th>nombre</th>
                    <th>calificación final</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="border-b border-gray-300">
                      <td>12345</td>
                      <td>ejemplo {i}</td>
                      <td>A</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Alineado a la derecha */}
          <div className="flex flex-col items-end mt-4">
            <p className="text-[#16469B] mb-3 text-right">
              El archivo válido se ha cargado correctamente, ¿Desea continuar?
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleCancel}
                className="bg-gray-300 text-[#16469B] py-2 px-6 rounded-md text-sm hover:bg-gray-400 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                className="bg-[#16469B] hover:bg-[#0D1D4B] text-white py-2 px-6 rounded-md text-sm transition"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Modal institucional de éxito */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-[350px] p-6 relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="green"
                className="w-7 h-7"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <h3 className="text-lg font-semibold text-[#16469B]">
                Carga exitosa
              </h3>
            </div>

            <p className="text-[#16469B] text-sm mb-6">
              Se cargó la información del curso correctamente
            </p>

            <div className="flex justify-end">
              <button
                onClick={handleCloseModal}
                className="bg-gray-200 hover:bg-gray-300 text-[#16469B] px-4 py-2 rounded-md text-sm transition"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
