# 🚀 NestJS Backend Template - Production Ready

> Un template completo y listo para producción de NestJS con todos los componentes esenciales, mejores prácticas e infraestructura común lista para usar.

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Inicio Rápido](#-inicio-rápido)
- [Documentación](#-documentación)
- [Estructura del Proyecto](#-estructura-del-proyecto)

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

### 🧪 Testing
- ✅ 248 tests unitarios pasando
- ✅ Cobertura alta en módulos críticos
- ✅ Tests para servicios, controladores y utilidades

---

## 🚀 Inicio Rápido

### Instalación Rápida

```bash
# 1. Clonar e instalar
git clone <repository>
cd nest-proptech-backend
npm install

# 2. Configurar variables de entorno
cp .env.example .env

# 3. Iniciar servicios Docker
docker-compose up -d

# 4. Ejecutar aplicación
npm run start:dev
```

### Accesos

| Servicio | URL |
|----------|-----|
| **API** | http://localhost:3000/api |
| **Documentación** | http://localhost:3000/api-docs |
| **Health Check** | http://localhost:3000/api/health |

### Credenciales por Defecto

```
Email:    admin@admin.com
Password: admin
Role:     SUPER_ADMIN
```

> ⚠️ **IMPORTANTE**: Cambia estas credenciales en producción.

Para más detalles, consulta la [Guía de Inicio Rápido](./docs/GETTING_STARTED.md).

---

## 📚 Documentación

La documentación completa está organizada en los siguientes archivos:

### 📖 Guías Principales

- **[🚀 Inicio Rápido](./docs/GETTING_STARTED.md)** - Instalación, configuración y primeros pasos
- **[📚 API](./docs/API.md)** - Documentación completa de endpoints y flujos
- **[🧪 Testing](./docs/TESTING.md)** - Guía de testing y cobertura de código
- **[📧 Sistema de Email](./docs/EMAIL.md)** - Configuración y uso del sistema de emails
- **[🧰 Utilidades](./docs/UTILITIES.md)** - Utilidades disponibles en el proyecto

### 🛠️ Desarrollo

- **[🏗️ Guía de Desarrollo](./docs/DEVELOPMENT.md)** - Crear módulos, usar caché, excepciones
- **[🚀 Despliegue](./docs/DEPLOYMENT.md)** - Checklist y guía de despliegue en producción
- **[🔍 Solución de Problemas](./docs/TROUBLESHOOTING.md)** - Troubleshooting común

---

## 📁 Estructura del Proyecto

```
src/
├── auth/               # Módulo de autenticación
├── users/              # Módulo de gestión de usuarios
├── common/             # Componentes compartidos
├── database/           # Configuración de base de datos
├── email/              # Módulo de email
├── health/             # Módulo de health check
├── logger/             # Sistema de logging
├── redis/              # Módulo Redis
├── queue/              # Configuración de colas (BullMQ)
└── utils/              # Funciones de utilidad
```

Para más detalles sobre la estructura, consulta [Guía de Desarrollo](./docs/DEVELOPMENT.md).

---

## 🧪 Testing

El proyecto incluye **248 tests** cubriendo servicios, controladores y utilidades.

```bash
# Ejecutar todos los tests
npm test

# Tests con cobertura
npm run test:cov
```

Ver [TESTING.md](./docs/TESTING.md) para más información.

---

## 📊 Estadísticas del Proyecto

- **Total de tests**: 248 tests ✅
- **Cobertura**: Alta en módulos críticos
- **Módulos testeados**: 17 módulos
- **Documentación**: Completa y organizada

---

## 🛠️ Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run start:dev` | Iniciar con hot reload |
| `npm run build` | Compilar para producción |
| `npm test` | Ejecutar tests |
| `npm run test:cov` | Tests con cobertura |
| `npm run lint` | Linter de código |
| `npm run format` | Formatear código |
| `npm run migration:run` | Ejecutar migraciones |

Para más comandos, consulta [GETTING_STARTED.md](./docs/GETTING_STARTED.md).

---

## 📄 Licencia

UNLICENSED - Proyecto privado

---

## 💬 Soporte

Para problemas o preguntas, por favor crea un issue en el repositorio.

---

## 🔗 Enlaces Rápidos

- [Inicio Rápido](./docs/GETTING_STARTED.md)
- [Documentación de API](./docs/API.md)
- [Guía de Testing](./docs/TESTING.md)
- [Sistema de Email](./docs/EMAIL.md)
- [Guía de Desarrollo](./docs/DEVELOPMENT.md)
- [Despliegue](./docs/DEPLOYMENT.md)
- [Solución de Problemas](./docs/TROUBLESHOOTING.md)
