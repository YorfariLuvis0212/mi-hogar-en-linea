# Mi Hogar en Línea — Bitácora técnica

## 1. Propósito

Registro cronológico de cambios funcionales, técnicos, arquitectónicos y operativos del proyecto. Complementa el historial de Git, las issues y los Pull Requests.

Documento de contexto vigente: [AGENTS.md](./AGENTS.md).

## 2. Estándar de registro

- Una entrada por Pull Request relevante, decisión arquitectónica, despliegue o incidente.
- Identificación mediante fecha ISO (`AAAA-MM-DD`), responsable y referencia verificable cuando corresponda.
- Registro de cambios, impacto, validaciones y resultados efectivos.
- Conservación del historial en orden cronológico. Las rectificaciones se registran mediante nuevas entradas.
- Las entradas concurrentes se integran preservando el contenido y evitando duplicados.
- Las tareas de seguimiento se administran en GitHub Issues.
- Exclusión de secretos, credenciales, datos personales, conversaciones privadas y registros sensibles.

## 3. Clasificación

| Tipo | Descripción |
|---|---|
| `feat` | Nueva funcionalidad o ampliación funcional. |
| `fix` | Corrección de un defecto. |
| `refactor` | Mejora estructural sin alteración funcional prevista. |
| `perf` | Optimización de rendimiento. |
| `security` | Modificación de controles de seguridad. |
| `test` | Incorporación o modificación de pruebas. |
| `migration` | Cambio de esquema o transformación de datos. |
| `chore` | Configuración, dependencias o mantenimiento. |
| `docs` | Actualización documental. |
| `decision` | Decisión técnica o de producto. |
| `release` | Despliegue o publicación de una versión. |
| `incident` | Incidente operativo, análisis y recuperación. |

Los estados de registro distinguen decisiones aprobadas, implementaciones en rama, cambios integrados, despliegues y reversiones. Una decisión aprobada no constituye evidencia de implementación. Las validaciones se registran como `PASS`, `FAIL`, `NO EJECUTADO` o `NO APLICA`, según corresponda.

## 4. Formato de registro

```markdown
### AAAA-MM-DD — Título del cambio

- Tipo:
- Dominio:
- Responsable:
- Referencia (issue / PR / commit):
- Estado:

#### Objetivo

#### Cambios realizados

#### Impacto técnico y funcional

#### Validación

| Verificación | Resultado | Evidencia |
|---|---|---|
| | | |

#### Decisiones y documentación
```

Las entradas incorporan información adicional de migraciones, compatibilidad, recuperación, despliegues o incidentes cuando corresponda. Los campos se limitan a la información pertinente al cambio.

## 5. Historial

### 2026-11-23 — BASE-001 Definición del producto y restricciones técnicas

- Tipo: `decision`.
- Dominio: Producto, arquitectura y seguridad.
- Estado: Decisiones de producto registradas.

#### Decisiones

| ID | Definición |
|---|---|
| D-001 | Quibdó como mercado inicial y publicación directa por los propietarios. |
| D-002 | Mensajería interna como canal central de comunicación. |
| D-003 | Exclusión de publicidad de terceros. |
| D-004 | Neon PostgreSQL integrado mediante Vercel Marketplace y Vercel como plataforma objetivo de despliegue. |
| D-005 | Exclusión de Cloudinary. |
| D-006 | Reutilización de recursos, control de costos y gestión de deuda técnica. |

#### Impacto

Establecimiento de los criterios de diseño, seguridad y selección tecnológica del producto. Registro de alcance documental, sin modificación de código, datos o infraestructura.

### 2026-11-23 — BASE-002 Establecimiento de documentación técnica

- Tipo: `docs`.
- Dominio: Ingeniería y gestión del desarrollo.
- Estado: Documentación elaborada.

#### Cambios realizados

- Creación de `AGENTS.md` como contexto central del producto y sus normas de ingeniería.
- Creación de `BITACORA.md` como registro cronológico de cambios.
- Definición de una estructura de responsabilidades para cuatro desarrolladores.
- Establecimiento de criterios de revisión de código, control de versiones, seguridad y calidad.

#### Impacto

Documentación de referencia para la coordinación del equipo y la evolución del proyecto. No constituye una certificación del estado operativo del software.

#### Referencia

Proyecto Mi Hogar en Línea, Dinámica de Sistemas, Fundación Universitaria Claretiana, 2026.
