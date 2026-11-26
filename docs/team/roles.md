# Roles y distribución del trabajo

> **Estado** — El plan de migración y ejecución vigente organiza el trabajo en ocho
> sprints (16 semanas) e identifica las áreas como **D1–D5**. Este documento formaliza el
> alcance por área; hoy solo **D3 (frontend público)** tiene titular asignado. Los nombres
> de GitHub se incorporarán en `.github/CODEOWNERS` una vez definidos todos.

## 1. Reparto de áreas

| Área | Responsabilidad principal                 | Ámbito                                                                                                         |
| ---- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| D1   | Líder técnico: backend NestJS y seguridad | `apps/api` (módulos, guards, DTO), better-auth, autorización por rol/estado/pertenencia, cabeceras y antiabuso |
| D2   | Datos y dominio de propiedades            | `packages/database` (Prisma, migraciones), `packages/contracts`, dominio de propiedades y mensajería           |
| D3   | Frontend público y experiencia (UX/UI)    | `apps/web/src/app/(público)`, catálogo, búsqueda, filtros, ficha, accesibilidad y SEO                          |
| D4   | Paneles, formularios e interacción        | `apps/web/src/app/panel`, formularios, mensajería en UI, visitas, favoritos y notificaciones                   |
| D5   | Por definir con el plan de migración      | Pendiente de confirmar                                                                                         |

Nadie es propietario exclusivo de una carpeta: la organización se basa en
**dominios y entregables** con contratos de API acordados en `@mh/contracts`.

## 2. Rol D3 — Frontend Público

**Titular: Erick Manuel Moreno Palacios.** Next.js 16 · React · TypeScript · Tailwind CSS.

Responsable de reconstruir y mejorar la experiencia pública del marketplace: desde la
página principal hasta el descubrimiento, la consulta y el contacto relacionados con los
inmuebles. El objetivo es una interfaz profesional, rápida, accesible, responsiva y
optimizada para buscadores.

### 2.1 Alcance

- Página principal: buscador destacado, propuesta de valor, inmuebles recientes, categorías
  de vivienda y llamadas a la acción para publicar o explorar.
- Catálogo y búsqueda: filtros por presupuesto, barrio, tipo de inmueble, habitaciones y
  características; ordenamiento, paginación y estados vacíos.
- Detalle de propiedad: galería multimedia, precio, características, descripción, ubicación
  aproximada, disponibilidad, favoritos y contacto interno.
- Galerías de imágenes y contenido multimedia.
- Interfaces públicas de registro, inicio de sesión y recuperación de acceso, con sus
  estados de error, carga y confirmación.
- Acciones públicas de favoritos, contacto y solicitud de visitas.
- Interfaces de reporte y avisos de seguridad y privacidad.
- Navegación, layouts, componentes compartidos, footer y páginas informativas.
- Estados de carga, error, vacío y confirmación; responsividad y accesibilidad.
- SEO técnico y optimización móvil.

### 2.2 Límites

- No implementa lógica de negocio de NestJS, persistencia Prisma, autenticación del
  servidor, panel administrativo, dashboard privado del propietario, chat completo ni
  generación de contratos o plantillas PDF.
- Implementa las interfaces de registro, inicio de sesión y recuperación de acceso; la
  emisión de sesiones, los guards y la autorización corresponden a D1.
- Consume los contratos y endpoints del backend mediante un cliente API tipado, sin
  duplicar reglas de negocio. Usa datos de prueba tipados o mocks mientras un endpoint no
  esté disponible.
- Los contratos de API (propiedades, filtros, galerías, autenticación y contacto) se
  acuerdan con el backend desde S0 para no rehacer las interfaces.
- Las tareas de arrendamientos y plantillas PDF que el plan situaba en S5 (MH-050, MH-051)
  quedan fuera de esta área por ser alcance privado.

### 2.3 Entregables por sprint

| Sprint | Entregable                                                                                        |
| ------ | ------------------------------------------------------------------------------------------------- |
| S0     | Diseño del nuevo frontend público, arquitectura de componentes, sistema visual y navegación móvil |
| S1     | Layout público, header, footer y pantallas de autenticación                                       |
| S2     | Inicio, catálogo, filtros, detalle y galerías integrados con la API                               |
| S3     | Favoritos, CTA de contacto, solicitudes de visita y avisos de seguridad en las pantallas públicas |
| S4     | Interfaces de reporte y bloqueo, estados de moderación y confianza                                |
| S5     | Optimización de búsqueda, multimedia, responsividad, Core Web Vitals y experiencia móvil          |
| S6     | Pruebas E2E públicas, accesibilidad, SEO técnico y corrección de defectos                         |
| S7     | Validación del sitio público, pruebas finales y documentación de la experiencia pública           |

### 2.4 Estado

No iniciado. El diseño del nuevo frontend público se elabora primero en **Figma** y se
entrega antes de implementar. El frontend PHP anterior es únicamente referencia funcional:
no se reproduce su arquitectura ni su diseño.

## 3. Propiedad por ruta (orientativa)

| Ruta                                                   | Responsable principal | Revisores sugeridos |
| ------------------------------------------------------ | --------------------- | ------------------- |
| `apps/api/**`                                          | D1                    | D2                  |
| `packages/database/**`, `packages/contracts/**`        | D2                    | D1                  |
| `apps/web/src/app/(catálogo y público)/**`             | D3                    | D4                  |
| `apps/web/src/app/panel/**`, `apps/web/src/modules/**` | D4                    | D3                  |
| `docs/**`, `AGENTS.md`, `BITACORA.md`                  | Equipo                | D1                  |

## 4. Pares de revisión (revisión cruzada)

- **D1 ↔ D4**: identidad, seguridad y comunicación.
- **D2 ↔ D3**: datos, propiedades, catálogo y experiencia.

Cada Pull Request requiere **al menos una aprobación** de otro desarrollador y CI en verde.

## 5. Primeras tareas sugeridas por área

**D1**

1. Definir la estructura de módulos NestJS por dominio y la estrategia de guards.
2. Configurar el servicio de despliegue de `apps/api` y sus variables.
3. Endurecer `apps/web`: cabeceras de seguridad y política de CORS/CSRF.
4. Acordar con D3 los contratos de API de propiedades, filtros, galerías, autenticación y
   contacto.

**D2**

1. Revisar el esquema Prisma y versionar la migración inicial.
2. Ampliar `@mh/database` (helpers de transacción, tipos derivados).
3. Definir la estrategia de migración de datos del sistema anterior (si se aprueba).

**D3**

1. Análisis UX, sistema visual y navegación móvil del nuevo frontend público (S0).
2. Auditar accesibilidad (RNF) del catálogo y la ficha de inmueble.
3. Mejorar SEO (metadatos, Open Graph, `sitemap`).
4. Revisar el flujo de búsqueda y filtros en móvil.

**D4**

1. Completar paneles pendientes (administración, moderación, reportes).
2. Formalizar mensajería en la UI y estados de error/carga.
3. Cubrir formularios con pruebas unitarias (Preparar / Ejecutar / Verificar).

## 6. Flujo de trabajo

- **Una rama por área**: el trabajo de cada área (D1–D5) vive en su propia rama
  (`frontend-publico` para D3). Dentro de ella se usan ramas cortas por issue y se
  integran a la rama del área antes de pasar a `main`.
- Convención de nombre de las ramas cortas: `feat/mh-123-descripcion`, `fix/...`,
  `refactor/...`, `chore/...`, `docs/...`, `test/...`.
- Commits y descripciones de PR en español, referenciando el issue.
- Antes de abrir el PR: `pnpm lint`, `pnpm typecheck`, `pnpm test:run` y
  `pnpm build` en verde.
- Prohibido subir secretos, credenciales o datos personales.

## 7. Definition of Done

- [ ] Criterios de aceptación satisfechos.
- [ ] Validación de entradas, permisos y privacidad.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test:run` y `pnpm build` en verde.
- [ ] Migraciones versionadas y revisadas cuando aplique.
- [ ] Sin secretos ni datos personales.
- [ ] PR revisado y aprobado por otro desarrollador.
- [ ] `docs/` y `BITACORA.md` actualizados cuando corresponda.

## 8. Decisiones pendientes del equipo

- Asignar responsables nominales de las áreas D1, D2, D4 y D5 (para `CODEOWNERS`).
- Confirmar el panel de administración dentro del primer alcance.
- Decidir la estrategia de tiempo real para mensajería (ver
  [arquitectura](../architecture/README.md)).
