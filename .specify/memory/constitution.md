# NestJS Backend Constitution

## Core Principles

### I. Modular Architecture
Cada feature debe implementarse como un módulo NestJS independiente y autocontenido. Los módulos deben:
- Ser independientemente testeables
- Tener responsabilidades claras y bien definidas
- Seguir la estructura estándar: controller, service, module, dto, entities
- Usar Dependency Injection para desacoplamiento

### II. Test-First Development (NON-NEGOTIABLE)
TDD es obligatorio para módulos críticos:
- Tests escritos → Usuario aprueba → Tests fallan → Implementar → Tests pasan
- Ciclo Red-Green-Refactor estrictamente aplicado
- Cobertura mínima: 70% global, 80-100% para módulos críticos (auth, users, etc.)
- Tests unitarios con Jest, mocks para dependencias externas

### III. API-First Design
Todas las features deben:
- Definir contratos API (OpenAPI/Swagger) antes de implementar
- Usar DTOs con validación (class-validator)
- Seguir convenciones RESTful
- Documentar endpoints en Scalar UI
- Versionar APIs cuando sea necesario (v1, v2, etc.)

### IV. Security by Default
- Autenticación JWT obligatoria para endpoints protegidos
- Validación de entrada con class-validator
- Rate limiting (100 req/min por defecto)
- Headers de seguridad con Helmet
- Hash de contraseñas con bcrypt
- Control de acceso basado en roles (SUPER_ADMIN, ADMIN, USER, GUEST)

### V. Observability & Logging
- Logging estructurado con Winston
- Request ID tracking para trazabilidad
- Health checks para monitoreo
- Logs almacenados en PostgreSQL para consulta
- Niveles de log apropiados (error, warn, info, debug, verbose)

### VI. Simplicity (YAGNI)
- Start simple, agregar complejidad solo cuando sea necesario
- Evitar sobre-ingeniería
- Usar patrones estándar de NestJS antes de crear soluciones custom
- Preferir soluciones probadas sobre experimentales

## Additional Constraints

### Technology Stack Requirements
- **Backend**: NestJS 11.x, TypeScript 5.7.x, Node.js 24.x
- **Database**: PostgreSQL con TypeORM
- **Cache**: Redis (ioredis)
- **Testing**: Jest con ts-jest
- **Documentation**: Swagger/OpenAPI con Scalar UI

### Code Quality Standards
- ESLint + Prettier para formateo consistente
- TypeScript strict mode habilitado
- Todas las dependencias deben tener tipos (@types/*)
- No usar `any` sin justificación explícita

### Database Standards
- Migraciones TypeORM para todos los cambios de esquema
- Soft delete para entidades principales (users, etc.)
- UUIDs como claves primarias
- Timestamps automáticos (createdAt, updatedAt, deletedAt)

### API Standards
- Respuestas estandarizadas con `ResponseUtil`
- Paginación para listados (PaginationDto)
- Manejo de errores con excepciones personalizadas
- CORS configurado apropiadamente

## Development Workflow

### Feature Development Process
1. **Especificación**: Crear `spec.md` con `/speckit.specify`
2. **Planificación**: Crear `plan.md` con `/speckit.plan`
3. **Tareas**: Desglosar en `tasks.md` con `/speckit.tasks`
4. **Implementación**: Seguir tareas, escribir tests primero
5. **Validación**: Ejecutar tests, verificar cobertura, revisar código

### Code Review Requirements
- Todos los PRs requieren al menos una aprobación
- Tests deben pasar y mantener/mejorar cobertura
- Linter debe pasar sin errores
- Documentación actualizada si es necesario

### Testing Gates
- Tests unitarios obligatorios para servicios
- Cobertura mínima verificada en CI/CD
- Tests deben ser independientes y rápidos
- Mocks para dependencias externas (DB, Redis, servicios externos)

## Governance

La constitución supera todas las demás prácticas. Las excepciones deben:
- Ser documentadas con justificación
- Requerir aprobación del equipo
- Incluir plan de migración si aplica
- Ser revisadas periódicamente

**Version**: 1.0.0 | **Ratified**: 2025-12-14 | **Last Amended**: 2025-12-14
