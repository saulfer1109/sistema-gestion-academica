"use client";

import { useState } from "react";
import Link from "next/link"; // 👈 Importamos Link para la navegación

const AZUL_MARINO = "#16469B";
const DORADO = "#E6B10F";

interface CardMateriaProps {
  clave: string;
  grupo: number;
  materia: string;
  horario: string;
}

export default function CardMateria({
  clave,
  grupo,
  materia,
  horario,
}: CardMateriaProps) {
  const [isHovered, setIsHovered] = useState(false);

  // ✅ Determinamos la ruta según el grupo
  const destino =
    grupo === 1 ? "/curso" : "/curso/informacion"; // grupo 1 → sin info, otros → con info

  return (
    <Link href={destino}>
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          p-3 rounded-md shadow-sm text-center cursor-pointer
          transition-all duration-300 ease-in-out
          font-sans font-medium tracking-wide
          ${isHovered ? "bg-[#E6B10F] text-white" : "bg-[#16469B] text-white"}
        `}
        style={{
          fontFamily: "Inter, sans-serif",
          width: "230px",
          margin: "0 auto",
        }}
      >
        <p>Clave: {clave}</p>
        <p>Grupo: {grupo}</p>
        <p className="text-sm">{materia}</p>
        <p className="text-xs mt-1">{horario}</p>
      </div>
    </Link>
  );
}
