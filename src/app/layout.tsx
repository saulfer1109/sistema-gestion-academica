"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Inter, Roboto } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";

// --- Definiciones de fuentes ---
const inter = Inter({ subsets: ["latin"] });
const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500"] });

// --- Paleta de colores ---
const AZUL_MARINO = "#16469B";
const DORADO = "#E6B10F";
const FONDO = "#EDE9FF"; 

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // 🎯 RUTAS DONDE NO SE MUESTRA EL MENÚ
  // Si tu Login está en la raíz '/', inclúyela aquí.
  const ROUTES_WITHOUT_NAVBAR = ['/', '/login', '/registro', '/recuperar-contrasena'];
  
  // Verifica si la ruta actual está en la lista de exclusión
  const shouldRenderNavbar = !ROUTES_WITHOUT_NAVBAR.includes(pathname);

  return (
    <html lang="es">
      <body className={inter.className}>
        {/* Fondo general */}
        <div
          className="min-h-screen flex justify-center py-10"
          style={{ backgroundColor: FONDO }}
        >
          {/* Contenedor principal (Tarjeta Blanca) */}
          <div className="bg-white max-w-[1200px] w-full mx-auto rounded-xl shadow-lg overflow-hidden min-h-[800px]">
            
            {/* 🔵 Franja azul superior (Siempre visible por diseño institucional) */}
            <div
              style={{ backgroundColor: AZUL_MARINO }}
              className="h-[8px] w-full"
            />

            {/* 🎯 RENDERIZADO CONDICIONAL: HEADER Y NAVBAR */}
            {shouldRenderNavbar && (
              <>
                {/* 1. HEADER (Logo e Íconos) */}
                <header className="bg-white shadow-sm">
                  <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
                    {/* Logo + Textos */}
                    <div className="flex items-center gap-6">
                      <div className="w-[80px] h-[80px] relative">
                        <Image
                          src="/logounison.png"
                          alt="Logo Universidad de Sonora"
                          fill
                          className="object-contain"
                        />
                      </div>

                      <div className="leading-snug">
                        <h1
                          className="uppercase tracking-wide font-semibold"
                          style={{
                            color: AZUL_MARINO,
                            fontSize: "24px",
                            lineHeight: "1.2",
                          }}
                        >
                          UNIVERSIDAD DE SONORA
                        </h1>
                        <p
                          className="font-serif italic text-[14px]"
                          style={{ color: AZUL_MARINO }}
                        >
                          El Saber de mis Hijos hará mi Grandeza
                        </p>
                      </div>
                    </div>

                    {/* Íconos Derecha */}
                    <div className="flex items-center gap-6">
                      {/* Notificaciones */}
                      <button className="p-2 rounded-full hover:bg-gray-100 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={AZUL_MARINO} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                        </svg>
                      </button>

                      {/* Perfil */}
                      <div className="relative">
                        <button
                          onClick={() => setIsMenuOpen(!isMenuOpen)}
                          className={`p-2 rounded-full transition ${isMenuOpen ? "bg-gray-100" : "hover:bg-gray-100"}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={AZUL_MARINO} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </button>

                        {isMenuOpen && (
                          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl z-50 p-4 border border-gray-200">
                            <div className="mb-3 border-b pb-2">
                              <p className="font-semibold text-gray-800">Prof. Usuario</p>
                              <p className="text-xs text-gray-500">profesor@unison.mx</p>
                            </div>
                            <Link href="/" className="block text-red-600 text-sm hover:underline">
                              Cerrar Sesión
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </header>

                {/* 2. NAVBAR AMARILLA (Menú Principal) */}
                <nav style={{ backgroundColor: DORADO }} className="text-white shadow-md">
                  <div className="max-w-7xl mx-auto px-4">
                    <ul className={`flex space-x-1 text-sm font-medium ${roboto.className}`}>
                      
                      {/* Inicio */}
                      <li>
                        {/* Nota: Si '/' es el login, redirige a un dashboard o home interno */}
                        <Link href="/inicio" className="block px-4 py-4 hover:bg-yellow-600/20 transition">
                          Inicio
                        </Link>
                      </li>

                      {/* Calificaciones (Dropdown) */}
                      <li className="relative group">
                        <button className="block px-4 py-4 hover:bg-yellow-600/20 transition focus:outline-none">
                          Calificaciones
                        </button>
                        {/* Submenú */}
                        <div className="absolute left-0 top-full w-56 bg-white border border-gray-100 rounded-b-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                          <Link 
                            href="/calificaciones/subir-excel" 
                            className="block px-4 py-3 text-gray-700 hover:bg-gray-50 border-b border-gray-100"
                          >
                            Subir calificaciones vía Excel
                          </Link>
                          <Link 
                            href="/calificaciones/consultar-calificaciones" 
                            className="block px-4 py-3 text-gray-700 hover:bg-gray-50"
                          >
                            Consultar calificaciones
                          </Link>
                        </div>
                      </li>

                      {/* Alumnos */}
                      <li>
                        <Link href="/alumnos/grupo" className="block px-4 py-4 hover:bg-yellow-600/20 transition">
                          Alumnos
                        </Link>
                      </li>

                      {/* Reportes */}
                      <li>
                        <Link href="/reportes" className="block px-4 py-4 hover:bg-yellow-600/20 transition">
                          Reportes Académicos
                        </Link>
                      </li>

                      {/* Alertas */}
                      <li>
                        <Link href="/alertas-faltas" className="block px-4 py-4 hover:bg-yellow-600/20 transition">
                          Alertas por Faltas
                        </Link>
                      </li>

                      {/* Desempeño */}
                      <li>
                        <span className="block px-4 py-4 text-white/70 cursor-not-allowed">
                          Desempeño
                        </span>
                      </li>

                    </ul>
                  </div>
                </nav>
              </>
            )}

            {/* 3. CONTENIDO DINÁMICO (Children) */}
            <main className="p-8">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}