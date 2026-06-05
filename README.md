# Herramienta privada de planificacion

Base inicial de una aplicacion privada para profesionales que necesitan crear y organizar contenido de entrenamiento y nutricion sin convertir todavia el producto en un SaaS completo.

## Stack

- Next.js con App Router
- TypeScript
- Tailwind CSS
- Supabase con `@supabase/ssr` y `@supabase/supabase-js`

## Configuracion local

1. Instala dependencias:

```bash
npm install
```

2. Crea tu archivo local de entorno:

```bash
copy .env.example .env.local
```

3. Completa las variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

4. Corre el proyecto:

```bash
npm run dev
```

La app queda disponible en `http://localhost:3000`.

## Estructura inicial

```txt
src/
  app/
    page.tsx
    login/
    register/
    app/
      layout.tsx
      dashboard/
  components/
    ui/
    layout/
    auth/
    motion/
  lib/
    auth/
    supabase/
    actions/
    validations/
    utils/
  types/
    database.ts
    routine.ts
    exercise.ts
```

## Siguiente fase

La siguiente fase puede conectar pantallas privadas reales para rutinas, ejercicios, nutricion, comidas y exportacion limpia. Todavia no se agregaron CRUD de contenido, clientes, pagos, chat, seguimiento, calendario ni exportacion final.
