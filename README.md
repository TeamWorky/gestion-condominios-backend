# 🚀 NestJS Backend Template - Production Ready

> Un template completo y listo para producción de NestJS con todos los componentes esenciales, mejores prácticas e infraestructura común lista para usar.

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Inicio Rápido](#-inicio-rápido)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Scripts Disponibles](#-scripts-disponibles)
- [Variables de Entorno](#-variables-de-entorno)
- [Documentación de la API](#-documentación-de-la-api)
- [Utilidades](#-utilidades)
- [Sistema de Email](#-sistema-de-email)
- [Despliegue en Producción](#-despliegue-en-producción)
- [Solución de Problemas](#-solución-de-problemas)

---

## ✨ Características

### 🔐 Autenticación y Autorización
- ✅ Autenticación JWT (Access + Refresh tokens)
- ✅ Registro e inicio de sesión de usuarios
- ✅ Control de acceso basado en roles (SUPER_ADMIN, ADMIN, USER, GUEST)
- ✅ Hash de contraseñas con bcrypt
- ✅ Mecanismo de refresh de tokens
- ✅ Rutas protegidas con guards

### 🔒 Seguridad
- ✅ Helmet para headers de seguridad
- ✅ Configuración CORS
- ✅ Rate limiting (100 req/min)
- ✅ Validación de entrada con class-validator
- ✅ Protección contra timeout de requests

### ⚡ Rendimiento
- ✅ Compresión de respuestas
- ✅ Caché Redis (implementado automáticamente)
- ✅ Connection pooling de base de datos
- ✅ Consultas optimizadas con TypeORM

### 🛠️ Experiencia de Desarrollo
- ✅ Versionado de API (URI-based)
- ✅ OpenAPI/Swagger con Scalar UI
- ✅ Documentación automática de API
- ✅ Endpoint de health check
- ✅ Trazado de requests con IDs únicos
- ✅ Logging estructurado
- ✅ Hot reload en desarrollo

### 💾 Gestión de Datos
- ✅ PostgreSQL con TypeORM
- ✅ Soporte para migraciones de base de datos
- ✅ Soft delete
- ✅ Claves primarias UUID
- ✅ Timestamps automáticos

### 📦 Infraestructura
- ✅ Configuración Docker Compose
- ✅ Redis para caché
- ✅ Configuración de entorno
- ✅ Manejo de cierre graceful

### 📧 Sistema de Email
- ✅ Envío de emails con Nodemailer
- ✅ Cola de emails asíncrona con BullMQ
- ✅ Plantillas de email predefinidas (Welcome, Password Reset, Email Verification, etc.)
- ✅ Soporte para emails personalizados
- ✅ Reintentos automáticos en caso de fallo
- ✅ Plantillas HTML responsivas

---

## 🚀 Inicio Rápido

### Requisitos Previos

| Requisito | Versión/Descripción |
|-----------|---------------------|
| **Node.js** | 24.11.1 (requerido) |
| **Docker** | Requerido para PostgreSQL y Redis |
| **Docker Compose** | Requerido para servicios |

### Instalación

#### 1️⃣ Clonar e instalar dependencias

```bash
git clone <repository>
cd nest-proptech-backend
npm install
```

#### 2️⃣ Configurar variables de entorno

```bash
cp .env.example .env
# Edita .env si necesitas personalizar la configuración de base de datos o Redis
```

#### 3️⃣ Iniciar servicios Docker ⚠️ IMPORTANTE

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

#### 4️⃣ Ejecutar la aplicación

```bash
npm run start:dev
```

#### 5️⃣ Acceder a la aplicación

| Servicio | URL |
|----------|-----|
| **API** | http://localhost:3000/api |
| **Documentación** | http://localhost:3000/api-docs |
| **Health Check** | http://localhost:3000/api/health |

---

### 👤 Usuario Admin por Defecto

La aplicación crea automáticamente un usuario admin en el primer inicio.

#### Credenciales por Defecto (si no están configuradas):

```
Email:    admin@admin.com
Password: admin
Role:     SUPER_ADMIN
```

#### Personalizar Usuario Admin (Recomendado para Producción):

Agrega estas variables a tu archivo `.env`:

```env
ADMIN_EMAIL=your-admin@company.com
ADMIN_PASSWORD=YourSecurePassword123!
ADMIN_FIRST_NAME=John
ADMIN_LAST_NAME=Doe
```

> ⚠️ **IMPORTANTE**: ¡Usa credenciales personalizadas en producción!

#### Ejemplo de uso:

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

### 🛑 Detener la Aplicación

```bash
# Detener aplicación NestJS: Ctrl+C

# Detener servicios Docker:
docker-compose down

# Detener y eliminar volúmenes (eliminará todos los datos):
docker-compose down -v
```

---

## 📁 Estructura del Proyecto

```
src/
├── auth/               # Módulo de autenticación
│   ├── dto/           # DTOs de autenticación (login, register, refresh)
│   ├── strategies/    # Estrategias Passport (JWT)
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
│
├── users/              # Módulo de gestión de usuarios
│   ├── dto/           # DTOs de usuario
│   ├── entities/      # Entidad de usuario
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
│
├── common/             # Componentes compartidos
│   ├── constants/     # Constantes de la aplicación
│   ├── decorators/    # Decoradores personalizados (@CurrentUser, @Public, @Roles)
│   ├── dto/          # DTOs base
│   ├── entities/     # Entidad base (UUID, timestamps, soft delete)
│   ├── enums/        # Enums comunes (Role, etc.)
│   ├── exceptions/   # Excepciones personalizadas
│   └── interfaces/   # Interfaces comunes
│
├── database/          # Configuración de base de datos
├── filters/           # Filtros de excepciones
├── guards/            # Guards de autenticación (JwtAuthGuard, RolesGuard)
├── health/            # Módulo de health check
├── interceptors/      # Interceptores de respuesta/logging
├── middlewares/       # Middlewares personalizados
├── redis/             # Módulo Redis
├── email/             # Módulo de email
│   ├── dto/          # DTOs de email
│   ├── processors/   # Procesadores de cola
│   ├── templates/    # Servicio de plantillas
│   ├── email.service.ts
│   ├── email-queue.service.ts
│   └── email.module.ts
├── queue/             # Configuración de colas (BullMQ)
└── utils/             # Funciones de utilidad
```

---

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

---

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

---

## 📚 Documentación de la API

La documentación interactiva de la API está disponible en `/api-docs` con Scalar y generación automática de OpenAPI/Swagger.

### 🔗 Endpoints Disponibles

#### 🔓 Autenticación (Público)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/register` | Registrar nuevo usuario |
| `POST` | `/api/v1/auth/login` | Iniciar sesión con email/contraseña |
| `POST` | `/api/v1/auth/logout` | Cerrar sesión (requiere JWT) |
| `POST` | `/api/v1/auth/refresh` | Refrescar access token |

#### 👥 Usuarios (Protegido)

| Método | Endpoint | Descripción | Permisos |
|--------|----------|-------------|----------|
| `GET` | `/api/v1/users` | Obtener todos los usuarios con paginación | Admin only |
| `GET` | `/api/v1/users/:id` | Obtener usuario por ID | - |
| `POST` | `/api/v1/users` | Crear usuario | Admin only |
| `PATCH` | `/api/v1/users/:id` | Actualizar usuario | - |
| `DELETE` | `/api/v1/users/:id` | Soft delete usuario | Admin only |

#### ❤️ Health

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/v1/health` | Health check endpoint |

### 🔄 Flujo de Autenticación

#### 1. Registrar Usuario

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

#### 2. Iniciar Sesión

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

#### 3. Usar Access Token

Agregar al header de Authorization:

```http
Authorization: Bearer {accessToken}
```

#### 4. Refrescar Token

Cuando el access token expire:

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "{refreshToken}"
}
```

### 📦 Formato de Respuesta

Todas las respuestas siguen un formato estándar:

#### ✅ Éxito

```json
{
  "success": true,
  "data": { ... },
  "message": "Mensaje opcional"
}
```

#### ❌ Error

```json
{
  "success": false,
  "message": "Mensaje de error",
  "errors": ["Detalle 1", "Detalle 2"]
}
```

#### 📄 Paginado

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

---

## 🧪 Testing

El proyecto incluye una suite completa de tests unitarios que garantizan la calidad y confiabilidad del código.

### 📊 Estadísticas de Tests

- **Total de tests**: 153 tests pasando ✅
- **Archivos de test**: 9 archivos
- **Cobertura**: Alta cobertura en módulos críticos

### 🎯 Módulos con Tests

#### Módulos Principales
- **AuthService**: 11 tests - Autenticación, registro, login, logout, refresh tokens
- **UsersService**: 24 tests - CRUD completo, soft delete, restore, permisos de roles
- **LogsService**: 15 tests - Filtrado, búsqueda, estadísticas

#### Utilidades
- **CryptoUtil**: 12 tests - Hash, tokens, UUIDs
- **DateUtil**: 15 tests - Manipulación de fechas
- **StringUtil**: 18 tests - Slugify, truncate, validación de emails
- **ResponseUtil**: 9 tests - Formato de respuestas API

#### Validadores y Servicios
- **PasswordStrengthValidator**: 12 tests - Validación de contraseñas
- **RedisCacheService**: 18 tests - Caché, invalidación, TTL

### 🚀 Comandos de Testing

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests con cobertura
npm run test:cov

# Ver reporte HTML de cobertura
npm run test:cov:html

# Ver resumen de cobertura
npm run test:cov:summary
```

### 📈 Cobertura de Código

| Módulo | Statements | Branches | Functions | Lines |
|--------|-----------|----------|-----------|-------|
| AuthService | 100% | 83.33% | 100% | 100% |
| Utils | 100% | 100% | 100% | 100% |
| RedisCacheService | 100% | 86.66% | 100% | 100% |
| UsersService | Alta | Alta | Alta | Alta |
| LogsService | Alta | Alta | Alta | Alta |

### 📝 Información en Scalar

La documentación de Scalar (`/api-docs`) incluye información detallada sobre los tests, incluyendo:
- Estadísticas de cobertura
- Módulos testeados
- Comandos para ejecutar tests
- Métricas de calidad

---

## 🧰 Utilidades

### 📅 Utilidades de Fecha

```typescript
import { DateUtil } from './utils/date.util';

DateUtil.now()                    // Fecha actual
DateUtil.addDays(date, 7)         // Agregar días
DateUtil.isExpired(date)          // Verificar expiración
```

### 🔤 Utilidades de String

```typescript
import { StringUtil } from './utils/string.util';

StringUtil.slugify('Hello World')                    // 'hello-world'
StringUtil.maskEmail('user@example.com')             // 'u***@example.com'
StringUtil.generateRandomString(32)                  // String aleatorio
```

### 🔐 Utilidades de Criptografía

```typescript
import { CryptoUtil } from './utils/crypto.util';

CryptoUtil.generateHash(data)              // Generar hash
CryptoUtil.generateRandomToken()            // Token aleatorio
CryptoUtil.generateUUID()                   // UUID
```

### 📤 Utilidades de Respuesta

```typescript
import { ResponseUtil } from './utils/response.util';

ResponseUtil.success(data)                           // Respuesta exitosa
ResponseUtil.paginated(items, page, limit, total)     // Respuesta paginada
ResponseUtil.error(message)                          // Respuesta de error
```

---

## 🏗️ Crear un Nuevo Módulo

Pasos básicos:

1. ✅ Crear estructura de carpetas del módulo
2. ✅ Crear entidad extendiendo `BaseEntity`
3. ✅ Crear DTOs para validación (Create, Update)
4. ✅ Implementar servicio con caché Redis
5. ✅ Crear controlador con versionado
6. ✅ Registrar módulo en `AppModule`
7. ✅ Generar migración si es necesario

### Estructura de Ejemplo

```
src/your-module/
├── dto/
│   ├── create-your-entity.dto.ts
│   └── update-your-entity.dto.ts
├── entities/
│   └── your-entity.entity.ts
├── your-module.service.ts
├── your-module.controller.ts
└── your-module.module.ts
```

---

## 🔴 Caché Redis

El caché Redis se usa automáticamente en los servicios. Patrón:

```typescript
// Verificar caché
const cached = await this._redis.get(key);
if (cached) return JSON.parse(cached);

// Obtener de base de datos
const data = await this._repository.find();

// Almacenar en caché
await this._redis.setex(key, ttl, JSON.stringify(data));
```

---

## ⚠️ Excepciones Personalizadas

```typescript
import { 
  NotFoundException, 
  AlreadyExistsException 
} from './common/exceptions/business.exception';

throw new NotFoundException('User');
throw new AlreadyExistsException('Email');
```

---

## 📧 Sistema de Email

El módulo de email permite enviar emails de forma síncrona o asíncrona usando colas.

### 🔧 Configuración

Primero, configura las variables SMTP en tu archivo `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_SECURE=false
SMTP_FROM=your-email@gmail.com
SMTP_FROM_NAME=Mi Aplicación
APP_URL=https://myapp.com
```

### 📨 Envío Síncrono

Para enviar emails directamente (síncrono):

```typescript
import { EmailService } from './email/email.service';
import { EmailTemplate } from './email/dto/send-email.dto';

// Inyectar el servicio
constructor(private readonly emailService: EmailService) {}

// Enviar email con plantilla
await this.emailService.sendWelcomeEmail(
  'user@example.com',
  'John Doe',
  'https://app.example.com/login'
);

// Enviar email con plantilla de reset de contraseña
await this.emailService.sendPasswordResetEmail(
  'user@example.com',
  'John Doe',
  'https://app.example.com/reset-password?token=xxx',
  '1 hour'
);

// Enviar email personalizado
await this.emailService.sendEmail({
  to: 'user@example.com',
  subject: 'Mi Asunto',
  template: EmailTemplate.CUSTOM,
  html: '<h1>Contenido HTML</h1>',
  text: 'Contenido texto plano',
});
```

### 📬 Envío Asíncrono (Cola)

Para enviar emails de forma asíncrona usando colas (recomendado):

```typescript
import { EmailQueueService } from './email/email-queue.service';

// Inyectar el servicio
constructor(private readonly emailQueueService: EmailQueueService) {}

// Agregar email a la cola
const jobId = await this.emailQueueService.sendWelcomeEmail(
  'user@example.com',
  'John Doe',
  'https://app.example.com/login'
);

// Verificar estado del trabajo
const status = await this.emailQueueService.getJobStatus(jobId);
console.log(status.state); // 'completed', 'active', 'waiting', etc.
```

### 📋 Plantillas Disponibles

| Plantilla | Descripción | Variables Requeridas |
|-----------|-------------|---------------------|
| `WELCOME` | Email de bienvenida | `name`, `loginUrl` |
| `PASSWORD_RESET` | Reset de contraseña | `name`, `resetUrl`, `expiresIn` |
| `EMAIL_VERIFICATION` | Verificación de email | `name`, `verifyUrl`, `expiresIn` |
| `PASSWORD_CHANGED` | Contraseña cambiada | `name`, `supportUrl` |
| `ACCOUNT_LOCKED` | Cuenta bloqueada | `name`, `unlockUrl`, `supportUrl` |
| `CUSTOM` | Email personalizado | `html` o `text` |

### 💡 Ejemplo Completo

```typescript
import { Injectable } from '@nestjs/common';
import { EmailQueueService } from './email/email-queue.service';

@Injectable()
export class UserService {
  constructor(
    private readonly emailQueueService: EmailQueueService,
  ) {}

  async createUser(userData: CreateUserDto) {
    // ... crear usuario ...

    // Enviar email de bienvenida de forma asíncrona
    await this.emailQueueService.sendWelcomeEmail(
      userData.email,
      `${userData.firstName} ${userData.lastName}`,
      'https://app.example.com/login'
    );

    return user;
  }
}
```

### ⚙️ Características de la Cola

- ✅ **Reintentos automáticos**: Hasta 3 intentos con backoff exponencial
- ✅ **Persistencia**: Los trabajos completados se mantienen por 24 horas
- ✅ **Manejo de errores**: Los trabajos fallidos se mantienen por 7 días
- ✅ **Monitoreo**: Puedes verificar el estado de cada trabajo

---

## 🔍 Solución de Problemas

### ❌ La aplicación no inicia

- ✅ Verificar que los servicios Docker estén corriendo: `docker-compose ps`
- ✅ Verificar si PostgreSQL es accesible: `docker-compose logs postgres`
- ✅ Verificar si Redis es accesible: `docker-compose logs redis`
- ✅ Verificar variables de entorno en `.env`

### ❌ Error de conexión a base de datos

- ✅ Verificar que el contenedor PostgreSQL esté corriendo
- ✅ Verificar que las variables `POSTGRES_*` en `.env` coincidan con docker-compose.yml
- ✅ Intentar reiniciar servicios Docker: `docker-compose restart`

### ❌ Error de conexión a Redis

- ✅ Verificar que el contenedor Redis esté corriendo
- ✅ Verificar que las variables `REDIS_*` en `.env` coincidan con docker-compose.yml
- ✅ Intentar reiniciar servicios Docker: `docker-compose restart`

---

## 🚀 Despliegue en Producción

### Requisitos Previos

- ✅ Node.js 24.11.1
- ✅ Base de datos PostgreSQL (servicio gestionado o self-hosted)
- ✅ Instancia Redis (servicio gestionado o self-hosted)

### ✅ Checklist de Despliegue

- [ ] Establecer `NODE_ENV=production`
- [ ] Cambiar `JWT_SECRET` a un secret fuerte
- [ ] Configurar `CORS_ORIGIN` a dominios específicos
- [ ] Actualizar credenciales de base de datos para producción
- [ ] Ejecutar migraciones: `npm run migration:run`
- [ ] Configurar servicio de logging (ej: Winston)
- [ ] Configurar monitoreo (ej: Prometheus)
- [ ] Habilitar HTTPS
- [ ] Configurar backups de base de datos
- [ ] Configurar persistencia de Redis
- [ ] Revisar y ajustar rate limits

---

## 📄 Licencia

UNLICENSED - Proyecto privado

---

## 💬 Soporte

Para problemas o preguntas, por favor crea un issue en el repositorio.
