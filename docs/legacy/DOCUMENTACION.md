# MI HOGAR EN LÍNEA — Documentación Técnica

**Versión:** 2.0  
**Última actualización:** Mayo 2026

---

## 1. Descripción general

**MI HOGAR EN LÍNEA** es una plataforma web para publicar, buscar y gestionar propiedades en arriendo. Conecta arrendadores (propietarios) con arrendatarios (interesados), ofrece búsqueda con filtros, galería multimedia (imágenes y videos), mensajería interna, formalización de arrendamientos y generación/descarga de contratos.

### Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend público | PHP + HTML/CSS/JavaScript |
| Panel de administración | PHP + JavaScript (fetch API) |
| Backend / APIs | PHP 8.x (endpoints REST JSON) |
| Base de datos | MySQL / MariaDB |
| Servidor local | XAMPP (Apache + PHP + MySQL) |
| Generación de contratos | FPDF (`lib/fpdf.php`) |

### Roles de usuario

| Rol | Descripción |
|-----|-------------|
| `user` | Propietario o arrendatario: publica propiedades, chatea, gestiona arrendamientos |
| `super_admin` | Acceso al panel global: usuarios, propiedades, arrendamientos, contratos y asignación de roles |

---

## 2. Arquitectura

La aplicación sigue un patrón **híbrido**:

- **Capa de presentación (monolito PHP):** páginas en la raíz (`index.php`, `property.php`, `property-details.php`, etc.) y el panel en `/admin/`.
- **Capa de servicios (microservicios):** cada módulo de negocio expone un endpoint independiente en `/api/`, consumido por el frontend mediante `fetch()` con JSON.

Todos los microservicios comparten la misma base de datos MySQL y el mecanismo de sesión PHP (`$_SESSION`) para autenticación.

```
┌─────────────────────────────────────────────────────────────┐
│  Cliente (navegador)                                        │
│  • Sitio público (PHP renderizado)                          │
│  • Panel admin (PHP + JS)                                   │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP / JSON
┌──────────────────────────▼──────────────────────────────────┐
│  Microservicios REST (/api/*.php)                           │
│  auth │ properties │ images │ upload │ videos │ messages    │
│  user │ chat │ leases │ contracts │ admin │ users_lookup    │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  MySQL (mi_hogar_en_linea) + almacenamiento de archivos     │
│  uploads/properties/ │ uploads/contracts/                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Microservicios (API)

Cada archivo en `api/` actúa como un **microservicio** con dominio acotado:

| Microservicio | Archivo | Responsabilidad |
|---------------|---------|-----------------|
| **Autenticación** | `api/auth.php` | Login, registro, verificación de sesión, logout, control de pestaña única en dashboard |
| **Propiedades** | `api/properties.php` | CRUD de propiedades, listado con filtros, detalle con imágenes/videos |
| **Imágenes** | `api/images.php` | Eliminar imagen, establecer imagen principal |
| **Carga de archivos** | `api/upload.php` | Subida de imágenes y videos al publicar/editar |
| **Videos** | `api/videos.php` | Eliminar video, marcar video principal |
| **Perfil de usuario** | `api/user.php` | Consultar y actualizar datos del usuario autenticado |
| **Mensajes de contacto** | `api/messages.php` | Mensajes clásicos por propiedad (formulario/dashboard) |
| **Chat** | `api/chat.php` | Conversaciones, mensajes en tiempo casi real (long polling), archivar |
| **Arrendamientos** | `api/leases.php` | Crear, listar y finalizar/cancelar arrendamientos |
| **Contratos** | `api/contracts.php` | Estado, generación PDF/DOC, descarga, subida de contrato firmado |
| **Búsqueda de usuarios** | `api/users_lookup.php` | Buscar usuario por email (iniciar chat como arrendador) |
| **Administración** | `api/admin.php` | Listados globales y asignación de roles (solo `super_admin`) |

### Convenciones comunes

- Respuestas en JSON: `{ "success": true|false, ... }`
- Autenticación por sesión PHP (`credentials: 'include'` en fetch)
- CORS habilitado en la mayoría de endpoints
- Códigos HTTP: 200, 201, 400, 401, 403, 404, 500

---

## 4. Estructura del proyecto

```
mi-hogar-en-linea/
├── index.php              # Inicio, destacados, buscador
├── property.php           # Listado y filtros
├── property-details.php   # Detalle, WhatsApp, chat, videos
├── login.php / registro.php / logout.php
├── contactanos.php / sobre-nosotros.php
├── admin/                 # Panel de usuario
│   ├── dashboard.php
│   ├── publicar-propiedad.php
│   ├── mis-propiedades.php
│   ├── chat.php
│   ├── arrendamientos.php
│   ├── super-admin.php
│   ├── configuracion.php
│   └── js/                # Clientes de los microservicios
├── api/                   # Microservicios REST
├── models/                # Property.php, User.php
├── config/database.php
├── db/mi_hogar_en_linea.sql
├── lib/fpdf.php
├── uploads/
│   ├── properties/{id}/   # Imágenes y videos
│   └── contracts/{id}/    # Contratos generados y firmados
├── HISTORIAS_DE_USUARIO.html
└── DOCUMENTACION.md
```

---

## 5. Base de datos

### Tablas principales

| Tabla | Uso |
|-------|-----|
| `usuarios` | Cuentas, roles (`user`, `super_admin`) |
| `propiedades` | Inmuebles (tipo, precio, ubicación, estado, visualizaciones) |
| `imagenes_propiedad` | Galería de fotos |
| `videos_propiedad` | Videos (creada dinámicamente si no existe) |
| `mensajes` | Mensajes de contacto por propiedad |
| `conversaciones` | Hilos de chat entre arrendador y arrendatario |
| `chat_mensajes` | Mensajes del chat interno |
| `arrendamientos` | Contratos de arriendo formalizados |
| `contratos` | Archivos generados/firmados y estados |

### Estados relevantes

- **Propiedad:** `disponible`, `arrendada`, `inactiva`
- **Conversación:** `activa`, `cerrada`
- **Arrendamiento:** `activo`, `finalizado`, `cancelado`
- **Contrato:** `borrador`, `generado`, `firmado`

---

## 6. Módulos funcionales

### 6.1 Sitio público

- Página de inicio con propiedades destacadas y buscador (ciudad, tipo, rango de precio).
- Catálogo con filtros avanzados (habitaciones, precio, tipo).
- Detalle con galería, videos, contador de visualizaciones, contacto WhatsApp e inicio de chat (usuarios logueados).

### 6.2 Panel de administración

| Módulo | Ruta | Microservicios usados |
|--------|------|------------------------|
| Dashboard | `admin/dashboard.php` | auth, properties, messages, user |
| Publicar / editar | `admin/publicar-propiedad.php` | auth, properties, upload, images, videos |
| Mis propiedades | `admin/mis-propiedades.php` | auth, properties |
| Chat | `admin/chat.php` | chat, users_lookup, leases, properties |
| Arrendamientos | `admin/arrendamientos.php` | leases, contracts |
| Super Admin | `admin/super-admin.php` | admin |
| Configuración | `admin/configuracion.php` | auth, user |

### 6.3 Flujo arrendamiento + contrato

1. Arrendador y arrendatario conversan en **Chat** (`api/chat.php`).
2. El arrendador crea el **arrendamiento** desde el chat (`api/leases.php` POST).
3. La propiedad pasa a estado `arrendada`.
4. Se crea registro en `contratos` (borrador).
5. Cualquier parte vinculada puede **generar** el documento (`api/contracts.php` → PDF/DOC).
6. Se puede **subir** el contrato firmado y **descargarlo** después.

---

## 7. Instalación y despliegue

### Requisitos

- XAMPP (o Apache + PHP 8.2+ + MySQL/MariaDB)
- Extensiones PHP: PDO, JSON, GD (recomendado para imágenes)

### Pasos

1. Clonar o copiar el proyecto en `htdocs/mi-hogar-en-linea`.
2. Importar `db/mi_hogar_en_linea.sql` en phpMyAdmin (base `mi_hogar_en_linea`).
3. Configurar credenciales en `config/database.php` si difieren del entorno local.
4. Asegurar permisos de escritura en `uploads/`.
5. Acceder a `http://localhost/mi-hogar-en-linea/`.

### Crear super administrador

Asignar manualmente en la base de datos:

```sql
UPDATE usuarios SET rol = 'super_admin' WHERE email = 'tu@email.com';
```

---

## 8. Referencia rápida de APIs

### auth.php
- `POST` — login (`email`, `password`) o registro
- `GET` — verificar sesión
- `POST` — logout

### properties.php
- `GET` — listar / `?id=` detalle
- `POST` — crear
- `PUT` — actualizar
- `DELETE` — eliminar

### chat.php
- `GET ?action=list` — conversaciones
- `GET ?action=messages&conversation_id=` — mensajes (soporta `since_id`, `timeout` para polling)
- `POST` — `start`, `start_from_property`, `send`, `archive`, `unarchive`

### leases.php
- `GET ?scope=mine&status=active|archived` — mis arrendamientos
- `POST` — crear desde `conversation_id`, canon, fechas
- `POST` — `action: archive|disable`

### contracts.php
- `GET ?action=status&lease_id=` — estado del contrato
- `GET ?action=download_generated|download_signed`
- `POST` — `action: generate`
- `POST` (multipart) — `action: upload_signed`

### admin.php (solo super_admin)
- `GET ?action=users|properties|leases|contracts`
- `POST` — `action: set_role`

---

## 9. Seguridad

- Contraseñas con `password_hash()` / `password_verify()`.
- Regeneración de ID de sesión tras login.
- Validación de propiedad del recurso (solo el dueño edita su propiedad; solo participantes del chat/arrendamiento acceden).
- Rol `super_admin` verificado en servidor para `api/admin.php`.
- Cookies de sesión con `httponly` y `samesite`.

---

## 10. Documentos relacionados

| Archivo | Contenido |
|---------|-----------|
| `HISTORIAS_DE_USUARIO.html` | 31 historias de usuario (HU-001 a HU-031) |
| `docs/HISTORIAS_DE_USUARIO.pdf` | Historias de usuario en PDF |
| `DOCUMENTACION.md` | Este documento |
| `docs/DOCUMENTACION.pdf` | Documentación técnica en PDF |
| `db/mi_hogar_en_linea.sql` | Esquema y datos de ejemplo |

### Generar o actualizar los PDF

```bash
php scripts/generar-pdfs.php
```

En Windows también puedes ejecutar `scripts\generar-pdfs.bat`. Requiere PHP (XAMPP) y Google Chrome o Microsoft Edge instalados.

---

## 11. Mejoras futuras sugeridas

- API Gateway o contenedores Docker por microservicio
- Tokens JWT en lugar de sesión PHP compartida
- Notificaciones push o WebSockets para el chat
- Pasarela de pagos para canon de arriendo
- Tests automatizados por servicio
