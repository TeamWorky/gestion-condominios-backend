# 🚀 Inicio Rápido

## Requisitos Previos

| Requisito | Versión/Descripción |
|-----------|---------------------|
| **Node.js** | 24.11.1 (requerido) |
| **Docker** | Requerido para PostgreSQL y Redis |
| **Docker Compose** | Requerido para servicios |

## Instalación

### 1️⃣ Clonar e instalar dependencias

```bash
git clone <repository>
cd nest-proptech-backend
npm install
```

### 2️⃣ Configurar variables de entorno

```bash
cp .env.example .env
# Edita .env si necesitas personalizar la configuración de base de datos o Redis
```

### 3️⃣ Iniciar servicios Docker ⚠️ IMPORTANTE

```bash
docker-compose up -d
```

Esto iniciará:
- **PostgreSQL** en el puerto `5432`
- **Redis** en el puerto `6379`

Verificar que los servicios estén corriendo:

```bash
docker-compose ps
```

### 4️⃣ Ejecutar la aplicación

```bash
npm run start:dev
```

### 5️⃣ Acceder a la aplicación

| Servicio | URL |
|----------|-----|
| **API** | http://localhost:3000/api |
| **Documentación** | http://localhost:3000/api-docs |
| **Health Check** | http://localhost:3000/api/health |

## 👤 Usuario Admin por Defecto

La aplicación crea automáticamente un usuario admin en el primer inicio.

### Credenciales por Defecto (si no están configuradas):

```
Email:    admin@admin.com
Password: admin
Role:     SUPER_ADMIN
```

### Personalizar Usuario Admin (Recomendado para Producción):

Agrega estas variables a tu archivo `.env`:

```env
ADMIN_EMAIL=your-admin@company.com
ADMIN_PASSWORD=YourSecurePassword123!
ADMIN_FIRST_NAME=John
ADMIN_LAST_NAME=Doe
```

> ⚠️ **IMPORTANTE**: ¡Usa credenciales personalizadas en producción!

### Ejemplo de uso:

```bash
# 1. Login con credenciales por defecto
POST /api/v1/auth/login
{
  "email": "admin@admin.com",
  "password": "admin"
}

# 2. Actualizar con credenciales seguras
PATCH /api/v1/users/{admin-id}
{
  "email": "your-secure-email@company.com",
  "password": "YourSecurePassword123!"
}
```

## 🛑 Detener la Aplicación

```bash
# Detener aplicación NestJS: Ctrl+C

# Detener servicios Docker:
docker-compose down

# Detener y eliminar volúmenes (eliminará todos los datos):
docker-compose down -v
```

## 🔧 Variables de Entorno

Ver `.env.example` para todas las variables disponibles.

### 🗄️ Base de Datos

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `POSTGRES_HOST` | Host de PostgreSQL | `localhost` |
| `POSTGRES_PORT` | Puerto de PostgreSQL | `5432` |
| `POSTGRES_USER` | Usuario de PostgreSQL | `postgres` |
| `POSTGRES_PASSWORD` | Contraseña de PostgreSQL | `postgres` |
| `POSTGRES_DB` | Nombre de la base de datos | `nest_proptech` |

### 🔴 Redis

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `REDIS_HOST` | Host de Redis | `localhost` |
| `REDIS_PORT` | Puerto de Redis | `6379` |

### 🚀 Aplicación

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `PORT` | Puerto de la aplicación | `3000` |
| `NODE_ENV` | Entorno (development/production) | - |
| `CORS_ORIGIN` | Orígenes permitidos CORS | `*` |

**Ejemplos de `CORS_ORIGIN`:**
- `*` - Todos los orígenes
- `http://localhost:3000,http://localhost:4200` - Múltiples orígenes específicos

### 🔐 Autenticación

| Variable | Descripción | Valor por Defecto | Requerido |
|----------|-------------|-------------------|-----------|
| `JWT_SECRET` | Secret para access token JWT | - | ✅ **Sí** |
| `JWT_REFRESH_SECRET` | Secret para refresh token JWT | - | ✅ **Sí** |
| `JWT_EXPIRES_IN` | Expiración del access token | `15m` | No |

> ⚠️ **IMPORTANTE**: Cambia los secrets JWT en producción.

### 👤 Seeder de Usuario Admin (Opcional)

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `ADMIN_EMAIL` | Email del usuario admin | `admin@admin.com` |
| `ADMIN_PASSWORD` | Contraseña del usuario admin | `admin` |
| `ADMIN_FIRST_NAME` | Nombre del admin | `Admin` |
| `ADMIN_LAST_NAME` | Apellido del admin | `User` |

### 📧 Configuración SMTP (Opcional)

| Variable | Descripción | Valor por Defecto | Requerido |
|----------|-------------|-------------------|-----------|
| `SMTP_HOST` | Host del servidor SMTP | - | ✅ **Sí** (para emails) |
| `SMTP_PORT` | Puerto del servidor SMTP | `587` | No |
| `SMTP_USER` | Usuario SMTP | - | ✅ **Sí** (para emails) |
| `SMTP_PASSWORD` | Contraseña SMTP | - | ✅ **Sí** (para emails) |
| `SMTP_SECURE` | Usar conexión segura (TLS) | `false` | No |
| `SMTP_FROM` | Email remitente | `SMTP_USER` | No |
| `SMTP_FROM_NAME` | Nombre del remitente | `NestJS App` | No |
| `APP_URL` | URL de la aplicación (para links en emails) | `http://localhost:3000` | No |

> ⚠️ **NOTA**: El servicio de email requiere configuración SMTP. Si no está configurado, el servicio mostrará advertencias pero la aplicación seguirá funcionando.

## 🛠️ Scripts Disponibles

### 🐳 Servicios Docker

| Comando | Descripción |
|---------|-------------|
| `docker-compose up -d` | Iniciar PostgreSQL y Redis |
| `docker-compose down` | Detener servicios |
| `docker-compose ps` | Verificar estado de servicios |
| `docker-compose logs` | Ver logs de servicios |

### 💻 Desarrollo

| Comando | Descripción |
|---------|-------------|
| `npm run start:dev` | Iniciar con hot reload (requiere servicios Docker) |
| `npm run start:debug` | Iniciar en modo debug |

### 🚀 Producción

| Comando | Descripción |
|---------|-------------|
| `npm run build` | Compilar para producción |
| `npm run start:prod` | Ejecutar build de producción |

### 🗄️ Migraciones de Base de Datos

| Comando | Descripción |
|---------|-------------|
| `npm run migration:generate -- src/database/migrations/MigrationName` | Generar migración |
| `npm run migration:run` | Ejecutar migraciones |
| `npm run migration:revert` | Revertir última migración |

### ✨ Calidad de Código

| Comando | Descripción |
|---------|-------------|
| `npm run lint` | Linter de código |
| `npm run format` | Formatear código |

