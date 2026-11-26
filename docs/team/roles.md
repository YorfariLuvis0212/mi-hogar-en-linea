# Roles y distribución del trabajo

> **Estado** — El plan de migración y ejecución vigente organiza el trabajo en ocho
> sprints (16 semanas) e identifica las áreas como **D1–D5**. Este documento formaliza el
> alcance por área; hoy solo **D3 (frontend completo)** tiene titular asignado. Los nombres
> de GitHub se incorporarán en `.github/CODEOWNERS` una vez definidos todos.

## 1. Reparto de áreas

| Área | Responsabilidad principal                 | Ámbito                                                                                                         |
| ---- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| D1   | Líder técnico: backend NestJS y seguridad | `apps/api` (módulos, guards, DTO), better-auth, autorización por rol/estado/pertenencia, cabeceras y antiabuso |
| D2   | Datos y dominio de propiedades            | `packages/database` (Prisma, migraciones), `packages/contracts`, dominio de propiedades y mensajería           |
| D3   | Frontend completo y experiencia (UX/UI)   | Todo `apps/web`: público, paneles, formularios, mensajería en UI, accesibilidad y SEO                          |
| D4   | Por confirmar con el plan de migración    | Su frente anterior (paneles) se integró en D3                                                                  |
| D5   | Por confirmar con el plan de migración    | Pendiente                                                                                                      |

Nadie es propietario exclusivo de una carpeta: la organización se basa en
**dominios y entregables** con contratos de API acordados en `@mh/contracts`.

## 2. Rol D3 — Frontend

**Titular: Erick Manuel Moreno Palacios.** Next.js 16 · React · TypeScript · Tailwind CSS.

Responsable de reconstruir y mejorar **toda la interfaz de `apps/web`**: la experiencia
pública del marketplace (descubrimiento, consulta y contacto de inmuebles) y la experiencia
autenticada (paneles, mensajería y administración). El objetivo es una interfaz profesional,
rápida, accesible, responsiva y optimizada para buscadores.

### 2.1 Alcance

**Frontend público**

- Página principal: buscador destacado, propuesta de valor, inmuebles recientes, categorías
  de vivienda y llamadas a la acción para publicar o explorar.
- Catálogo y búsqueda: filtros por presupuesto, barrio, tipo de inmueble, habitaciones y
  características; ordenamiento, paginación y estados vacíos.
- Detalle de propiedad: galería multimedia, precio, características, descripción, ubicación
  aproximada, disponibilidad, favoritos y contacto interno.
- Interfaces públicas de registro, inicio de sesión y recuperación de acceso, con sus
  estados de error, carga y confirmación.
- Acciones públicas de favoritos, contacto y solicitud de visitas.
- Interfaces de reporte y avisos de seguridad y privacidad.
- Navegación, layouts, componentes compartidos, footer y páginas informativas.

**Frontend autenticado**

- Paneles de usuario y de propietario: resumen, inmuebles, favoritos, visitas, mensajes y
  perfil; formularios de publicación y edición.
- Mensajería interna en la interfaz (conversaciones, estados y notificaciones).
- Pantallas de administración y moderación, reportes y bloqueos.
- Pantallas de arrendamientos y contratos (la generación de documentos y PDF corresponde al
  backend).

**Transversal**

- Galerías de imágenes y contenido multimedia.
- Estados de carga, error, vacío y confirmación; responsividad y accesibilidad.
- Sistema visual, SEO técnico y optimización móvil.

### 2.2 Límites

- No implementa lógica de negocio de NestJS, persistencia Prisma ni operaciones de base de
  datos: `apps/api`, `packages/database` (esquema y migraciones) y `packages/contracts`
  corresponden a D1 y D2.
- Implementa las pantallas y formularios de identidad; la emisión de sesiones, los guards y
  la autorización en el servidor corresponden a D1.
- Consume los contratos y endpoints del backend mediante un cliente API tipado, sin
  duplicar reglas de negocio. Usa datos de prueba tipados o mocks mientras un endpoint no
  esté disponible.
- Los contratos de API (propiedades, filtros, galerías, autenticación, contacto,
  mensajería y visitas) se acuerdan con el backend desde S0 para no rehacer las interfaces.
- Las tareas que el plan situaba en S5 sobre plantillas PDF (MH-050, MH-051) quedan fuera:
  la generación de documentos es del backend, no de la interfaz.

### 2.3 Entregables por sprint

Integra los entregables que el plan repartía entre las áreas D3 y D4; confirmar la
numeración de issues con el equipo.

| Sprint | Entregable                                                                                                            |
| ------ | --------------------------------------------------------------------------------------------------------------------- |
| S0     | Diseño en Figma del frontend completo, arquitectura de componentes, sistema visual y navegación móvil                 |
| S1     | Layout, header, footer, navegación y pantallas de autenticación; estructura de los paneles                            |
| S2     | Inicio, catálogo, filtros, detalle y galerías integrados con la API                                                   |
| S3     | Favoritos, CTA de contacto, solicitudes de visita y avisos de seguridad y privacidad                                  |
| S4     | Mensajería en la UI, reportes y bloqueos, estados de moderación y confianza                                           |
| S5     | Paneles (usuario, propietario y administración), formularios y optimización de búsqueda, multimedia y Core Web Vitals |
| S6     | Pruebas E2E de las interfaces, accesibilidad, SEO técnico y corrección de defectos                                    |
| S7     | Validación en producción, pruebas finales y documentación de la experiencia                                           |

### 2.4 Estado

No iniciado. El diseño del frontend completo se elabora primero en **Figma** y se entrega
antes de implementar. El frontend PHP anterior es únicamente referencia funcional: no se
reproduce su arquitectura ni su diseño.

## 3. Propiedad por ruta (orientativa)

| Ruta                                            | Responsable principal | Revisores sugeridos |
| ----------------------------------------------- | --------------------- | ------------------- |
| `apps/api/**`                                   | D1                    | D2                  |
| `packages/database/**`, `packages/contracts/**` | D2                    | D1                  |
| `apps/web/**`                                   | D3                    | D1, D2              |
| `docs/**`, `AGENTS.md`, `BITACORA.md`           | Equipo                | D1                  |

## 4. Pares de revisión (revisión cruzada)

- **D1 ↔ D3**: identidad, seguridad, contratos de API y comunicación.
- **D2 ↔ D3**: datos, propiedades, catálogo y experiencia.

Cada Pull Request requiere **al menos una aprobación** de otro desarrollador y CI en verde.

## 5. Primeras tareas sugeridas por área

**D1**

1. Definir la estructura de módulos NestJS por dominio y la estrategia de guards.
2. Configurar el servicio de despliegue de `apps/api` y sus variables.
3. Endurecer `apps/web`: cabeceras de seguridad y política de CORS/CSRF.
4. Acordar con D3 los contratos de API de propiedades, filtros, galerías, autenticación,
   contacto, mensajería y visitas.

**D2**

1. Revisar el esquema Prisma y versionar la migración inicial.
2. Ampliar `@mh/database` (helpers de transacción, tipos derivados).
3. Definir la estrategia de migración de datos del sistema anterior (si se aprueba).

**D3**

1. Análisis UX, sistema visual y navegación móvil del frontend completo (S0, en Figma).
2. Auditar accesibilidad (RNF) del catálogo, la ficha de inmueble y los paneles.
3. Mejorar SEO (metadatos, Open Graph, `sitemap`).
4. Revisar el flujo de búsqueda y filtros en móvil.
5. Completar los paneles pendientes (administración, moderación y reportes) y formalizar
   la mensajería en la UI.

**D4 y D5**

Pendientes de confirmar con el plan de migración.

## 6. Flujo de trabajo

- **Una rama por área**: el trabajo de cada área (D1–D5) vive en su propia rama
  (`frontend` para D3). Dentro de ella se usan ramas cortas por issue y se integran a la
  rama del área antes de pasar a `main`.
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
- Confirmar el reparto definitivo de las áreas D4 y D5.
- Decidir la estrategia de tiempo real para mensajería (ver
  [arquitectura](../architecture/README.md)).
