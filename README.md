# Nutrición Con Enfoque

Aplicación web privada para gestionar nutrición, entrenamiento y seguimiento profesional. La versión 1.0 incluye autenticación y roles, clientes, planes y documentos de nutrición, hábitos, ejercicios, rutinas, calendario, progreso, recursos, blog, notificaciones y configuración de cuenta.

## Stack

- Next.js con App Router
- TypeScript
- Tailwind CSS
- Supabase con `@supabase/ssr` y `@supabase/supabase-js`
- pnpm como gestor de dependencias, con `pnpm-lock.yaml` como único archivo de bloqueo

## Requisitos

- Node.js 20.9.0 o superior
- pnpm 10 o superior (la versión exacta usada por el proyecto está fijada en el campo `packageManager` de `package.json`)
- Un proyecto de Supabase con las migraciones del directorio `supabase/migrations/` aplicadas

## Configuración local

1. Instala las dependencias bloqueadas:

```bash
pnpm install --frozen-lockfile
```

2. Crea el archivo local de entorno:

```powershell
Copy-Item .env.example .env.local
```

3. Completa las variables necesarias y ejecuta el servidor de desarrollo:

```bash
pnpm dev
```

La aplicación queda disponible en `http://localhost:3000`.

## Variables de entorno

| Variable | Uso |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL pública del proyecto de Supabase. Requerida. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave pública recomendada de Supabase. Puede sustituirse por `NEXT_PUBLIC_SUPABASE_ANON_KEY`. |
| `SUPABASE_SECRET_KEY` | Clave privada para operaciones administrativas del servidor. Puede sustituirse por `SUPABASE_SERVICE_ROLE_KEY`. |
| `REGISTER_ACCESS_CODE` | Habilita y protege el registro de cuentas. Sin valor, el registro queda deshabilitado. |
| `PROFESSIONAL_REGISTER_ACCESS_CODE` | Protege la creación administrativa de cuentas profesionales. |
| `RESOURCE_PDF_MAX_SIZE_BYTES` | Límite opcional para PDF de recursos; por defecto, 10 MiB. |
| `NUTRITION_PDF_MAX_SIZE_BYTES` | Límite opcional para PDF de nutrición; por defecto, 10 MiB. |

Las variables privadas nunca deben usar el prefijo `NEXT_PUBLIC_` ni guardarse en el repositorio. `.env.local` está excluido por `.gitignore`; `.env.example` contiene únicamente nombres y valores de ejemplo no sensibles.

## Scripts

| Comando | Propósito |
| --- | --- |
| `pnpm dev` | Inicia Next.js en modo desarrollo. |
| `pnpm lint` | Ejecuta ESLint sobre el proyecto. |
| `pnpm build` | Genera y valida el build de producción. |
| `pnpm start` | Inicia el servidor sobre un build existente. |
| `pnpm audit` | Revisa las dependencias frente a avisos de seguridad conocidos. |

## Verificación para producción

```bash
pnpm lint
pnpm build
pnpm start
```

Antes del despliegue, configura las variables de entorno en la plataforma de producción y no copies `.env.local`, `node_modules` ni `.next` desde una máquina de desarrollo.
