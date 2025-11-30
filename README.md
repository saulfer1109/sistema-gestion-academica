# Sistema de Gestión Académica (SGA) - Módulo Profesores

Sistema web integral desarrollado para la Universidad de Sonora, diseñado para optimizar la gestión académica por parte de los docentes. Permite el control eficiente de asistencias, calificaciones y la generación de reportes académicos mediante una interfaz moderna e intuitiva.

![Next.js](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC)

## 📋 Características Principales

### 👨‍🏫 Módulo de Profesores
* **Dashboard Interactivo:** Vista rápida de grupos asignados y notificaciones importantes.
* **Gestión de Asistencia:**
    * Pase de lista vía web con validación de "una vez al día" para evitar duplicados.
    * Carga y actualización masiva de listas de asistencia mediante archivos Excel/CSV.
    * Descarga de plantillas de asistencia personalizadas por grupo.
    * Sistema de justificación de faltas integrado.
* **Alertas Tempranas:**
    * Semáforo de riesgo por inasistencias (Normal, Advertencia, Crítico, Sin Derecho).
    * Campana de notificaciones global para alumnos en riesgo de reprobación.
* **Calificaciones:**
    * Consulta de historial académico por Alumno (Expediente), Grupo o Semestre.
    * Subida de actas de calificaciones (Ordinario, Extraordinario, Final) vía Excel.
* **Reportes Académicos:**
    * Generación automática de reportes de elegibilidad para Servicio Social y Prácticas Profesionales.
    * Exportación de reportes a PDF con formato institucional.
* **Seguridad y Accesibilidad:**
    * Autenticación segura con encriptación de contraseñas (bcrypt).
    * Recuperación de contraseña vía correo electrónico (token de verificación).
    * Diseño responsivo y accesible.

## 🛠️ Tecnologías Utilizadas

* **Frontend:** [Next.js 15](https://nextjs.org/) (App Router), [React 19](https://react.dev/).
* **Lenguaje:** [TypeScript](https://www.typescriptlang.org/).
* **Base de Datos:** [PostgreSQL](https://www.postgresql.org/) (Conexión nativa con `pg`).
* **Estilos:** [Tailwind CSS](https://tailwindcss.com/).
* **Herramientas Adicionales:**
    * `xlsx` (SheetJS): Procesamiento de archivos Excel.
    * `jspdf` & `jspdf-autotable`: Generación de reportes PDF.
    * `lucide-react`: Iconografía.
    * `bcryptjs`: Seguridad y hashing.

## 🚀 Instalación y Configuración

Sigue estos pasos para levantar el proyecto en tu entorno local:

### 1. Clonar el repositorio
```bash
git clone [https://github.com/saulfer1109/sistema-gestion-academica](https://github.com/saulfer1109/sistema-gestion-academica)
cd sistema-gestion-academica
git branch PDS2_1.1

2. Instalar dependencias
npm install

3. Configurar Variables de Entorno
Crea un archivo .env en la raíz del proyecto y configura tus credenciales de base de datos:
# Configuración de Base de Datos (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=tu_nombre_de_bd
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_contraseña
DB_SSL=false

4. Ejecutar el servidor de desarrollo
npm run dev
Abre http://localhost:3000 en tu navegador.

📂 Estructura del Proyecto

📂 public/
    Archivos estáticos accesibles públicamente (imágenes, iconos).

    Contiene el logo (logounison.png) y vectores SVG usados en la interfaz.

📂 src/
    Código fuente principal de la aplicación.

📂 src/app/
    Contiene el App Router de Next.js. Cada carpeta aquí representa una ruta en la URL o un endpoint de API.

    layout.tsx: El diseño maestro (Header con Logo + NavBar) que envuelve a todas las páginas.

    page.tsx: Página de aterrizaje (Landing).

    globals.css: Estilos globales de Tailwind CSS.

    data-source.ts: Archivo de configuración de TypeORM (Recomendado eliminar si solo usas pg directo).

    Rutas de Páginas (Frontend):

📂 inicio/: Dashboard principal del profesor con resumen de grupos y notificaciones.

📂 login/: Pantalla de inicio de sesión.

📂 recuperar-contrasena/: Flujo para restablecer la contraseña vía correo.

📂 reportes/: Módulo para generar reportes PDF de elegibilidad (Servicio/Prácticas).

📂 alertas-faltas/: Pantalla del semáforo de riesgo y justificación de inasistencias.

📂 configuracion-perfil/: Pantalla de ajustes de usuario.

📂 calificaciones/: Módulo de gestión de notas.

    consultar-calificaciones/: Historial académico por alumno/grupo/semestre.

    subir-calificaciones/: Interfaz para carga masiva de actas Excel.

📂 curso/: Gestión de un grupo específico.

    informacion/: Lista de asistencia, descarga de plantillas y pase de lista web.

    page.tsx: Página para cargar la lista inicial de alumnos.

📂 alumno/: (Módulo en desarrollo/integración)

    [expediente]/: Perfil individual del alumno.

📂 alumno-grupo/: (Posible módulo auxiliar o en desuso).

    Rutas de API (Backend):

📂 src/app/api/

📂 auth/: Autenticación.

    login/: Validación de credenciales.

    forgot-password/: Envío de códigos de recuperación.

    reset-password/: Cambio de contraseña.

📂 attendance/: Lógica de asistencia.

    alerts/: Cálculo de semáforos y notificaciones de riesgo.

    check-status/: Verificación de "pase de lista diario".

    justify/: Justificación de faltas.

    save/: Guardado de asistencia web.

📂 groups/: Gestión moderna de grupos (filtrado por profesor).

    route.ts: Obtener grupos asignados.

    upload-students/: Procesamiento de Excel para inscribir alumnos.

    [id]/details/: Detalles del encabezado (Horario/Aula).

    [id]/grades/: Obtener alumnos con calificaciones.

📂 grupos/: (Legacy) Rutas anteriores de gestión de grupos.

📂 periods/: Catálogo de semestres.

📂 reports/: Lógica para reporte de elegibilidad.

📂 student-groups/: Obtención de lista de alumnos (Kardex + Excel) ordenada.

📂 students/: Datos específicos de alumnos.

    [expediente]/: Datos por alumno individual.

    grades-by-period/: Historial filtrado por semestre.

📂 upload-calificaciones/: Procesamiento de Excel de calificaciones.

📂 src/components/
    Componentes reutilizables de la interfaz (UI).

    NavBar.tsx: Barra de navegación principal (azul/dorada).

📂 Alertas/: Tablas específicas para el módulo de alertas.

📂 ui/: Elementos atómicos y modales.

    NotificationBell.tsx: Campana de notificaciones con lógica de alertas.

    FileUpload.tsx / FileUploadModal.tsx: Componentes para subir Excel.

    ModalAsistencia.tsx: Tabla interactiva para pasar lista.

    CardMateria.tsx: Tarjetas del dashboard de inicio.

    Inputs, Botones, Checkboxs, Modales de error/confirmación, etc..

📂 src/lib/
    Configuraciones base y utilerías.

    db.ts: Configuración de la conexión a PostgreSQL (Pool).

    reports.ts: Funciones auxiliares para reportes.

📂 src/services/
    Lógica de negocio compleja (separada de los componentes).

    excel.service.ts: Lógica general de Excel.

    excel-students.service.ts: Parser inteligente para listas de asistencia.

    excel-grades.service.ts: Parser inteligente para actas de calificaciones.

📂 src/types/
    Definiciones de tipos de TypeScript.

    alertas.ts: Interfaces para las alertas de asistencia.

    global.d.ts / pg.d.ts: Tipos globales y extensiones para la DB.

👥 Colaboradores
Proyecto desarrollado para la materia de Prácticas de Desarrollo de Sistemas II de la Universidad de Sonora.

Líderes de Proyecto: Alvarez Portillo Lilian

Desarrollo Backend/Frontend: 
    -Jefe desarrollo BackEnd: Espinoza Rivera Saul Filiberto 
    -Desarrollador BackEnd: Cervantes Sousa Orlando
    -Desarrollador FrontEnd: Valencia Loroña Maria Yamile
    -Desarrollador FrontEnd: Cubillas Lagarda Jose Héctor 
    -Desarrollador FrontEnd: Moreno Gonzales Isaac
    -Desarrollador FrontEnd: Barrera Ruiz Alejandra Patricia
    -Tester: Corella Marquez Mario Felipe

© 2025 Universidad de Sonora. Todos los derechos reservados.