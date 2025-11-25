"use client";

import React, { useState, useEffect } from "react";
// Se elimina la importación problemática: import { usePathname } from "next/navigation";

// Hook personalizado para obtener la ruta actual (reemplazando usePathname)
const useClientPathname = () => {
  const [pathname, setPathname] = useState('/');

  // Usamos useEffect para acceder a 'window' solo en el cliente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPathname(window.location.pathname);
    }
  }, []);

  return pathname;
};


type Props = {
  className?: string;
  azul: string; // Color #16469B (Típicamente el color activo)
  dorado: string; // Color #FFD100 (Típicamente el fondo del navbar)
};

export default function NavBar({ className, azul, dorado }: Props) {
  // Usamos el hook nativo de JS en lugar de usePathname
  const pathname = useClientPathname();
  // Estado para controlar qué menú desplegable está abierto (usando el label como identificador)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const menuItems = [
    { href: "/inicio", label: "Inicio", id: "inicio" },
    {
      href: "#",
      label: "Calificaciones",
      id: "calificaciones",
      dropdown: [ // El submenú para Calificaciones
        { href: "/calificaciones/subir", label: "Subir calificaciones vía Excel" },
        { href: "/calificaciones/consultar-calificaciones", label: "Consultar calificaciones" },
      ],
      // No disabled: true, para permitir el clic y abrir el dropdown
    },
    { href: "#", label: "Alumnos", id: "alumnos", disabled: true },
    { href: "/reportes", label: "Reportes Académicos", id: "reportes" },
    { href: "/Alertas-Faltas", label: "Alertas por Faltas", id: "alertas", disabled: true },
  ];

  const handleMenuClick = (id: string, hasDropdown: boolean) => {
    if (hasDropdown) {
      // Alternar el dropdown: si está abierto, ciérralo; si está cerrado, ábrelo.
      setOpenDropdown(openDropdown === id ? null : id);
    } else {
      // Si se hace clic en un enlace normal, cerrar cualquier dropdown abierto
      setOpenDropdown(null);
    }
  };

  return (
    <nav
      className={className}
      style={{ backgroundColor: dorado, borderTop: `6px solid ${azul}` }}
    >
      <div className="max-w-7xl mx-auto px-8 w-full">
        {/* Restauramos el gap-10 original */}
        <ul className="flex justify-start gap-10">
          {menuItems.map((item) => {
            const hasDropdown = item.dropdown && item.dropdown.length > 0;
            // Detecta ruta activa o subruta, incluyendo las del dropdown
            const isActive =
              pathname === item.href ||
              pathname.startsWith(item.href + "/") ||
              (hasDropdown && item.dropdown.some(sub => pathname.startsWith(sub.href)));

            const isMenuOpen = openDropdown === item.id;

            // Define la clase de color basada en el estado original
            const textColorClass = item.disabled
                ? "text-white" // Los deshabilitados se ven como los demás, pero son opacos
                : (isActive || isMenuOpen) // Si está activo O el dropdown está abierto
                    ? `text-[${azul}]` // Usa el color azul del prop
                    : "text-white"; // Color por defecto (blanco)

            return (
              <li
                key={item.id}
                className="relative"
                // Añadimos un listener para cerrar el menú si el usuario hace clic fuera
                onBlur={() => isMenuOpen && setTimeout(() => setOpenDropdown(null), 100)}
                tabIndex={0} // Necesario para el evento onBlur
              >
                <a
                  href={item.disabled ? undefined : item.href}
                  onClick={(e) => {
                    if (hasDropdown) {
                      e.preventDefault(); // Previene la navegación
                      handleMenuClick(item.id, true);
                    } else if (!item.disabled) {
                       handleMenuClick(item.id, false);
                    }
                  }}
                  className={`px-4 py-2 transition font-medium text-lg ${
                    item.disabled
                      ? "cursor-not-allowed opacity-70"
                      : "hover:text-black" // Cambiado a black en hover para que se vea sobre el dorado
                  } ${textColorClass}`}
                  style={{ color: (isActive || isMenuOpen) ? azul : 'white' }}
                >
                  {item.label}
                </a>

                {/* Menú Desplegable (SOLO visible si hasDropdown es verdadero y está abierto) */}
                {hasDropdown && isMenuOpen && (
                  <div
                    className="absolute top-full left-0 mt-0 w-64 shadow-2xl z-20 rounded-b-lg overflow-hidden"
                    // Estilo del dropdown: Blanco con borde azul.
                    style={{ backgroundColor: 'white', border: `1px solid ${azul}` }}
                  >
                    {item.dropdown.map((subItem) => (
                      <a
                        key={subItem.label}
                        href={subItem.href}
                        // Si la subruta está activa, la marcamos
                        className={`block p-3 text-sm font-medium transition-colors whitespace-nowrap
                          ${pathname === subItem.href || pathname.startsWith(subItem.href + '/')
                            ? `bg-gray-100 text-[${azul}]` // Fondo suave si es la ruta activa
                            : `text-[${azul}] hover:bg-gray-200` // Hover suave si no está activa
                          }
                        `}
                        style={{ color: azul }}
                      >
                        {subItem.label}
                      </a>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}