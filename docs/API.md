# 📚 Documentación de la API

La documentación interactiva de la API está disponible en `/api-docs` con Scalar y generación automática de OpenAPI/Swagger.

## 🔗 Endpoints Disponibles

### 🔓 Autenticación (Público)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/register` | Registrar nuevo usuario |
| `POST` | `/api/v1/auth/login` | Iniciar sesión con email/contraseña |
| `POST` | `/api/v1/auth/logout` | Cerrar sesión (requiere JWT) |
| `POST` | `/api/v1/auth/refresh` | Refrescar access token |

### 👥 Usuarios (Protegido)

| Método | Endpoint | Descripción | Permisos |
|--------|----------|-------------|----------|
| `GET` | `/api/v1/users` | Obtener todos los usuarios con paginación | Admin only |
| `GET` | `/api/v1/users/:id` | Obtener usuario por ID | - |
| `POST` | `/api/v1/users` | Crear usuario | Admin only |
| `PATCH` | `/api/v1/users/:id` | Actualizar usuario | - |
| `DELETE` | `/api/v1/users/:id` | Soft delete usuario | Admin only |

### ❤️ Health

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/v1/health` | Health check endpoint |

## 🔄 Flujo de Autenticación

### 1. Registrar Usuario

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

### 2. Iniciar Sesión

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

### 3. Usar Access Token

Agregar al header de Authorization:

```http
Authorization: Bearer {accessToken}
```

### 4. Refrescar Token

Cuando el access token expire:

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "{refreshToken}"
}
```

## 📦 Formato de Respuesta

Todas las respuestas siguen un formato estándar:

### ✅ Éxito

```json
{
  "success": true,
  "data": { ... },
  "message": "Mensaje opcional"
}
```

### ❌ Error

```json
{
  "success": false,
  "message": "Mensaje de error",
  "errors": ["Detalle 1", "Detalle 2"]
}
```

### 📄 Paginado

```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

