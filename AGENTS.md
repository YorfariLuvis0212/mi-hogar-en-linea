# Mi Hogar en Línea — Contexto técnico (nuevo sistema)

Documento de contexto vigente del repositorio. Reúne el alcance del producto,
las decisiones técnicas aprobadas y las convenciones de trabajo del equipo.
El historial de cambios vive en [BITACORA.md](./BITACORA.md).

El proyecto es un **monorepo** con dos aplicaciones independientes (`apps/web`
en Next.js y `apps/api` en NestJS) y paquetes compartidos (`packages/`).
Detalle en [docs/architecture](./docs/architecture/README.md) y reparto de
trabajo en [docs/team/roles.md](./docs/team/roles.md).

## 1. Producto

| Atributo           | Definición                                                   |
| ------------------ | ------------------------------------------------------------ |
| Producto           | Mi Hogar en Línea                                            |
| Mercado inicial    | Quibdó, Chocó, Colombia                                      |
| Modelo             | Marketplace inmobiliario de dos lados (arrendamiento)        |
| Plataforma         | Aplicación web responsiva (mobile-first), compatible con PWA |
| Idioma de interfaz | Español                                                      |
| Moneda             | COP                                                          |
| Zona horaria       | America/Bogota                                               |
| Equipo             | Cuatro desarrolladores                                       |

Objetivos: visibilizar la oferta de arrendamiento local, facilitar búsqueda y contacto
directo y privado, incorporar controles de confianza y antifraude y construir un
producto mantenible y escalable a otras ciudades de Colombia.

La plataforma facilita el contacto y la gestión. No representa jurídicamente a las
partes, no garantiza titularidad ni seguridad física de los encuentros.

## 2. Estado del proyecto

Este repositorio es una **reconstrucción** del sistema anterior (PHP/MySQL), que se usa
únicamente como referencia funcional. No se continúa desarrollando sobre PHP.

Implementado y verificado:

- Identidad: registro, inicio de sesión, sesión con roles/estado, perfil y cierre de sesión.
- Publicaciones: creación, edición, disponibilidad, archivo y moderación por estado.
- Catálogo: portada, listado con filtros, paginación y ficha con galería.
- Mensajería interna privada entre participantes.
- Visitas: solicitud y respuesta (aceptar, rechazar, cancelar, completar).
- Favoritos y notificaciones.
- Paneles: resumen, mis inmuebles, mensajes, visitas, favoritos y perfil.
- Calidad: lint, tipos, pruebas, build y CI.
- Monorepo: `apps/web` (Next.js) reutilizado sin cambios de lógica, `apps/api`
  (NestJS) como esqueleto y paquetes compartidos `@mh/contracts`, `@mh/database`
  y `@mh/config`.

Pendiente (backlog de equipo, no iniciado):

- Panel de administración y moderación, reportes, bloqueos y suspensión de cuentas.
- Analítica operativa, métricas del marketplace y monetización sin publicidad externa.
- Arrendamientos y contratos (alcance y requisitos legales diferenciados).
- PWA y optimizaciones avanzadas de rendimiento/SEO.
- Modelo de datos del sistema anterior migrado (si se aprueba traer datos reales).

## 3. Stack y restricciones

| Capa               | Tecnología                                                                                     |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| Framework (web)    | Next.js 16 (App Router, Turbopack)                                                             |
| Framework (API)    | NestJS 11 (REST, módulos por dominio)                                                          |
| Monorepo           | pnpm Workspaces + Turborepo                                                                    |
| UI                 | React 19, Tailwind CSS 4, shadcn/ui (estilo `base-nova` sobre `@base-ui/react`)                |
| Lenguaje           | TypeScript estricto                                                                            |
| Autenticación      | better-auth (adaptador Prisma, plugin `nextCookies`)                                           |
| Base de datos      | PostgreSQL en Neon                                                                             |
| ORM                | Prisma 7 con adaptadores (`@prisma/adapter-neon` en producción, `@prisma/adapter-pg` en local) |
| Validación         | Zod                                                                                            |
| Pruebas            | Vitest + Testing Library (jsdom)                                                               |
| Calidad            | ESLint, Prettier (+ plugin Tailwind), CI en GitHub Actions                                     |
| Despliegue         | Vercel                                                                                         |
| Gestor de paquetes | **pnpm** (no usar npm)                                                                         |

Restricciones vigentes:

- No usar PHP, MySQL, XAMPP ni Cloudinary.
- Evitar microservicios, Redis, colas y servicios pagos sin requisito comprobado.
- No versionar secretos, credenciales, datos personales ni binarios de `uploads/`.
- No introducir abstracciones innecesarias; cada decisión responde a un requisito real.

## 4. Estructura del repositorio

```
mi-hogar-en-linea/
├── apps/
│   ├── web/                # @mh/web — Next.js 16 (App Router)
│   │   ├── prisma/         # seed de datos de demostración
│   │   └── src/
│   │       ├── app/        # Rutas (App Router). Páginas y route handlers
│   │       ├── components/ # Componentes compartidos (ui/, layout/, forms/)
│   │       ├── lib/        # Infraestructura: auth, form, format, utils
│   │       └── modules/    # Dominios funcionales (ver abajo)
│   └── api/                # @mh/api — NestJS (API REST)
├── packages/
│   ├── contracts/          # @mh/contracts — Zod, roles y permisos compartidos
│   ├── database/           # @mh/database — Prisma, migraciones y cliente
│   └── config/             # @mh/config — tsconfig base del monorepo
├── docs/                   # architecture/, team/ y legacy/
├── AGENTS.md
├── BITACORA.md
└── .github/                # CI y plantillas de PR/issue
```

Dominios en `apps/web/src/modules/`:

| Módulo           | Rol                                                                               |
| ---------------- | --------------------------------------------------------------------------------- |
| `identity/`      | Sesión, acciones y formularios de cuenta (esquemas y permisos en `@mh/contracts`) |
| `properties/`    | Servicio, acciones, filtros, tarjeta, formulario y favoritos-visual               |
| `messaging/`     | Conversaciones, mensajes y acciones                                               |
| `visits/`        | Solicitudes de visita y respuestas                                                |
| `favorites/`     | Inmuebles guardados                                                               |
| `notifications/` | Notificaciones por usuario                                                        |
| `audit/`         | Registro auditable de operaciones sensibles                                       |

Cada dominio sigue el patrón: esquemas Zod (en `@mh/contracts`) → `service.ts`
(lecturas) → `actions.ts` (server actions) → componentes `*.tsx`. Los servicios
migran progresivamente hacia `apps/api` (NestJS).

## 5. Convenciones

- **Idioma**: interfaz, mensajes y documentación en español; identificadores de código en inglés.
- **Rutas**: en español (`/propiedades`, `/panel/inmuebles`, `/iniciar-sesion`).
- **Alias**: `@/*` → `./src/*` dentro de `apps/web`.
- **Validación**: toda entrada se valida con Zod en el servidor antes de persistir.
- **Autorización**: se verifica en el servidor por rol y por pertenencia del recurso.
- **Errores**: `FormState` centralizado (`{ status, message, fieldErrors }`) para formularios.
- **UI**: componentes `base-nova` usan la prop `render={<Link .../>}` (no `asChild`).
- **Estilos**: tokens en `src/app/globals.css` (`@theme inline`); no usar colores sueltos.

## 6. Modelo de datos (resumen)

`User` (rol `USER|ADMIN|SUPER_ADMIN`, estado `ACTIVE|SUSPENDED|DELETED`), `Account`,
`Session`, `Verification` · `Property` (moderación y disponibilidad independientes),
`PropertyMedia`, `Favorite` · `Conversation`, `ConversationParticipant`, `Message` ·
`Visit` · `Report`, `Block` · `Lease`, `Contract` · `Notification`, `AuditLog`.

Principio: la ubicación se expone a nivel de barrio; `addressLine` es privada y solo la
ven el propietario y los moderadores.

## 7. Seguridad y privacidad

- Autenticación mantenida (better-auth) con sesiones seguras y revocables.
- Autorización por rol, estado de cuenta y pertenencia; siempre en el servidor.
- Conversaciones privadas con acceso exclusivo a participantes.
- Protección de datos personales y de direcciones exactas.
- Validación y procesamiento seguro de entradas; mensajes antifraude en la interfaz.
- Registro auditable (`AuditLog`) de operaciones sensibles.
- Tratamiento de datos conforme a la legislación colombiana (revisión jurídica pendiente).

Deuda de seguridad conocida a resolver por el equipo:

- Rate limiting y controles antiabuso en server actions y endpoints.
- Cabeceras de seguridad y política de CSRF/CORS explícita en `proxy.ts`.
- Verificación de anunciantes y flujo privado de documentos de identidad.

## 8. Entornos y variables

Variables requeridas (ver `.env.example`): `DATABASE_URL`, `BETTER_AUTH_SECRET`,
`BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL` (web) y `PORT`, `WEB_ORIGIN` (API).

El adaptador de Prisma se elige por host: si `DATABASE_URL` apunta a `neon.tech`/`neon.build`
se usa `@prisma/adapter-neon`; en caso contrario, `@prisma/adapter-pg` (desarrollo local).

| Ambiente   | Finalidad                                  |
| ---------- | ------------------------------------------ |
| Desarrollo | PostgreSQL local y datos sintéticos (seed) |
| Preview    | Validación de PR con datos sintéticos      |
| Producción | Neon + Vercel, acceso restringido          |

## 9. Scripts

Se ejecutan desde la raíz del monorepo y se orquestan con Turborepo:

```bash
pnpm dev           # desarrollo de web + api (compila antes los paquetes)
pnpm build         # build de producción
pnpm lint          # ESLint
pnpm typecheck     # tsc --noEmit
pnpm test          # Vitest (modo watch)
pnpm test:run      # Vitest (una vez)
pnpm format        # Prettier
pnpm db:generate   # genera el cliente de Prisma
pnpm db:migrate    # migraciones en desarrollo
pnpm db:deploy     # aplica migraciones (entornos)
pnpm db:push       # sincroniza el esquema sin migración
pnpm db:studio     # Prisma Studio
pnpm db:seed       # datos de ejemplo (no ejecuta en producción)
```

Para una sola aplicación: `pnpm --filter @mh/web <script>` o
`pnpm --filter @mh/api <script>`.

## 10. Calidad y Definition of Done

Estrategia: pruebas unitarias de reglas de negocio, integración de servicios y, cuando
esté disponible el entorno, E2E de flujos críticos.

Definition of Done:

- [ ] Criterios de aceptación satisfechos.
- [ ] Validación de entradas, permisos y privacidad.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test:run` y `pnpm build` en verde.
- [ ] Migraciones versionadas y revisadas cuando aplique.
- [ ] Sin secretos ni datos personales.
- [ ] PR revisado y aprobado por otro desarrollador.
- [ ] `BITACORA.md` y este documento actualizados cuando corresponda.

## 11. Equipo y distribución de trabajo

| Responsable | Dominio                                | Ámbito                                                                                        |
| ----------- | -------------------------------------- | --------------------------------------------------------------------------------------------- |
| Dev 1       | Backend NestJS, identidad y seguridad  | `apps/api`, better-auth, autorización, cabeceras, antiabuso, despliegue de la API             |
| Dev 2       | Datos y dominio de propiedades         | `packages/database` (Prisma, migraciones), `packages/contracts`, propiedades y mensajería     |
| Dev 3       | Frontend público y experiencia (UX/UI) | Catálogo, búsqueda, filtros, ficha, favoritos, accesibilidad y SEO                            |
| Dev 4       | Paneles, formularios e interacción     | `/panel`, formularios, mensajería en UI, visitas, notificaciones, administración y moderación |

Revisión cruzada: Dev 1 ↔ Dev 4 (identidad/seguridad/comunicación) y Dev 2 ↔ Dev 3
(propiedades/catálogo/experiencia). Detalle, propietarios por ruta y primeras
tareas en [docs/team/roles.md](./docs/team/roles.md).

### Control de versiones

- `main` protegida; ramas de corta duración por issue.
- Convención de ramas: `feat/mh-123-descripcion`, `fix/mh-124-...`,
  `refactor/...`, `chore/...`, `docs/...`, `test/...`.
- Cada PR referencia su issue, describe el cambio, pruebas e impacto y requiere
  revisión humana y CI en verde antes de integrar.

## 12. Registro de decisiones

| ID    | Decisión                                                                                                 |
| ----- | -------------------------------------------------------------------------------------------------------- |
| D-101 | Reconstrucción completa en Next.js 16 + TypeScript; el PHP/MySQL queda como referencia funcional.        |
| D-102 | PostgreSQL en Neon como base de datos y Prisma 7 como ORM.                                               |
| D-103 | better-auth para identidad y sesiones.                                                                   |
| D-104 | shadcn/ui estilo `base-nova` (sobre `@base-ui/react`) con Tailwind CSS 4.                                |
| D-105 | pnpm como gestor de paquetes del repositorio.                                                            |
| D-106 | Arquitectura modular por dominios en `src/modules/`.                                                     |
| D-107 | Moderación y disponibilidad como estados independientes de la publicación.                               |
| D-108 | Dirección exacta privada por defecto; exposición a nivel de barrio.                                      |
| D-109 | Adaptador dual de Prisma (Neon en producción, pg en local).                                              |
| D-110 | Exclusión de publicidad externa; monetización por planes futuros.                                        |
| D-111 | Monorepo con pnpm Workspaces + Turborepo: `apps/web` y `apps/api` independientes.                        |
| D-112 | Paquetes compartidos `@mh/contracts`, `@mh/database` y `@mh/config`.                                     |
| D-113 | NestJS como backend independiente (REST); migración incremental desde el frontend.                       |
| D-114 | Prisma y las migraciones viven en `packages/database`, consumidos por ambas aplicaciones.                |
| D-115 | Sin WebSocket en el primer sprint: las funciones serverless de Vercel no alojan conexiones persistentes. |
