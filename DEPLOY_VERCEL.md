# 🏰 Guía de Despliegue en Vercel - La Taberna del Explorador

Esta guía te explica cómo llevar la aplicación y tu base de datos a producción en **Vercel**.

---

## ⚠️ Importante sobre Bases de Datos en Vercel

Vercel ejecuta las funciones de Next.js en servidores **Serverless** (sin disco local persistente). Por esta razón, el archivo local SQLite (`dev.db`) no retiene información entre peticiones en la nube.

La solución estándar y recomendada es conectar tu proyecto a una base de datos **PostgreSQL gratuita en la nube**, como:
- **[Neon](https://neon.tech/)** (PostgreSQL Serverless gratuito, recomendado por Vercel).
- **[Supabase](https://supabase.com/)** (PostgreSQL gratuito).
- **Vercel Postgres** (Integrado directamente en el panel de Vercel).

---

## 📦 Paso 1: Datos ya Exportados

Tu base de datos actual ya fue exportada a un archivo JSON limpio y transportable:
- **`exported_data.json`**: Contiene todos los juegos, componentes de inventario, usuarios, alquileres y reservas.
- **`npm run db:export`**: Puedes volver a ejecutar este comando en cualquier momento para actualizar la copia de seguridad.

---

## 🌐 Paso 2: Crear tu Base de Datos en la Nube (2 minutos)

1. Ve a **[Neon.tech](https://neon.tech/)** o **[Supabase.com](https://supabase.com/)** y crea una cuenta gratuita.
2. Crea un nuevo proyecto (por ejemplo: `la-taberna-db`).
3. Copia tu cadena de conexión (`Connection String` o `DATABASE_URL`). Tendrá un formato similar a:
   ```env
   postgresql://usuario:password@ep-cool-fog-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

---

## ⚙️ Paso 3: Configurar Prisma para PostgreSQL

En el archivo `prisma/schema.prisma`, cambia las primeras líneas por:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

Crea un archivo local `.env` en la raíz del proyecto (o usa PowerShell) con tu URL:
```env
DATABASE_URL="tu_conexion_de_neon_o_supabase"
```

Luego, ejecuta en tu terminal para crear las tablas en la nube e importar todos tus datos:
```bash
# 1. Crear las tablas en la base de datos en la nube
npx prisma db push

# 2. Restaurar todos los datos exportados automáticamente
npm run db:import
```

¡Listo! Todos los juegos, inventario y registros estarán cargados en tu base de datos de producción.

---

## 🚀 Paso 4: Desplegar en Vercel

1. **Sube tu código a GitHub / GitLab**:
   ```bash
   git add .
   git commit -m "Preparado para despliegue en Vercel con datos exportados"
   git push origin main
   ```

2. **Conecta tu proyecto en Vercel**:
   - Entra en [vercel.com](https://vercel.com) e inicia sesión.
   - Haz clic en **"Add New..."** -> **"Project"**.
   - Selecciona tu repositorio de GitHub.

3. **Configura la Variable de Entorno**:
   - En la sección **Environment Variables**:
     - **Name**: `DATABASE_URL`
     - **Value**: Tu cadena de conexión PostgreSQL (`postgresql://...`)
   - *(El script `postinstall: "prisma generate"` ya está configurado en `package.json`, por lo que Vercel compilará automáticamente sin errores).*

4. **Haz clic en "Deploy"**:
   - En aproximadamente 1 minuto tu web estará online con dominio `.vercel.app`, catálogo público temático, buscador, reservas por WhatsApp, panel de administración, firmas digitales y descarga de remitos en PDF.
