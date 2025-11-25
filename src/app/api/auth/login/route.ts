import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/app/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Correo y contraseña obligatorios." }, { status: 400 });
    }

    // 1. Buscar el usuario, sus datos de profesor y sus roles
    // Hacemos JOIN con profesor, usuario_rol y rol
    const query = `
      SELECT 
        u.id as usuario_id,
        u.email,
        u.password_hash,
        u.activo,
        p.id as profesor_id,
        p.nombre,
        p.apellido_paterno,
        ARRAY_AGG(r.nombre) as roles
      FROM public.usuario u
      LEFT JOIN public.profesor p ON p.usuario_id = u.id
      LEFT JOIN public.usuario_rol ur ON ur.usuario_id = u.id
      LEFT JOIN public.rol r ON r.id = ur.rol_id
      WHERE u.email = $1
      GROUP BY u.id, p.id
    `;

    const result = await pool.query(query, [email]);

    // 2. Validar si el usuario existe
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Credenciales inválidas." }, { status: 401 });
    }

    const user = result.rows[0];

    // 3. Validar si el usuario está activo
    if (!user.activo) {
      return NextResponse.json({ error: "Usuario inactivo. Contacte al administrador." }, { status: 403 });
    }

    // 4. Validar si tiene el rol de PROFESOR
    // (El array de roles puede contener null si no tiene roles, filtramos eso)
    const roles = user.roles.filter((r: string) => r !== null);
    if (!roles.includes('PROFESOR')) {
      return NextResponse.json({ error: "No tiene permisos de Profesor." }, { status: 403 });
    }

    // 5. Comparar contraseñas (Lo que escribió el usuario vs Hash en DB)
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return NextResponse.json({ error: "Credenciales inválidas." }, { status: 401 });
    }

    // 6. Login Exitoso
    return NextResponse.json({
      message: "Bienvenido",
      user: {
        id: user.usuario_id,
        profesorId: user.profesor_id,
        email: user.email,
        nombre: `${user.nombre} ${user.apellido_paterno}`,
        roles: roles
      }
    });

  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}