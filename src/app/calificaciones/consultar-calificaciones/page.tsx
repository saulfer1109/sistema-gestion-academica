// src/app/calificaciones/consultar-calificaciones/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ConsultarCalificaciones() {
  const [expediente, setExpediente] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expediente.trim()) {
      setError('Por favor ingrese un número de expediente.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/students/${expediente}`);
      if (!res.ok) {
        throw new Error('Alumno no encontrado');
      }

      const data = await res.json();
      
      router.push(`/alumno/${data.expediente}`);
    } catch (err: any) {
      setError(err.message || 'Error al buscar al alumno.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Consultar Calificaciones por Expediente</h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="expediente" className="block text-sm font-medium text-gray-700 mb-1">
                Número de Expediente
              </label>
              <input
                id="expediente"
                type="text"
                value={expediente}
                onChange={(e) => setExpediente(e.target.value)}
                placeholder="Ej. EXP123456"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition disabled:opacity-50"
            >
              {loading ? 'Buscando...' : 'Buscar Alumno'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}