"use client";

import { useState } from "react";
// Usamos el alias @ para asegurar que encuentre los componentes sin importar donde esté este archivo
import SectionTitle from "@/components/ui/SectionTitle";
import Checkbox from "@/components/ui/Checkbox";
import CardMateria from "@/components/ui/CardMateria";
import dynamic from "next/dynamic";

// ✅ Import dinámico del calendario para evitar errores de hidratación (SSR)
const DatePicker = dynamic(
  () =>
    import("react-datepicker").then((mod) => mod.default) as unknown as Promise<React.ComponentType<any>>,
  { ssr: false }
);

import "react-datepicker/dist/react-datepicker.css";
// Opcional: Estilos personalizados para el calendario para que combine con UNISON
import "@/app/globals.css"; // Asegúrate de tener tus estilos globales aquí

export default function InicioPage() {
  // Datos simulados (Mocks)
  const [avisos, setAvisos] = useState([
    { id: 1, texto: "Alerta por faltas - Grupo 1", checked: true },
    { id: 2, texto: "Reunión de academia - 12:00 PM", checked: false },
    { id: 3, texto: "Fecha límite para subir calificaciones: 30 Oct", checked: true },
  ]);

  const [fecha, setFecha] = useState<Date | null>(new Date());

  return (
    <div className="min-h-screen bg-white p-8 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-10 relative">
        
        {/* 🔵 Franja azul decorativa (Ajustada para que no tape contenido importante) */}
        <div className="absolute top-[3.5rem] left-0 right-0 h-[2px] bg-[#16469B] -z-0 opacity-20 md:opacity-100" />

        {/* --- COLUMNA IZQUIERDA: CONTENIDO --- */}
        <div className="flex-1 z-10">
          {/* Título de Bienvenida */}
          <div className="bg-white pr-4 inline-block mb-8">
            <h2
                className="text-2xl md:text-3xl font-sans text-[#16469B] font-semibold"
                style={{ fontFamily: "Inter, sans-serif" }}
            >
                Bienvenido Prof. Ochoa Hernandez José Luis
            </h2>
          </div>

          {/* Sección de Avisos */}
          <div className="mt-4">
              <SectionTitle title="Nuevos Avisos Importantes" />
              
              <div className="bg-[#F0F0F0] p-6 rounded-lg shadow-inner mb-10 max-h-60 overflow-y-auto border border-gray-200">
                {avisos.length > 0 ? (
                    avisos.map((aviso) => (
                    <div key={aviso.id} className="-mb-2">
                        <Checkbox
                            label={aviso.texto}
                            checked={aviso.checked}
                            onChange={() =>
                                setAvisos((prev) =>
                                prev.map((a) =>
                                    a.id === aviso.id ? { ...a, checked: !a.checked } : a
                                )
                                )
                            }
                        />
                    </div>
                    ))
                ) : (
                    <p className="text-gray-500 italic">No hay avisos nuevos.</p>
                )}
              </div>
          </div>

          {/* Separador móvil */}
          <div className="h-[1px] bg-[#16469B] w-full my-8 opacity-30 md:hidden" />

          {/* Sección de Materias */}
          <div>
            <div className="flex items-baseline justify-between mb-4">
                <SectionTitle title="Materias Actuales" />
                <p
                    className="text-sm text-[#16469B] font-bold bg-blue-50 px-3 py-1 rounded-full"
                    style={{ fontFamily: "Inter, sans-serif" }}
                >
                    Semestre 2025-2
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                <CardMateria
                    key={i}
                    grupo={i}
                    materia="Programación Web"
                    clave={`COM-${1230 + i}`}
                    horario="07:00 a.m - 09:00 a.m"
                />
                ))}
            </div>

            <p className="text-sm text-gray-500 mt-6 italic flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Seleccione un grupo para ver lista de alumnos
            </p>
          </div>
        </div>

        {/* --- COLUMNA DERECHA: CALENDARIO --- */}
        {/* Ajustado con 'sticky' para que siga al usuario al hacer scroll si hay mucho contenido */}
        <div className="md:w-[300px] mt-8 md:mt-14 flex flex-col items-center md:items-end z-10">
          <div className="sticky top-10 bg-white p-2 rounded-xl shadow-lg border border-gray-100">
            <h4 className="text-[#16469B] font-bold text-center mb-2">Calendario Escolar</h4>
            <div className="custom-datepicker-wrapper">
                <DatePicker
                    selected={fecha}
                    onChange={(date: Date | null) => setFecha(date)}
                    inline
                    calendarClassName="unison-calendar"
                />
            </div>
            
            {/* Pequeña leyenda o eventos del día */}
            <div className="mt-4 border-t pt-4">
                <p className="text-xs text-center text-gray-500">
                    {fecha?.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>
          </div>
        </div>

      </div>
      
      {/* Estilos en línea para personalizar el calendario al azul UNISON sin archivo CSS extra */}
      <style jsx global>{`
        .react-datepicker {
            border: none !important;
            font-family: 'Inter', sans-serif !important;
        }
        .react-datepicker__header {
            background-color: #f3f4f6 !important;
            border-bottom: none !important;
        }
        .react-datepicker__day--selected, .react-datepicker__day--keyboard-selected {
            background-color: #16469B !important;
            color: white !important;
            border-radius: 50% !important;
        }
        .react-datepicker__day:hover {
            background-color: #E6A425 !important; /* Amarillo UNISON al pasar mouse */
            color: white !important;
            border-radius: 50% !important;
        }
        .react-datepicker__current-month {
            color: #16469B !important;
            font-weight: bold !important;
            text-transform: capitalize !important;
        }
        .react-datepicker__day-name {
            color: #E6A425 !important; /* Días en dorado */
            font-weight: bold !important;
        }
      `}</style>
    </div>
  );
}