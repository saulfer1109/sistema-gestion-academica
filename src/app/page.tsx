// src/app/page.tsx
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Bienvenido al Sistema de Gestión Académica</h1>
        <p className="text-gray-600 mb-6">Seleccione una opción del menú superior para comenzar.</p>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Nuevos Avisos Importantes</h2>
          <div className="space-y-2">
            <label className="flex items-center">
              <input type="checkbox" checked className="mr-2" />
              Alerta por faltas
            </label>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Materias Actuales</h2>
          <p className="text-gray-500 mb-4">Semestre 2025-2</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-blue-50 p-4 rounded-md text-center">
                <p className="font-medium">Claves: 1234</p>
                <p className="text-sm text-gray-600">Grupo {i}</p>
                <p className="text-xs text-gray-500">(Materia)</p>
                <p className="text-xs text-gray-500">00:00 a.m - 00:00 a.m.</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">Seleccione un grupo para ver lista de alumnos</p>
        </div>
      </div>
    </div>
  );
}