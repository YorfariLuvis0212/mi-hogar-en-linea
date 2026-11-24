# Mi Hogar en Línea — Bitácora técnica (nuevo sistema)

## 1. Propósito

Registro cronológico de los cambios funcionales, técnicos y arquitectónicos del nuevo
sistema (`app/`). Complementa el historial de Git, las issues y los Pull Requests.

Documento de contexto vigente: [AGENTS.md](./AGENTS.md).
Historial del sistema anterior (PHP/MySQL, solo referencia): repositorio
`mi-hogar-en-linea/docs/BITACORA.md`.

## 2. Estándar de registro

- Una entrada por PR relevante, decisión arquitectónica, despliegue o incidente.
- Identificación por fecha ISO (`AAAA-MM-DD`), responsable y referencia verificable.
- Registro de cambios, impacto, validaciones y resultados efectivos.
- Historial conservado en orden cronológico; las rectificaciones se registran como nuevas entradas.
- Exclusión de secretos, credenciales, datos personales y conversaciones privadas.
- No se registra como terminado nada que no esté implementado y verificado.

## 3. Clasificación

`feat`, `fix`, `refactor`, `perf`, `security`, `test`, `migration`, `chore`, `docs`,
`decision`, `release`, `incident`. Los estados de validación se registran como
`PASS`, `FAIL`, `NO EJECUTADO` o `NO APLICA`.

## 4. Historial

### 2026-11-24 — INIT-001 Reconstrucción tecnológica y base del proyecto

- Tipo: `chore`, `decision`.
- Dominio: Arquitectura, infraestructura y documentación.
- Responsable: Equipo — inicialización.
- Referencia: rama `main` (árbol de trabajo, sin commit aún).
- Estado: Integrado en el árbol de trabajo; validado localmente.

#### Objetivo

Iniciar una base de código nueva, independiente de la implementación PHP/MySQL, con el
stack objetivo (Next.js, TypeScript, Tailwind, shadcn/ui, Prisma, Neon, Vercel) y las
convenciones de ingeniería del equipo.

#### Cambios realizados

- Inicialización de la aplicación Next.js 16 + React 19 + TypeScript en `app/`.
- Tailwind CSS 4 con sistema de tokens y paleta propia en `src/app/globals.css`.
- Componentes de shadcn/ui estilo `base-nova` (sobre `@base-ui/react`) en `src/components/ui/`.
- Prisma 7 con esquema del marketplace en `prisma/schema.prisma`, migración inicial
  (`prisma/migrations/20261124120000_init`) y seed de datos sintéticos.
- Adaptador de Prisma dual: `@prisma/adapter-neon` (producción) y `@prisma/adapter-pg` (local).
- Validación de variables de entorno con Zod (`src/lib/env.ts`) y `.env.example`.
- Estructura modular por dominios en `src/modules/`.
- Documentación del nuevo sistema en `docs/AGENTS.md` y `docs/BITACORA.md`.

#### Impacto técnico y funcional

Se establece la base sobre la que el equipo construirá los módulos. No migra datos ni
código del sistema anterior. La línea tecnológica (PHP, MySQL, XAMPP, Cloudinary) queda
descartada para la nueva solución.

#### Validación

| Verificación     | Resultado | Evidencia                    |
| ---------------- | --------- | ---------------------------- |
| `pnpm lint`      | PASS      | Sin errores ni advertencias  |
| `pnpm typecheck` | PASS      | `tsc --noEmit` sin errores   |
| `pnpm test:run`  | PASS      | 7 pruebas en verde           |
| `pnpm build`     | PASS      | Build de producción correcto |

#### Decisiones y documentación

Registradas como D-101 a D-110 en [AGENTS.md](./AGENTS.md).

### 2026-11-24 — INIT-002 Identidad, autenticación y seguridad base

- Tipo: `feat`, `security`.
- Dominio: MH-ID (Identidad y cuenta).
- Responsable: Equipo — inicialización.
- Referencia: rama `main` (árbol de trabajo).
- Estado: Integrado en el árbol de trabajo; validado localmente.

#### Objetivo

Habilitar registro, inicio de sesión, gestión de perfil y control de acceso por rol y
estado de cuenta sobre un esquema de autorización en servidor.

#### Cambios realizados

- Integración de better-auth con adaptador de Prisma y plugin `nextCookies`.
- Server actions de registro, inicio de sesión y actualización de perfil, con validación Zod,
  mensajes en español y protección contra redirecciones abiertas.
- Permisos por rol (`USER`, `ADMIN`, `SUPER_ADMIN`) y utilidades de autorización por pertenencia.
- Sesión de servidor (`getSession`, `requireSession`, `requireRole`) y `proxy.ts` para el filtrado de rutas.
- Páginas de autenticación y estados (`/iniciar-sesion`, `/registrarse`, `/cuenta-suspendida`, `/sin-acceso`).

#### Impacto técnico y funcional

El acceso a paneles y a operaciones privadas queda restringido y validado en el servidor.
La autenticación no depende del sistema anterior.

#### Validación

| Verificación     | Resultado | Evidencia                        |
| ---------------- | --------- | -------------------------------- |
| `pnpm typecheck` | PASS      | Sin errores                      |
| `pnpm test:run`  | PASS      | Pruebas de permisos en verde     |
| `pnpm build`     | PASS      | Rutas de autenticación generadas |

#### Decisiones y documentación

Autorización por rol + estado + pertenencia, siempre en servidor. Ver AGENTS.md §7.

### 2026-11-24 — INIT-003 Propiedades y catálogo público

- Tipo: `feat`.
- Dominio: MH-PROP (Inmuebles y publicaciones) y MH-CAT (Catálogo).
- Responsable: Equipo — inicialización.
- Referencia: rama `main` (árbol de trabajo).
- Estado: Integrado en el árbol de trabajo; validado localmente.

#### Objetivo

Permitir la publicación y administración de inmuebles y su consulta pública con filtros.

#### Cambios realizados

- Esquema de propiedades con estados de moderación y disponibilidad independientes.
- Servicio de consultas: búsqueda con filtros (texto, tipo, precio, habitaciones, barrio),
  destacados, detalle y listado por propietario; la dirección exacta se oculta a terceros.
- Server actions de creación, edición, cambio de disponibilidad y archivado, con auditoría.
- Catálogo público (`/propiedades`), portada (`/`) y ficha del inmueble (`/propiedades/[id]`).
- Formulario reutilizable de publicación (creación y edición) y tarjeta de inmueble.

#### Impacto técnico y funcional

El flujo de publicación nace en estado `PENDING_REVIEW` y solo se expone al público cuando
está aprobado y disponible. La edición devuelve la publicación a revisión.

#### Validación

| Verificación     | Resultado | Evidencia                                            |
| ---------------- | --------- | ---------------------------------------------------- |
| `pnpm typecheck` | PASS      | Sin errores                                          |
| `pnpm build`     | PASS      | Rutas `/propiedades` y `/propiedades/[id]` generadas |

#### Decisiones y documentación

D-107 y D-108 en AGENTS.md.

### 2026-11-24 — INIT-004 Mensajería, visitas, favoritos y notificaciones

- Tipo: `feat`.
- Dominio: MH-CHAT, MH-VISIT, MH-FAV, MH-NOT.
- Responsable: Equipo — inicialización.
- Referencia: rama `main` (árbol de trabajo).
- Estado: Integrado en el árbol de trabajo; validado localmente.

#### Objetivo

Habilitar la interacción entre interesados y anunciantes con privacidad y trazabilidad.

#### Cambios realizados

- Mensajería interna: conversaciones por publicación, acceso exclusivo a participantes,
  envío de mensajes, marcado de lectura y notificación al destinatario.
- Visitas: solicitud, aceptación, rechazo, cancelación y marcado como realizada.
- Favoritos: alta y baja idempotente, y consulta de inmuebles guardados.
- Notificaciones por usuario y contador de no leídas.
- Registro auditable de operaciones sensibles.

#### Impacto técnico y funcional

Las conversaciones y visitas quedan aisladas por pertenencia; se evita el contacto con
usuarios bloqueados. Las notificaciones enlazan a la acción correspondiente.

#### Validación

| Verificación     | Resultado | Evidencia                               |
| ---------------- | --------- | --------------------------------------- |
| `pnpm typecheck` | PASS      | Sin errores                             |
| `pnpm build`     | PASS      | Rutas de mensajería y visitas generadas |

#### Decisiones y documentación

Ver AGENTS.md §4 y §7.

### 2026-11-24 — INIT-005 Paneles de usuario

- Tipo: `feat`.
- Dominio: MH-DASH (Paneles), MH-PROP, MH-FAV, MH-VISIT, MH-CHAT.
- Responsable: Equipo — inicialización.
- Referencia: rama `main` (árbol de trabajo).
- Estado: Integrado en el árbol de trabajo; validado localmente.

#### Objetivo

Ofrecer a propietarios e interesados un espacio unificado para gestionar publicaciones,
conversaciones, visitas, favoritos y su perfil.

#### Cambios realizados

- Shell del panel con navegación por secciones y acceso por sesión (`/panel`).
- Resumen con métricas operativas básicas y notificaciones recientes.
- Gestión de inmuebles del propietario: listado con estado, alta, edición, pausa/activación y archivado.
- Mensajería del panel: lista de conversaciones e hilo con envío de mensajes.
- Visitas con acciones de respuesta, favoritos y edición de perfil.

#### Impacto técnico y funcional

El panel concentra los flujos operativos ya implementados. Refuerza el acceso por sesión
en todo el árbol `/panel`.

#### Validación

| Verificación     | Resultado | Evidencia                             |
| ---------------- | --------- | ------------------------------------- |
| `pnpm lint`      | PASS      | Sin errores ni advertencias           |
| `pnpm typecheck` | PASS      | Sin errores                           |
| `pnpm build`     | PASS      | Rutas `/panel` y `/panel/*` generadas |

#### Decisiones y documentación

Ver AGENTS.md §4.

### 2026-11-24 — INIT-006 Calidad, integración continua y documentación

- Tipo: `chore`.
- Dominio: Ingeniería y gestión del desarrollo.
- Responsable: Equipo — inicialización.
- Referencia: rama `main` (árbol de trabajo).
- Estado: Integrado en el árbol de trabajo; validado localmente.

#### Objetivo

Dejar la base lista para el trabajo colaborativo del equipo, con validaciones automáticas
y convenciones documentadas.

#### Cambios realizados

- Configuración de Vitest (`vitest.config.mts`) y pruebas iniciales de permisos y formato.
- Prettier con plugin de Tailwind.
- Flujo de CI en GitHub Actions (`.github/workflows/ci.yml`): lint, tipos, pruebas y build.
- Plantilla de Pull Request y plantillas de issue (historia de usuario y defecto).
- `.env.example` y excepción en `.gitignore` para versionarlo sin exponer secretos.

#### Impacto técnico y funcional

Cada Pull Request se valida automáticamente antes de integrarse. Queda documentado el
flujo de ramas, revisión y Definition of Done.

#### Validación

| Verificación     | Resultado | Evidencia                   |
| ---------------- | --------- | --------------------------- |
| `pnpm lint`      | PASS      | Sin errores ni advertencias |
| `pnpm typecheck` | PASS      | Sin errores                 |
| `pnpm test:run`  | PASS      | 2 archivos, 7 pruebas       |
| `pnpm build`     | PASS      | 18 rutas + Proxy            |

#### Decisiones y documentación

`docs/AGENTS.md` creado como contexto vigente del nuevo repositorio.

## 5. Pendientes conocidos (sin registrar como terminados)

- Panel de administración y moderación, reportes y bloqueos.
- Rate limiting, cabeceras de seguridad y antiabuso.
- Analítica operativa, monetización y arrendamientos/contratos.
- PWA, optimizaciones de SEO/rendimiento y E2E automatizados.
- Decisión sobre el repositorio en GitHub del nuevo sistema y su primer commit/PR.
