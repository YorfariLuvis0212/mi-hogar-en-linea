# Roles y distribución del trabajo

> **Estado: propuesta inicial** — pendiente de validar y asignar responsables
> nominales por el equipo. Los nombres de GitHub se incorporarán en
> `.github/CODEOWNERS` una vez definidos.

## 1. Reparto propuesto (cuatro desarrolladores)

| Rol   | Responsabilidad principal              | Ámbito                                                                                                         |
| ----- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Dev 1 | Backend NestJS, identidad y seguridad  | `apps/api` (módulos, guards, DTO), better-auth, autorización por rol/estado/pertenencia, cabeceras y antiabuso |
| Dev 2 | Datos y dominio de propiedades         | `packages/database` (Prisma, migraciones), `packages/contracts`, dominio de propiedades y mensajería           |
| Dev 3 | Frontend público y experiencia (UX/UI) | `apps/web/src/app/(público)`, catálogo, búsqueda, filtros, ficha, accesibilidad y SEO                          |
| Dev 4 | Paneles, formularios e interacción     | `apps/web/src/app/panel`, formularios, mensajería en UI, visitas, favoritos y notificaciones                   |

Nadie es propietario exclusivo de una carpeta: la organización se basa en
**dominios y entregables** con contratos de API acordados en `@mh/contracts`.

## 2. Propiedad por ejemplo (orientativa)

| Ruta                                                   | Responsable principal | Revisores sugeridos |
| ------------------------------------------------------ | --------------------- | ------------------- |
| `apps/api/**`                                          | Dev 1                 | Dev 2               |
| `packages/database/**`, `packages/contracts/**`        | Dev 2                 | Dev 1               |
| `apps/web/src/app/(catálogo y público)/**`             | Dev 3                 | Dev 4               |
| `apps/web/src/app/panel/**`, `apps/web/src/modules/**` | Dev 4                 | Dev 3               |
| `docs/**`, `AGENTS.md`, `BITACORA.md`                  | Equipo                | Dev 1               |

## 3. Pares de revisión (revisión cruzada)

- **Dev 1 ↔ Dev 4**: identidad, seguridad y comunicación.
- **Dev 2 ↔ Dev 3**: datos, propiedades, catálogo y experiencia.

Cada Pull Request requiere **al menos una aprobación** de otro desarrollador y
CI en verde.

## 4. Primeras tareas sugeridas por rol

**Dev 1**

1. Definir la estructura de módulos NestJS por dominio y la estrategia de guards.
2. Configurar el servicio de despliegue de `apps/api` y sus variables.
3. Endurecer `apps/web`: cabeceras de seguridad y política de CORS/CSRF.

**Dev 2**

1. Revisar el esquema Prisma y versionar la migración inicial.
2. Ampliar `@mh/database` (helpers de transacción, tipos derivados).
3. Definir la estrategia de migración de datos del sistema anterior (si se aprueba).

**Dev 3**

1. Auditar accesibilidad (RNF) del catálogo y la ficha de inmueble.
2. Mejorar SEO (metadatos, Open Graph, `sitemap`).
3. Revisar el flujo de búsqueda y filtros en móvil.

**Dev 4**

1. Completar paneles pendientes (administración, moderación, reportes).
2. Formalizar mensajería en la UI y estados de error/carga.
3. Cubrir formularios con pruebas unitarias (Preparar / Ejecutar / Verificar).

## 5. Flujo de trabajo

- Ramas cortas por issue: `feat/mh-123-descripcion`, `fix/...`, `refactor/...`,
  `chore/...`, `docs/...`, `test/...`.
- Commits y descripciones de PR en español, referenciando el issue.
- Antes de abrir el PR: `pnpm lint`, `pnpm typecheck`, `pnpm test:run` y
  `pnpm build` en verde.
- Prohibido subir secretos, credenciales o datos personales.

## 6. Definition of Done

- [ ] Criterios de aceptación satisfechos.
- [ ] Validación de entradas, permisos y privacidad.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test:run` y `pnpm build` en verde.
- [ ] Migraciones versionadas y revisadas cuando aplique.
- [ ] Sin secretos ni datos personales.
- [ ] PR revisado y aprobado por otro desarrollador.
- [ ] `docs/` y `BITACORA.md` actualizados cuando corresponda.

## 7. Decisiones pendientes del equipo

- Asignar responsables nominales y nombres de GitHub (para `CODEOWNERS`).
- Confirmar el panel de administración dentro del primer alcance.
- Decidir la estrategia de tiempo real para mensajería (ver
  [arquitectura](../architecture/README.md)).
