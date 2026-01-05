# 📋 Specify - Sistema de Especificación y Planificación de Features

**Specify** es un framework estructurado para especificar, planificar e implementar nuevas funcionalidades en el proyecto. Proporciona un flujo de trabajo completo desde la descripción inicial hasta la implementación.

---

## 🎯 ¿Qué es Specify?

Specify es un sistema que ayuda a:

1. **Especificar features** de forma estructurada y clara
2. **Planificar la implementación** con diseño técnico detallado
3. **Crear tareas** desglosadas y ordenadas
4. **Generar checklists** para validación y seguimiento
5. **Mantener documentación** consistente y actualizada

---

## 🏗️ Estructura del Sistema

```
.specify/
├── memory/
│   └── constitution.md          # Principios y reglas del proyecto
├── scripts/
│   └── bash/                    # Scripts de automatización
│       ├── check-prerequisites.sh
│       ├── common.sh
│       ├── create-new-feature.sh
│       ├── setup-plan.sh
│       └── update-agent-context.sh
└── templates/                   # Plantillas para documentación
    ├── agent-file-template.md
    ├── checklist-template.md
    ├── plan-template.md
    ├── spec-template.md
    └── tasks-template.md

.claude/commands/                # Comandos para Claude AI
├── speckit.analyze.md
├── speckit.checklist.md
├── speckit.clarify.md
├── speckit.constitution.md
├── speckit.implement.md
├── speckit.plan.md
├── speckit.specify.md
├── speckit.tasks.md
└── speckit.taskstoissues.md
```

---

## 🔄 Flujo de Trabajo

### 1. **Especificación** (`/speckit.specify`)

Crea una especificación de feature desde una descripción en lenguaje natural.

**Qué hace:**
- Genera un nombre corto para la branch (ej: `001-user-auth`)
- Crea la branch y estructura de directorios
- Genera `spec.md` con:
  - User Stories priorizadas (P1, P2, P3...)
  - Requisitos funcionales
  - Criterios de éxito medibles
  - Entidades clave
  - Casos edge

**Ejemplo:**
```
/speckit.specify Agregar autenticación de usuarios con JWT
```

**Output:**
- Branch: `001-user-auth`
- Archivo: `specs/001-user-auth/spec.md`

---

### 2. **Planificación** (`/speckit.plan`)

Crea un plan técnico de implementación basado en la especificación.

**Qué hace:**
- Analiza el contexto técnico del proyecto
- Verifica compliance con la "constitución" del proyecto
- Genera `plan.md` con:
  - Contexto técnico (lenguaje, dependencias, plataforma)
  - Fase 0: Research (`research.md`)
  - Fase 1: Diseño (`data-model.md`, `contracts/`, `quickstart.md`)
  - Estructura del proyecto
  - Tracking de complejidad

**Ejemplo:**
```
/speckit.plan
```

**Output:**
- `specs/001-user-auth/plan.md`
- `specs/001-user-auth/research.md`
- `specs/001-user-auth/data-model.md`
- `specs/001-user-auth/contracts/`
- `specs/001-user-auth/quickstart.md`

---

### 3. **Tareas** (`/speckit.tasks`)

Desglosa el plan en tareas concretas y ordenadas por dependencias.

**Qué hace:**
- Analiza el plan de implementación
- Genera `tasks.md` con:
  - Tareas numeradas y priorizadas
  - Dependencias entre tareas
  - Estimaciones (opcional)
  - Criterios de completitud

**Ejemplo:**
```
/speckit.tasks
```

**Output:**
- `specs/001-user-auth/tasks.md`

---

### 4. **Checklist** (`/speckit.checklist`)

Genera checklists para validación y seguimiento.

**Qué hace:**
- Crea checklists basados en:
  - Requisitos de la especificación
  - Contexto técnico del plan
  - Detalles de implementación de las tareas
- Genera archivos de checklist en `specs/[feature]/checklists/`

**Ejemplo:**
```
/speckit.checklist requirements
```

**Output:**
- `specs/001-user-auth/checklists/requirements.md`

---

### 5. **Implementación** (`/speckit.implement`)

Guía la implementación siguiendo las tareas definidas.

**Qué hace:**
- Lee las tareas del `tasks.md`
- Guía la implementación paso a paso
- Valida contra checklists
- Actualiza documentación

**Ejemplo:**
```
/speckit.implement
```

---

## 📝 Comandos Disponibles

| Comando | Descripción | Cuándo Usar |
|---------|-------------|-------------|
| `/speckit.specify` | Crear especificación de feature | Al inicio, cuando tienes una idea de feature |
| `/speckit.clarify` | Aclarar requisitos ambiguos | Si hay dudas en la especificación |
| `/speckit.plan` | Crear plan técnico | Después de tener la especificación |
| `/speckit.tasks` | Crear tareas | Después de tener el plan |
| `/speckit.checklist` | Generar checklist | Para validación y seguimiento |
| `/speckit.implement` | Guiar implementación | Cuando empiezas a codificar |
| `/speckit.analyze` | Analizar código existente | Para entender código legacy |
| `/speckit.constitution` | Ver/editar constitución | Para definir principios del proyecto |
| `/speckit.taskstoissues` | Convertir tareas a issues de GitHub | Para tracking en GitHub |

---

## 🎨 Principios del Sistema

### 1. **Especificación Primero**
- La especificación (`spec.md`) es **agnóstica de tecnología**
- Se enfoca en **QUÉ** y **POR QUÉ**, no en **CÓMO**
- Escrita para stakeholders de negocio, no solo desarrolladores

### 2. **Planificación Técnica**
- El plan (`plan.md`) incluye decisiones técnicas
- Verifica compliance con la "constitución" del proyecto
- Genera artefactos de diseño (modelos de datos, contratos API)

### 3. **Tareas Desglosadas**
- Cada tarea es independiente y testeable
- Ordenadas por dependencias
- Con criterios claros de completitud

### 4. **Validación Continua**
- Checklists para cada fase
- Validación de calidad de especificación
- Verificación de compliance

---

## 📂 Estructura de un Feature

Cuando creas un feature con `/speckit.specify`, se genera:

```
specs/[###-feature-name]/
├── spec.md                      # Especificación (QUÉ y POR QUÉ)
├── plan.md                      # Plan técnico (CÓMO)
├── research.md                  # Investigación técnica
├── data-model.md                # Modelo de datos
├── quickstart.md                # Guía rápida
├── tasks.md                     # Tareas de implementación
├── contracts/                   # Contratos API (OpenAPI/GraphQL)
│   └── ...
└── checklists/                  # Checklists de validación
    ├── requirements.md
    └── ...
```

---

## 🔧 Scripts de Automatización

### `create-new-feature.sh`
Crea la estructura inicial de un feature:
- Genera el número de feature
- Crea la branch
- Inicializa directorios y archivos

### `setup-plan.sh`
Configura el plan de implementación:
- Copia templates
- Valida prerequisitos
- Prepara contexto

### `check-prerequisites.sh`
Verifica que todo esté listo:
- Branch correcta
- Archivos necesarios presentes
- Estructura válida

### `update-agent-context.sh`
Actualiza el contexto del agente AI:
- Agrega nuevas tecnologías
- Mantiene manual additions
- Sincroniza con el plan

---

## 📋 Constitución del Proyecto

La "constitución" (`.specify/memory/constitution.md`) define:

- **Principios Core**: Reglas fundamentales del proyecto
- **Constraints**: Restricciones técnicas o de negocio
- **Workflow**: Proceso de desarrollo y revisión
- **Governance**: Cómo se gestionan cambios y excepciones

**Ejemplo de principios:**
- Test-First (TDD obligatorio)
- Library-First (features como librerías independientes)
- Simplicity (YAGNI - You Aren't Gonna Need It)

---

## 🚀 Ejemplo de Uso Completo

```bash
# 1. Especificar feature
/speckit.specify Agregar sistema de notificaciones push

# 2. Aclarar dudas si es necesario
/speckit.clarify

# 3. Crear plan técnico
/speckit.plan

# 4. Generar tareas
/speckit.tasks

# 5. Crear checklist
/speckit.checklist implementation

# 6. Implementar
/speckit.implement
```

---

## 💡 Beneficios

✅ **Consistencia**: Todas las features siguen la misma estructura  
✅ **Documentación**: Automática y siempre actualizada  
✅ **Trazabilidad**: Desde idea hasta implementación  
✅ **Calidad**: Validación en cada fase  
✅ **Colaboración**: Especificaciones claras para todo el equipo  
✅ **Mantenibilidad**: Código bien documentado y planificado  

---

## 📚 Recursos

- **Templates**: `.specify/templates/`
- **Scripts**: `.specify/scripts/bash/`
- **Comandos**: `.claude/commands/speckit.*.md`
- **Constitución**: `.specify/memory/constitution.md`

---

## 🛠️ Contexto del Proyecto Actual

### Tecnologías Activas

Este proyecto utiliza las siguientes tecnologías:

**Backend Framework:**
- **NestJS** v11.0.1 - Framework Node.js progresivo
- **TypeScript** v5.7.3 - Lenguaje de programación
- **Node.js** v24.11.1 - Runtime

**Base de Datos:**
- **PostgreSQL** - Base de datos relacional
- **TypeORM** v0.3.28 - ORM para TypeScript
- **Redis** (ioredis v5.8.2) - Caché y colas

**Autenticación y Seguridad:**
- **JWT** (@nestjs/jwt v11.0.2) - Tokens de acceso
- **Passport** (passport-jwt v4.0.1) - Estrategias de autenticación
- **bcrypt** v6.0.0 - Hash de contraseñas
- **Helmet** v8.1.0 - Headers de seguridad
- **Throttler** (@nestjs/throttler v6.5.0) - Rate limiting

**Testing:**
- **Jest** v30.0.0 - Framework de testing
- **ts-jest** v29.2.5 - Preset de Jest para TypeScript
- **Supertest** v7.0.0 - Testing de APIs HTTP

**Colas y Procesamiento:**
- **BullMQ** v5.65.1 - Sistema de colas
- **Nodemailer** v7.0.11 - Envío de emails

**Documentación:**
- **Swagger/OpenAPI** (@nestjs/swagger v11.2.3)
- **Scalar** (@scalar/nestjs-api-reference v1.0.9) - UI de documentación

**Utilidades:**
- **Winston** v3.19.0 - Logging estructurado
- **class-validator** v0.14.3 - Validación de DTOs
- **class-transformer** v0.5.1 - Transformación de objetos
- **Joi** v18.0.2 - Validación de variables de entorno

### Estructura del Proyecto

```
src/
├── auth/                    # Módulo de autenticación
│   ├── dto/                # DTOs (login, register, refresh)
│   ├── strategies/         # Estrategias Passport (JWT)
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
│
├── users/                   # Módulo de gestión de usuarios
│   ├── dto/                # DTOs de usuario
│   ├── entities/           # Entidad User
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
│
├── common/                  # Componentes compartidos
│   ├── constants/         # Constantes de la aplicación
│   ├── decorators/         # Decoradores (@CurrentUser, @Public, @Roles)
│   ├── dto/               # DTOs base (PaginationDto)
│   ├── entities/          # Entidad base (BaseEntity)
│   ├── enums/             # Enums (Role)
│   ├── exceptions/        # Excepciones personalizadas
│   ├── interfaces/        # Interfaces comunes
│   ├── repositories/      # Repositorios base
│   ├── utils/             # Utilidades (soft-delete)
│   └── validators/        # Validadores personalizados
│
├── database/               # Configuración de base de datos
│   ├── data-source.ts     # Configuración TypeORM
│   └── seeders/           # Seeders (admin-user)
│
├── email/                  # Módulo de email
│   ├── dto/               # DTOs de email
│   ├── processors/        # Procesadores de cola
│   ├── templates/         # Servicio de plantillas
│   ├── email.service.ts
│   ├── email-queue.service.ts
│   └── email.module.ts
│
├── logger/                 # Módulo de logging
│   ├── dto/               # DTOs de filtrado
│   ├── entities/          # Entidad Log
│   ├── transports/        # Transports (database)
│   ├── logger.service.ts
│   ├── logs.service.ts
│   └── logger.module.ts
│
├── redis/                  # Módulo Redis
│   ├── redis-cache.service.ts
│   └── redis.module.ts
│
├── utils/                  # Utilidades globales
│   ├── crypto.util.ts     # Criptografía (hash, tokens, UUID)
│   ├── date.util.ts       # Manipulación de fechas
│   ├── string.util.ts     # Manipulación de strings
│   └── response.util.ts   # Formato de respuestas API
│
├── config/                 # Configuración
│   └── env.validation.ts  # Validación de variables de entorno
│
├── filters/                # Filtros de excepciones
├── guards/                 # Guards (JwtAuthGuard, RolesGuard)
├── interceptors/           # Interceptores (logging, transform, timeout)
├── middlewares/            # Middlewares (request-id)
├── queue/                  # Configuración de colas (BullMQ)
├── health/                 # Módulo de health check
├── app.module.ts           # Módulo raíz
├── app.controller.ts
├── app.service.ts
└── main.ts                 # Punto de entrada
```

### Comandos Disponibles

**Desarrollo:**
```bash
npm run start:dev          # Iniciar con hot reload
npm run start:debug        # Iniciar en modo debug
```

**Producción:**
```bash
npm run build              # Compilar para producción
npm run start:prod         # Ejecutar build de producción
```

**Testing:**
```bash
npm test                   # Ejecutar todos los tests
npm run test:watch         # Tests en modo watch
npm run test:cov           # Tests con cobertura
npm run test:cov:html      # Ver reporte HTML de cobertura
npm run test:cov:summary   # Ver resumen de cobertura
npm run test:e2e           # Tests end-to-end
npm run test:debug         # Tests en modo debug
```

**Base de Datos:**
```bash
npm run migration:generate # Generar migración
npm run migration:run      # Ejecutar migraciones
npm run migration:revert   # Revertir última migración
```

**Calidad de Código:**
```bash
npm run lint               # Linter de código
npm run format             # Formatear código con Prettier
```

**Docker:**
```bash
docker-compose up -d       # Iniciar PostgreSQL y Redis
docker-compose down        # Detener servicios
docker-compose ps          # Verificar estado
```

### Estilo de Código

**TypeScript:**
- TypeScript estricto con configuración moderna
- Interfaces y tipos explícitos
- Decoradores de NestJS para metadatos

**NestJS Patterns:**
- Arquitectura modular (modules, controllers, services)
- Dependency Injection
- Decoradores para validación (@IsEmail, @IsNotEmpty, etc.)
- Guards para autorización
- Interceptors para transformación y logging
- Pipes para validación y transformación

**Convenciones:**
- Nombres de archivos: `kebab-case` (ej: `auth.service.ts`)
- Nombres de clases: `PascalCase` (ej: `AuthService`)
- Nombres de métodos: `camelCase` (ej: `findAll()`)
- DTOs con sufijo `.dto.ts`
- Entities con sufijo `.entity.ts`
- Tests con sufijo `.spec.ts`

**Testing:**
- Tests unitarios con Jest
- Arrange-Act-Assert pattern
- Mocks para dependencias externas
- Cobertura mínima: 70% global, 80-100% para módulos críticos

### Cambios Recientes

**Diciembre 2024:**
- ✅ Suite completa de tests unitarios (153 tests)
  - AuthService: 11 tests
  - UsersService: 24 tests
  - LogsService: 15 tests
  - Utilidades: 54 tests (Crypto, Date, String, Response)
  - Validadores: 12 tests (PasswordStrength)
  - RedisCacheService: 18 tests
- ✅ Configuración de cobertura de tests
  - Scripts de cobertura (HTML, summary)
  - Umbrales configurados
  - Exclusiones de archivos no testables
- ✅ Infraestructura de especificación (Specify)
  - Templates y scripts de automatización
  - Comandos Claude AI para planificación
  - Sistema de constitución del proyecto

---

## 🔄 Mantenimiento

El sistema se actualiza automáticamente cuando:
- Se agregan nuevas tecnologías en los planes
- Se actualiza la constitución
- Se modifican los templates

Los scripts detectan cambios y sincronizan el contexto del agente AI.

---

**Última actualización**: 2025-12-14  
**Versión**: 1.0.0  
**Proyecto**: NestJS Backend - Production Ready Template

