// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Image from 'next/image';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sistema de Gestión Académica - Universidad de Sonora',
  description: 'Gestión académica para profesores',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <header className="bg-white border-b border-blue-900 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Logo en lugar del circulo azul con US */}
                <div className="w-16 h-16 relative">
                  <Image
                    src="/logounison.png" 
                    alt="Logo Universidad de Sonora"
                    fill
                    className="object-contain rounded-full"
                  />
                </div>

                <div>
                  <h1 className="text-xl font-bold text-blue-900">UNIVERSIDAD DE SONORA</h1>
                  <p className="text-sm text-gray-600">El Saber de mis Hijos hará mi Grandeza</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button className="p-2 rounded-full hover:bg-gray-100 transition">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h4l-4-4h-4l4-4H9a2 2 0 00-2 2v4a2 2 0 002 2h4z"
                    />
                  </svg>
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100 transition">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </header>

          {/* Main Navigation */}
          <nav className="bg-yellow-500 text-white">
            <div className="max-w-7xl mx-auto px-4">
              <ul className="flex space-x-8 text-sm font-medium">
                <li>
                  <a
                    href="#"
                    className="px-3 py-2 rounded transition cursor-not-allowed opacity-70"
                  >
                    Inicio
                  </a>
                </li>
                <li className="relative group">
                  <a
                    href="#"
                    className="px-3 py-2 rounded transition cursor-not-allowed opacity-70"
                  >
                    Calificaciones
                  </a>
                  <div className="absolute left-0 top-full mt-1 w-64 bg-white border rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    <ul className="py-1">
                      <li>
                        <a
                          href="#"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-not-allowed opacity-50"
                        >
                          Subir calificaciones vía Excel
                        </a>
                      </li>
                      <li>
                        <a
                          href="/calificaciones/consultar-calificaciones"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100 font-medium"
                        >
                          Consultar calificaciones
                        </a>
                      </li>
                    </ul>
                  </div>
                </li>
                <li>
                  <a
                    href="#"
                    className="px-3 py-2 rounded transition cursor-not-allowed opacity-70"
                  >
                    Alumnos
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="px-3 py-2 rounded transition cursor-not-allowed opacity-70"
                  >
                    Reportes Académicos
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="px-3 py-2 rounded transition cursor-not-allowed opacity-70"
                  >
                    Alertas por Faltas
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="px-3 py-2 rounded transition cursor-not-allowed opacity-70"
                  >
                    Desempeño
                  </a>
                </li>
              </ul>
            </div>
          </nav>

          {/* Contenido de la página */}
          <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
