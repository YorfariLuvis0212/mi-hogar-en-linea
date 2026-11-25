# Arquitectura del monorepo

Mi Hogar en Línea se organiza como **un repositorio con dos aplicaciones
independientes y paquetes compartidos** (monorepo gestionado con pnpm
Workspaces y Turborepo).

```
mi-hogar-en-linea/
├── apps/
│   ├── web/                # @mh/web  — Next.js 16 (catálogo, paneles, autenticación)
│   └── api/                # @mh/api  — NestJS (API REST del marketplace)
├── packages/
│   ├── contracts/          # @mh/contracts — DTO, esquemas Zod, roles y permisos
│   ├── database/           # @mh/database  — Prisma, migraciones y cliente
│   └── config/             # @mh/config    — tsconfig base compartido
├── docs/                   # Documentación vigente (este directorio + legacy/)
├── .github/                # CI y plantillas de PR/issue
├── AGENTS.md               # Contexto técnico vigente
└── BITACORA.md             # Bitácora de cambios
```

## Por qué un monorepo

- **Contratos compartidos sin publicar paquetes**: `@mh/contracts` y
  `@mh/database` se consumen por enlace de workspace (`workspace:*`), por lo que
  frontend y API siempre comparten los mismos tipos y el mismo esquema.
- **Cambios atómicos**: una modificación que afecta a ambos lados se revisa en
  un único Pull Request.
- **CI/CD por aplicación**: Turborepo ejecuta cada tarea sólo en los paquetes
  afectados; Vercel despliega `apps/web` y `apps/api` como proyectos separados.

## Paquetes y su compilación

| Paquete         | Consumidor | Salida                                 |
| --------------- | ---------- | -------------------------------------- |
| `@mh/contracts` | web, api   | `dist/` (CommonJS + tipos) vía `tsc`   |
| `@mh/database`  | web, api   | `dist/` (CommonJS + tipos) vía `tsc`   |
| `@mh/config`    | todos      | `tsconfig.base.json` (sin compilación) |

`@mh/contracts` y `@mh/database` se **compilan antes** de que los consuman las
aplicaciones. Turborepo lo garantiza: las tareas `build`, `typecheck`,
`test:run` y `dev` declaran `dependsOn: ["^build"]`.

> Nota: el cliente de Prisma debe generarse una vez (`pnpm db:generate`) antes
> del primer build.

## Variables de entorno

Ver [`.env.example`](../../.env.example). Cada aplicación/paquete usa su propia
configuración:

- `packages/database`: `DATABASE_URL`.
- `apps/web`: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`,
  `NEXT_PUBLIC_APP_URL`.
- `apps/api`: `DATABASE_URL`, `PORT`, `WEB_ORIGIN`.

## Comunicación en tiempo real

La mensajería privada del primer alcance se resuelve con server actions y
consultas puntuales. **No se implementa WebSocket en el primer sprint**: las
funciones serverless de Vercel no alojan conexiones persistentes de forma
nativa. Cuando se requiera tiempo real se evaluará un servicio gestionado
(Realtime) o alojamiento compatible, y la decisión se registrará en
`BITACORA.md`.

## Despliegue

- `apps/web` → Vercel (proyecto propio, root directory `apps/web`).
- `apps/api` → servicio compatible con procesos Node persistentes.
- Base de datos → Neon PostgreSQL; migraciones con `pnpm db:deploy`.
