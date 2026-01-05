# NestJS Backend - Development Guidelines

Auto-generated from all feature plans. Last updated: [DATE]

## Active Technologies

**Backend Framework:**
- NestJS v11.0.1
- TypeScript v5.7.3
- Node.js v24.11.1

**Database & Storage:**
- PostgreSQL (TypeORM v0.3.28)
- Redis (ioredis v5.8.2)

**Authentication & Security:**
- JWT (@nestjs/jwt v11.0.2)
- Passport (passport-jwt v4.0.1)
- bcrypt v6.0.0
- Helmet v8.1.0
- Throttler (@nestjs/throttler v6.5.0)

**Testing:**
- Jest v30.0.0
- ts-jest v29.2.5
- Supertest v7.0.0

**Queue & Processing:**
- BullMQ v5.65.1
- Nodemailer v7.0.11

**Documentation:**
- Swagger/OpenAPI (@nestjs/swagger v11.2.3)
- Scalar (@scalar/nestjs-api-reference v1.0.9)

**Utilities:**
- Winston v3.19.0 (Logging)
- class-validator v0.14.3
- class-transformer v0.5.1
- Joi v18.0.2

## Project Structure

```text
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
│   ├── constants/         # Constantes
│   ├── decorators/         # Decoradores (@CurrentUser, @Public, @Roles)
│   ├── dto/               # DTOs base (PaginationDto)
│   ├── entities/          # Entidad base (BaseEntity)
│   ├── enums/             # Enums (Role)
│   ├── exceptions/        # Excepciones personalizadas
│   ├── interfaces/        # Interfaces comunes
│   ├── repositories/      # Repositorios base
│   ├── utils/             # Utilidades
│   └── validators/        # Validadores personalizados
│
├── database/               # Configuración de base de datos
│   ├── data-source.ts     # Configuración TypeORM
│   └── seeders/           # Seeders
│
├── email/                  # Módulo de email
│   ├── dto/
│   ├── processors/        # Procesadores de cola
│   ├── templates/         # Plantillas de email
│   ├── email.service.ts
│   ├── email-queue.service.ts
│   └── email.module.ts
│
├── logger/                 # Módulo de logging
│   ├── dto/
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
│   ├── crypto.util.ts     # Criptografía
│   ├── date.util.ts       # Fechas
│   ├── string.util.ts     # Strings
│   └── response.util.ts   # Respuestas API
│
├── config/                 # Configuración
│   └── env.validation.ts  # Validación de variables
│
├── filters/                # Filtros de excepciones
├── guards/                 # Guards (JWT, Roles)
├── interceptors/           # Interceptores
├── middlewares/            # Middlewares
├── queue/                  # Configuración de colas
├── health/                 # Health check
├── app.module.ts           # Módulo raíz
└── main.ts                 # Punto de entrada
```

## Commands

**Desarrollo:**
```bash
npm run start:dev          # Iniciar con hot reload
npm run start:debug        # Modo debug
```

**Testing:**
```bash
npm test                   # Ejecutar todos los tests
npm run test:watch         # Tests en modo watch
npm run test:cov           # Tests con cobertura
npm run test:cov:html      # Reporte HTML de cobertura
npm run test:cov:summary   # Resumen de cobertura
npm run test:e2e           # Tests end-to-end
```

**Base de Datos:**
```bash
npm run migration:generate # Generar migración
npm run migration:run      # Ejecutar migraciones
npm run migration:revert   # Revertir migración
```

**Calidad:**
```bash
npm run lint               # Linter
npm run format             # Formatear código
```

**Docker:**
```bash
docker-compose up -d       # Iniciar servicios
docker-compose down        # Detener servicios
```

## Code Style

**TypeScript/NestJS:**
- TypeScript estricto con configuración moderna
- Arquitectura modular (modules, controllers, services)
- Dependency Injection
- Decoradores para validación (@IsEmail, @IsNotEmpty, etc.)
- Guards para autorización
- Interceptors para transformación y logging
- Pipes para validación

**Convenciones:**
- Archivos: `kebab-case` (ej: `auth.service.ts`)
- Clases: `PascalCase` (ej: `AuthService`)
- Métodos: `camelCase` (ej: `findAll()`)
- DTOs: sufijo `.dto.ts`
- Entities: sufijo `.entity.ts`
- Tests: sufijo `.spec.ts`

**Testing:**
- Arrange-Act-Assert pattern
- Mocks para dependencias externas
- Cobertura mínima: 70% global, 80-100% módulos críticos

## Recent Changes

[LAST 3 FEATURES AND WHAT THEY ADDED]

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
