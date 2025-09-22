// next.config.ts
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Desactivar Turbopack completamente
  experimental: {
    turbopack: false,
  },
  // Configuración de Webpack (opcional, pero recomendada)
  webpack: (config: any) => {
    return config;
  },
};

export default nextConfig;