import pkg from "pg";
const { Pool } = pkg;

// 🔹 Configuración de conexión a Supabase/PostgreSQL
export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false" } : false,
});

// 🔹 Función opcional para probar la conexión
export async function testConnection() {
  try {
    const client = await pool.connect();
    console.log("Conexión a la base de datos exitosa");
    client.release();
  } catch (err) {
    console.error("Error conectando a la base de datos:", err);
  }
}