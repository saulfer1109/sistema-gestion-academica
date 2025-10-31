import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/app/lib/db";

// 🔹 TIPOS DE DATOS
interface StudentRow {
  id: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  correo: string;
}

// Kardex extendido con el nombre de la materia (JOIN con la tabla 'materia')
interface KardexRowExtended {
  id: number;
  alumno_id: number;
  materia_id: number;
  materia_nombre: string;
  periodo_id: number;
  calificacion: string;
  estatus: "ACREDITADA" | "REPROBADA";
  promedio_kardex: number;
  promedio_sem_act: number;
}

interface AcademicRecord {
  semester: string;
  subject: string;
  grade: number;
  status: "Aprobada" | "Reprobada";
}

interface StudentData {
  name: string;
  expediente: string;
  currentGroup: string;
  email: string;
  records: AcademicRecord[];
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ expediente: string }> }
) {
  try {
    const { expediente } = await context.params;

    if (!expediente) {
      return NextResponse.json({ error: "Expediente no proporcionado" }, { status: 400 });
    }

    // Limpiamos el expediente de espacios en blanco
    const expedienteStr = expediente.trim(); 

    // 🔹 Query 1: Traer alumno (LIMPIO, SIN SALTOS DE LÍNEA)
    const studentResult = await pool.query(
      `SELECT id, nombre, apellido_paterno, apellido_materno, correo, expediente FROM alumno WHERE TRIM(expediente) ILIKE $1`, 
      [expedienteStr]
    );

    const studentRows: StudentRow[] = studentResult.rows;
    if (!studentRows.length) {
      return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404 });
    }
    const student = studentRows[0];

    // 🔹 Query 2: Traer calificaciones del kardex con JOIN a materia (LIMPIO, SIN SALTOS DE LÍNEA)
    const kardexResult = await pool.query(
      `SELECT k.id, k.alumno_id, k.materia_id, m.nombre AS materia_nombre, k.periodo_id, k.calificacion, k.estatus, k.promedio_kardex, k.promedio_sem_act FROM kardex k JOIN materia m ON m.id = k.materia_id WHERE k.alumno_id = $1`,
      [student.id]
    );
    const kardexRows: KardexRowExtended[] = kardexResult.rows;

    // 🔹 Transformar datos para frontend
    const records: AcademicRecord[] = kardexRows.map(
      (r: KardexRowExtended) => ({
        semester: `Semestre ${r.periodo_id}`,
        subject: r.materia_nombre, // Usamos el nombre de la materia
        grade: parseFloat(r.calificacion),
        status: r.estatus === "ACREDITADA" ? "Aprobada" : "Reprobada",
      })
    );

    const studentData: StudentData = {
      name: `${student.nombre} ${student.apellido_paterno} ${
        student.apellido_materno || ""
      }`.trim(),
      expediente: expedienteStr,
      currentGroup: "Grupo X", // Ajusta si tienes info real
      email: student.correo,
      records,
    };

    return NextResponse.json(studentData);
  } catch (err) {
    console.error("Error en GET /api/students/[expediente]:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
