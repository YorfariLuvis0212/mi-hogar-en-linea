# Mi Hogar en Línea

Marketplace inmobiliario de arrendamiento con mercado inicial en Quibdó, Chocó
(Colombia). Publicación directa por propietarios, mensajería interna privada,
visitas, favoritos y paneles de gestión.

> Reconstrucción moderna del sistema anterior (PHP/MySQL), que se conserva
> únicamente como referencia funcional en [`docs/legacy/`](./docs/legacy). El
> contexto técnico vigente está en [AGENTS.md](./AGENTS.md) y el historial de
> cambios en [BITACORA.md](./BITACORA.md).

## Arquitectura

Monorepo con **dos aplicaciones independientes** y paquetes compartidos
(pnpm Workspaces + Turborepo). Detalle en
[docs/architecture](./docs/architecture/README.md).

```
apps/web        Next.js 16 — catálogo, paneles y autenticación
apps/api        NestJS — API REST del marketplace
packages/       contracts (Zod, roles), database (Prisma), config (tsconfig)
```

## Stack

Next.js 16 · React 19 · NestJS 11 · TypeScript · Tailwind CSS 4 · shadcn/ui ·
Prisma 7 · PostgreSQL (Neon) · better-auth · Zod · Vitest · Turborepo ·
Vercel. Gestor de paquetes: **pnpm** (no usar npm).

## Puesta en marcha

```bash
pnpm install
cp .env.example .env      # completa DATABASE_URL y BETTER_AUTH_SECRET
pnpm db:generate          # genera el cliente de Prisma
pnpm db:migrate           # aplica las migraciones en la base local
pnpm db:seed              # datos sintéticos (no se ejecuta en producción)
pnpm dev                  # compila los paquetes y levanta web + api
```

- Web: http://localhost:3000
- API: http://localhost:3001/health

Los paquetes compartidos (`@mh/contracts`, `@mh/database`) se compilan
automáticamente antes de las tareas de las aplicaciones.

## Estructura

```
apps/
  web/
    src/app/         Rutas (App Router)
    src/components/  Componentes compartidos (ui, layout, forms)
    src/lib/         Infraestructura (auth, form, format, utils)
    src/modules/     Dominios funcionales (identity, properties, messaging, ...)
    prisma/seed.ts   Datos de demostración
  api/
    src/             Módulos NestJS por dominio
packages/
  contracts/         Esquemas Zod, roles y permisos compartidos
  database/          Esquema Prisma, migraciones y cliente
  config/            tsconfig base del monorepo
docs/                Documentación (arquitectura, equipo, legacy)
```

## Scripts

| Comando                             | Descripción                                   |
| ----------------------------------- | --------------------------------------------- |
| `pnpm dev`                          | Desarrollo (web + api, con build de paquetes) |
| `pnpm build`                        | Build de producción de todas las aplicaciones |
| `pnpm lint`                         | ESLint en todos los paquetes que lo definen   |
| `pnpm typecheck`                    | Validación de tipos                           |
| `pnpm test` / `pnpm test:run`       | Pruebas (watch / una vez)                     |
| `pnpm format` / `pnpm format:check` | Formateo con Prettier                         |
| `pnpm db:generate`                  | Genera el cliente de Prisma                   |
| `pnpm db:migrate`                   | Migraciones en desarrollo                     |
| `pnpm db:deploy`                    | Aplica migraciones (entornos)                 |
| `pnpm db:push`                      | Sincroniza el esquema sin migración           |
| `pnpm db:studio`                    | Prisma Studio                                 |
| `pnpm db:seed`                      | Datos de ejemplo                              |

Para trabajar en una sola aplicación: `pnpm --filter @mh/web dev` o
`pnpm --filter @mh/api dev`.

## Contribución

- Reparto de trabajo y responsabilidades: [docs/team/roles.md](./docs/team/roles.md).
- Trabaja en ramas cortas por issue: `feat/mh-123-descripcion`, `fix/...`,
  `chore/...`, `docs/...`.
- Antes de abrir un PR, ejecuta `pnpm lint`, `pnpm typecheck`, `pnpm test:run`
  y `pnpm build`.
- Cada PR requiere revisión de otro desarrollador y CI en verde.
- No incluyas secretos, credenciales ni datos personales.
