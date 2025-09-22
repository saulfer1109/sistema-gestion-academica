// src/app/alumno/[expediente]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Link from 'next/link';

// Tipos de datos
interface AcademicRecord {
  semester: string;
  subject: string;
  grade: number;
  status: 'Aprobada' | 'Reprobada';
}

interface StudentData {
  name: string;
  expediente: string;
  currentGroup: string;
  email: string;
  records: AcademicRecord[];
}

// Componente de carga
const SkeletonLoader = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    <div className="h-64 bg-gray-200 rounded"></div>
  </div>
);

// Colores para el gráfico de pastel
const COLORS = ['#00C49F', '#FF8042'];

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { expediente } = params;
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

// Llamada REAL a la API (usamos el valor tal cual)
useEffect(() => {
  const fetchStudentData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Aseguramos que 'expediente' sea un string
      const expedienteStr = Array.isArray(expediente) ? expediente[0] : expediente;

      if (!expedienteStr) {
        throw new Error('Número de expediente no válido');
      }

      const res = await fetch(`/api/students/${expedienteStr}`);
      
      if (!res.ok) {
        throw new Error('Alumno no encontrado');
      }

      const data = await res.json();
      setStudentData(data);
    } catch (err: any) {
      setError(err.message || 'No se pudo cargar la información del alumno. Verifica el número de expediente.');
      setStudentData(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (expediente) {
    fetchStudentData();
  }
}, [expediente]);

  // Función para calcular el promedio del semestre seleccionado
  const getFilteredData = () => {
    if (!studentData) return [];
    return selectedSemester === 'all'
      ? studentData.records
      : studentData.records.filter(record => record.semester === selectedSemester);
  };

  const calculateAverage = () => {
    const filtered = getFilteredData();
    if (filtered.length === 0) return 0;
    const sum = filtered.reduce((acc, record) => acc + record.grade, 0);
    return parseFloat((sum / filtered.length).toFixed(2));
  };

  const countByStatus = () => {
    const filtered = getFilteredData();
    const approved = filtered.filter(r => r.status === 'Aprobada').length;
    const failed = filtered.length - approved;
    return [
      { name: 'Aprobadas', value: approved },
      { name: 'Reprobadas', value: failed },
    ];
  };

  const getUniqueSemesters = () => {
    if (!studentData) return [];
    const semesters = [...new Set(studentData.records.map(r => r.semester))];
    return ['all', ...semesters];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <SkeletonLoader />
        </div>
      </div>
    );
  }

  if (error || !studentData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => router.push('/calificaciones/consultar-calificaciones')}
            className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md"
          >
            Volver a la Búsqueda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Encabezado */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{studentData.name}</h1>
              <p className="text-lg text-gray-600">Expediente: {studentData.expediente}</p>
              <p className="text-md text-gray-500">Grupo: {studentData.currentGroup} | Correo: {studentData.email}</p>
            </div>
            <Link href="/calificaciones/consultar-calificaciones" className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition">
              ← Nueva Búsqueda
            </Link>
          </div>
        </div>

        {/* Selector de Semestre */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-2">
            Filtrar por Semestre
          </label>
          <select
            id="semester"
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {getUniqueSemesters().map(sem => (
              <option key={sem} value={sem}>
                {sem === 'all' ? 'Todos los Semestres' : sem}
              </option>
            ))}
          </select>
        </div>

        {/* Panel de Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg text-center">
            <h3 className="text-lg font-semibold text-blue-800">Promedio General</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{calculateAverage()}</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg text-center">
            <h3 className="text-lg font-semibold text-green-800">Materias Aprobadas</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{countByStatus()[0].value}</p>
          </div>
          <div className="bg-red-50 p-6 rounded-lg text-center">
            <h3 className="text-lg font-semibold text-red-800">Materias Reprobadas</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">{countByStatus()[1].value}</p>
          </div>
        </div>

        {/* Gráfico de Barras: Calificaciones por Materia */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Calificaciones por Materia</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getFilteredData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Bar dataKey="grade" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Pastel: Aprobadas vs Reprobadas */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Distribución de Materias</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={countByStatus()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {countByStatus().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}