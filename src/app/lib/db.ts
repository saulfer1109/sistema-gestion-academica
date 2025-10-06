import pkg from "pg";
const { Pool } = pkg;

// Configuración SSL basada en la documentación de Supabase/pg
const isSslEnabled = process.env.DB_SSL === "true";
const sslConfig = isSslEnabled 
    ? { 
        // Supabase usa certificados auto-firmados en el pooler,
        // por lo que usualmente necesitamos desactivar la verificación estricta.
        rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false" 
      }
    : false;

// 🔹 Configuración de conexión a Supabase/PostgreSQL
export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 6543, // Usamos 6543 como fallback ya que es el puerto del pooler
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: sslConfig, // Usamos la configuración SSL definida arriba
  
  // Opcional: Propiedades para hacer la conexión más resiliente al pooler
  connectionTimeoutMillis: 15000, 
  idleTimeoutMillis: 30000,
});

// 🔹 Función opcional para probar la conexión
export async function testConnection() {
  try {
    const client = await pool.connect();
    console.log("Conexión a la base de datos exitosa");
    client.release();
  } catch (err) {
    console.error("Error conectando a la base de datos:", err);
    // Lanzamos el error para que Next.js lo capture correctamente
    throw new Error("Fallo al inicializar la conexión con la base de datos. Verifique credenciales.");
  }
}
