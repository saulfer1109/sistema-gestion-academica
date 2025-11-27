"use client";

import { useState } from "react";
import FileUpload from "../../components/ui/FileUpload";

export default function CursoPage() {
  const [fileLoaded, setFileLoaded] = useState(false);

  return (
    <div className="p-10">
      {/* Título principal */}
      <h2
        className="text-xl font-sans font-semibold text-[#16469B] mb-4"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        Información del curso
      </h2>

      {/* Descripción inicial */}
      {!fileLoaded && (
        <p className="text-[#16469B] text-[15px] mb-6 max-w-[700px] leading-relaxed">
          No se ha encontrado información del curso, suba el archivo para registrar y
          actualizar la información
        </p>
      )}

      {/* Componente de carga o vista previa */}
      <FileUpload
        fileLoaded={fileLoaded}
        setFileLoaded={setFileLoaded}
      />
    </div>
  );
}
