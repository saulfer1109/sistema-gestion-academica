"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Inter, Roboto } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";
import NavBar from "../components/NavBar";

// --- Definiciones de fuentes ---
const inter = Inter({ subsets: ["latin"] });
const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500"] });

// --- Paleta de colores ---
const AZUL_MARINO = "#16469B";
const DORADO = "#E6B10F";
const FONDO = "#EDE9FF"; 

// Definición de tipo para el usuario
interface UserData {
  nombre: string;
  email: string;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  
  const pathname = usePathname();
  const router = useRouter();

  // Rutas sin NavBar
  const ROUTES_WITHOUT_NAVBAR = ['/', '/login', '/registro', '/recuperar-contrasena'];
  const shouldRenderNavbar = !ROUTES_WITHOUT_NAVBAR.includes(pathname);

  // 1️⃣ Cargar datos del usuario al montar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUserData(JSON.parse(storedUser));
        } catch (e) {
          console.error("Error leyendo usuario", e);
        }
      }
    }
  }, []);

  // 2️⃣ Logout logic
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        router.push('/');
    }
  };

  return (
    <html lang="es">
      <body className={inter.className}>
        <div
          className="min-h-screen flex justify-center py-10"
          style={{ backgroundColor: FONDO }}
        >
          <div className="bg-white max-w-[1200px] w-full mx-auto rounded-xl shadow-lg overflow-hidden min-h-[800px]">
            
            {/* Franja superior azul */}
            <div
              style={{ backgroundColor: AZUL_MARINO }}
              className="h-[8px] w-full"
            />

            {shouldRenderNavbar && (
              <>
                {/* --- HEADER BLANCO (CON ICONO DE USUARIO) --- */}
                <header className="bg-white shadow-sm relative z-20">
                  <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
                    
                    {/* Logo + Textos */}
                    <div className="flex items-center gap-6">
                      <div className="w-[80px] h-[80px] relative">
                        <Image
                          src="/logounison.png"
                          alt="Logo Universidad de Sonora"
                          fill
                          className="object-contain"
                          priority
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
                      <button className="p-2 rounded-full hover:bg-gray-100 transition text-[#16469B]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                        </svg>
                      </button>

                      {/* --- PERFIL --- */}
                      <div 
                        className="relative"
                        tabIndex={0}
                        onBlur={(e) => {
                            if (!e.currentTarget.contains(e.relatedTarget)) {
                                setTimeout(() => setIsProfileOpen(false), 150);
                            }
                        }}
                      >
                        <button
                          onClick={() => setIsProfileOpen(!isProfileOpen)}
                          className={`p-2 rounded-full transition text-[#16469B] ${isProfileOpen ? "bg-gray-100" : "hover:bg-gray-100"}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </button>

                        {/* ⬇️ DROPDOWN DE PERFIL PERSONALIZADO */}
                        {isProfileOpen && (
                          <div className="absolute right-0 mt-2 w-[380px] bg-white rounded-lg shadow-2xl z-50 border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                            <div className="flex">
                                <div className="flex-1">
                                    {/* Info Superior */}
                                    <div className="p-5 pb-3">
                                        <div className="flex gap-4 items-start">
                                            {/* Avatar Dorado */}
                                            <div className="mt-1 w-10 h-10 rounded-full bg-[#E6B10F] flex-shrink-0 border-2 border-white shadow-sm"></div>
                                            
                                            {/* Textos */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <p className="font-bold text-[#16469B] text-base leading-tight">
                                                        Prof. {userData?.nombre || "Usuario"}
                                                    </p>
                                                    {/* Botón Cerrar Sesión */}
                                                    <button 
                                                        onClick={handleLogout}
                                                        className="text-red-600 text-xs hover:underline font-medium whitespace-nowrap ml-3 mt-0.5"
                                                    >
                                                        Cerrar Sesión
                                                    </button>
                                                </div>
                                                
                                                <p className="text-xs text-gray-600 mt-1 font-medium">
                                                    {userData?.email || "correo@unison.mx"}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    Grupo (clave)
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Separador */}
                                    <div className="h-[1px] bg-[#16469B] mx-5 opacity-20"></div>

                                    {/* Info Inferior / Configuración */}
                                    <div className="px-5 py-4 bg-white">
                                        <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                                            Maestro de tiempo completo Campus Hermosillo
                                        </p>
                                        
                                        {/* ENLACE DE CONFIGURACIÓN */}
                                        <Link 
                                            href="/configuracion-perfil" 
                                            className="block w-full text-left text-sm text-gray-700 hover:text-[#16469B] hover:bg-gray-50 p-2 -ml-2 rounded transition-colors font-medium"
                                            onClick={() => setIsProfileOpen(false)}
                                        >
                                            Configuración de perfil
                                        </Link>
                                    </div>
                                </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </header>

                {/* --- NAVBAR AMARILLA --- */}
                <NavBar
                  className={`${roboto.className} text-white h-16 flex items-center shadow-sm font-medium text-[17px]`}
                  azul={AZUL_MARINO}
                  dorado={DORADO}
                />
              </>
            )}

            {/* Contenido dinámico */}
            <main className="p-8">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}