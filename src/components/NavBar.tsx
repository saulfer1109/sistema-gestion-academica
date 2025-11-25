"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

// Hook personalizado para obtener la ruta actual
const useClientPathname = () => {
  const [pathname, setPathname] = useState('/');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPathname(window.location.pathname);
    }
  }, []);
  return pathname;
};

type Props = {
  className?: string;
  azul: string; 
  dorado: string;
};

export default function NavBar({ className, azul, dorado }: Props) {
  const pathname = useClientPathname();
  
  // Estado para controlar qué menú está abierto
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const menuItems = [
    { href: "/inicio", label: "Inicio", id: "inicio" },
    {
      href: "#",
      label: "Calificaciones",
      id: "calificaciones",
      dropdown: [
        { href: "/calificaciones/subir-calificaciones", label: "Subir calificaciones vía Excel" },
        { href: "/calificaciones/consultar-calificaciones", label: "Consultar calificaciones" },
      ],
    },
    { href: "#", label: "Alumnos", id: "alumnos", disabled: true },
    { href: "/reportes", label: "Reportes Académicos", id: "reportes" },
    // ✅ "Alertas por Faltas" ACTIVADO (eliminé disabled: true)
    { href: "/alertas-faltas", label: "Alertas por Faltas", id: "alertas" },
    { href: "#", label: "Desempeño", id: "desempeno", disabled: true },
  ];

  const handleMenuClick = (id: string, hasDropdown: boolean) => {
    if (hasDropdown) {
      setOpenDropdown(openDropdown === id ? null : id);
    } else {
      setOpenDropdown(null);
    }
  };

  return (
    <nav
      className={className}
      style={{ backgroundColor: dorado, borderTop: `6px solid ${azul}` }}
    >
      <div className="max-w-7xl mx-auto px-8 w-full flex justify-between items-center">
        
        {/* --- MENÚ PRINCIPAL --- */}
        <ul className="flex justify-start gap-8 w-full">
          {menuItems.map((item) => {
            const hasDropdown = item.dropdown && item.dropdown.length > 0;
            const isActive =
              pathname === item.href ||
              pathname.startsWith(item.href + "/") ||
              (hasDropdown && item.dropdown.some(sub => pathname.startsWith(sub.href)));

            const isMenuOpen = openDropdown === item.id;
            
            // Estilos condicionales
            const textColorClass = item.disabled
                ? "text-white/70 cursor-not-allowed"
                : (isActive || isMenuOpen)
                    ? `text-[${azul}]` // Color activo (azul)
                    : "text-white hover:text-black"; // Color inactivo (blanco)

            return (
              <li
                key={item.id}
                className="relative"
                onBlur={(e) => {
                    // Cierra el menú si el foco sale del elemento
                    if (!e.currentTarget.contains(e.relatedTarget)) {
                        setTimeout(() => setOpenDropdown(null), 200);
                    }
                }}
                tabIndex={0}
              >
                <a
                  href={item.disabled ? undefined : item.href}
                  onClick={(e) => {
                    if (hasDropdown) {
                      e.preventDefault();
                      handleMenuClick(item.id, true);
                    } else if (!item.disabled) {
                       handleMenuClick(item.id, false);
                    }
                  }}
                  className={`px-2 py-4 block transition font-medium text-sm lg:text-base ${textColorClass}`}
                  style={{ color: (isActive || isMenuOpen) ? azul : undefined }}
                >
                  {item.label}
                </a>

                {/* Menú Desplegable */}
                {hasDropdown && isMenuOpen && (
                  <div
                    className="absolute top-full left-0 w-64 bg-white shadow-xl z-50 rounded-b-lg overflow-hidden border-t-0 border border-gray-200"
                  >
                    {item.dropdown.map((subItem) => (
                      <Link
                        key={subItem.label}
                        href={subItem.href}
                        className={`block px-4 py-3 text-sm font-medium transition-colors
                          ${pathname === subItem.href 
                            ? `bg-blue-50 text-[${azul}]` 
                            : `text-gray-700 hover:bg-gray-100 hover:text-[${azul}]`
                          }
                        `}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        
        {/* Se eliminó el bloque de usuario de aquí */}
      </div>
    </nav>
  );
}