# Mi Hogar en Línea

Marketplace inmobiliario de arrendamiento con mercado inicial en Quibdó, Chocó (Colombia).
Publicación directa por propietarios, mensajería interna privada, visitas, favoritos y
paneles de gestión.

> Reconstrucción moderna del sistema anterior (PHP/MySQL), que se conserva únicamente como
> referencia funcional. El contexto técnico vigente está en [docs/AGENTS.md](./docs/AGENTS.md)
> y el historial de cambios en [docs/BITACORA.md](./docs/BITACORA.md).

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui · Prisma 7 ·
PostgreSQL (Neon) · better-auth · Zod · Vitest · Vercel. Gestor de paquetes: **pnpm**.

## Puesta en marcha

```bash
pnpm install
cp .env.example .env      # completa DATABASE_URL y BETTER_AUTH_SECRET
pnpm db:generate
pnpm db:migrate           # aplica las migraciones en la base local
pnpm db:seed              # datos sintéticos (no se ejecuta en producción)
pnpm dev
```

La aplicación queda disponible en http://localhost:3000.

## Scripts

| Comando                       | Descripción                          |
| ----------------------------- | ------------------------------------ |
| `pnpm dev`                    | Servidor de desarrollo               |
| `pnpm build`                  | Build de producción                  |
| `pnpm start`                  | Servidor de producción               |
| `pnpm lint`                   | ESLint                               |
| `pnpm typecheck`              | Validación de tipos (`tsc --noEmit`) |
| `pnpm test` / `pnpm test:run` | Pruebas (watch / una vez)            |
| `pnpm format`                 | Formateo con Prettier                |
| `pnpm db:generate`            | Genera el cliente de Prisma          |
| `pnpm db:migrate`             | Migraciones en desarrollo            |
| `pnpm db:deploy`              | Aplica migraciones (entornos)        |
| `pnpm db:seed`                | Datos de ejemplo                     |

## Estructura

```
src/app/         Rutas (App Router)
src/components/  Componentes compartidos (ui, layout, forms)
src/lib/         Infraestructura (env, prisma, auth, form, format)
src/modules/     Dominios funcionales (identity, properties, messaging, visits, favorites, notifications, audit)
prisma/          Esquema, migraciones y seed
docs/            Contexto (AGENTS.md) y bitácora (BITACORA.md)
```

## Contribución

- Trabaja en ramas cortas por issue: `feat/mh-123-descripcion`, `fix/...`, `chore/...`, `docs/...`.
- Antes de abrir un PR, ejecuta `pnpm lint`, `pnpm typecheck`, `pnpm test:run` y `pnpm build`.
- Cada PR requiere revisión de otro desarrollador y CI en verde.
- No incluyas secretos, credenciales ni datos personales.
