// src/app/api/students/[expediente]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

// Inicializamos Prisma con singleton
let prisma: PrismaClient;

if ((globalThis as any).prisma) {
  prisma = (globalThis as any).prisma;
} else {
  prisma = new PrismaClient();
  (globalThis as any).prisma = prisma;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { expediente: string | string[] } }
) {
  try {
    const expediente = Array.isArray(params.expediente)
      ? params.expediente[0]
      : params.expediente;

    console.log('Buscando alumno con expediente (entrada):', expediente);

    // Buscar flexible: con y sin "EXP"
    const student = await prisma.alumno.findFirst({
      where: {
        OR: [
          { expediente }, // lo que el usuario pasó
          {
            expediente: expediente.startsWith('EXP')
              ? expediente.slice(3) // si ya trae "EXP", probar sin prefijo
              : `EXP${expediente}`, // si no trae "EXP", probar con prefijo
          },
        ],
      },
      include: {
        calificacion: {
          include: {
            grupo: {
              include: {
                materia: true,
                periodo: true,
              },
            },
          },
        },
      },
    });

    if (!student) {
      console.log('Alumno no encontrado en la base de datos');
      return NextResponse.json({ error: 'Alumno no encontrado' }, { status: 404 });
    }

    console.log('Alumno encontrado:', student);

    // Transformar datos al formato que necesitas
    const formattedStudent = {
      name: `${student.nombre} ${student.apellido_paterno} ${
        student.apellido_materno || ''
      }`.trim(),
      expediente: student.expediente,
      currentGroup: 'N/A', // Ajusta si quieres mostrar su grupo actual
      email: student.correo,
      records: student.calificacion.map((calif: any) => ({
        semester: calif.grupo.periodo.etiqueta,
        subject: calif.grupo.materia.nombre,
        grade: parseFloat(calif.calificacion.toString()),
        status:
          parseFloat(calif.calificacion.toString()) >= 6.0
            ? 'Aprobada'
            : 'Reprobada',
      })),
    };

    return NextResponse.json(formattedStudent);
  } catch (error) {
    console.error('Error en /api/students/[expediente]:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
