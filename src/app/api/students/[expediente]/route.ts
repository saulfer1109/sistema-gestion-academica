import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/app/lib/db"; // Ajusta la ruta si tu db.ts está en otro lugar

// 🔹 Tipos
interface StudentRow {
  id: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  correo: string;
}

interface KardexRow {
  id: number;
  alumno_id: number;
  materia_id: number;
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

    const expedienteNum = parseInt(expediente, 10);
    if (isNaN(expedienteNum)) {
      return NextResponse.json({ error: "Expediente inválido" }, { status: 400 });
    }

    // 🔹 Traer alumno
    const studentResult = await pool.query(
      `SELECT id, nombre, apellido_paterno, apellido_materno, correo
       FROM alumno
       WHERE expediente = $1`,
      [expedienteNum]
    );

    const studentRows: StudentRow[] = studentResult.rows;
    if (!studentRows.length) {
      return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404 });
    }
    const student = studentRows[0];

    // 🔹 Traer calificaciones del kardex
    const kardexResult = await pool.query(
      `SELECT * FROM kardex WHERE alumno_id = $1`,
      [student.id]
    );
    const kardexRows: KardexRow[] = kardexResult.rows;

    // 🔹 Transformar datos para frontend
    const records: AcademicRecord[] = kardexRows.map((r: KardexRow) => ({
      semester: `Semestre ${r.periodo_id}`,
      subject: `Materia ${r.materia_id}`,
      grade: parseFloat(r.calificacion),
      status: r.estatus === "ACREDITADA" ? "Aprobada" : "Reprobada",
    }));

    const studentData: StudentData = {
      name: `${student.nombre} ${student.apellido_paterno} ${student.apellido_materno}`,
      expediente,
      currentGroup: "Grupo X", // Ajusta si tienes info real
      email: student.correo,
      records,
    };

    return NextResponse.json(studentData);
  } catch (err) {
    console.error("Error en GET /api/students/[expediente]:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
