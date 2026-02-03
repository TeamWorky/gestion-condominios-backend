# 🧪 Testing

El proyecto incluye una suite completa de tests unitarios que garantizan la calidad y confiabilidad del código.

## 📊 Estadísticas de Tests

- **Total de tests**: 248 tests pasando ✅
- **Archivos de test**: 17 archivos
- **Cobertura**: Alta cobertura en módulos críticos

## 🎯 Módulos con Tests

### Módulos Principales
- **AuthService**: 11 tests - Autenticación, registro, login, logout, refresh tokens
- **AuthController**: 7 tests - Registro, login, logout, refresh tokens, selección de condominio
- **UsersService**: 24 tests - CRUD completo, soft delete, restore, permisos de roles
- **UsersController**: 12 tests - CRUD completo, soft delete, restore, hard delete
- **LogsService**: 15 tests - Filtrado, búsqueda, estadísticas
- **LogsController**: 12 tests - Listado, filtros, estadísticas, búsquedas

### Utilidades
- **CryptoUtil**: 12 tests - Hash, tokens, UUIDs
- **DateUtil**: 15 tests - Manipulación de fechas
- **StringUtil**: 18 tests - Slugify, truncate, validación de emails
- **ResponseUtil**: 9 tests - Formato de respuestas API

### Validadores y Servicios
- **PasswordStrengthValidator**: 12 tests - Validación de contraseñas
- **RedisCacheService**: 18 tests - Caché, invalidación, TTL

### Servicios de Email
- **EmailService**: 18 tests - Envío de emails, plantillas, manejo de errores
- **EmailQueueService**: 9 tests - Gestión de cola de emails, estado de trabajos
- **EmailTemplatesService**: 12 tests - Todas las plantillas de email disponibles
- **EmailProcessor**: 5 tests - Procesamiento de trabajos de email

### Controladores
- **HealthController**: 8 tests - Health checks de base de datos y Redis

## 🚀 Comandos de Testing

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

## 📈 Cobertura de Código

| Módulo | Statements | Branches | Functions | Lines |
|--------|-----------|----------|-----------|-------|
| AuthService | 100% | 83.33% | 100% | 100% |
| AuthController | Alta | Alta | Alta | Alta |
| EmailService | Alta | Alta | Alta | Alta |
| EmailQueueService | Alta | Alta | Alta | Alta |
| EmailTemplatesService | Alta | Alta | Alta | Alta |
| EmailProcessor | Alta | Alta | Alta | Alta |
| HealthController | Alta | Alta | Alta | Alta |
| LogsService | Alta | Alta | Alta | Alta |
| LogsController | Alta | Alta | Alta | Alta |
| UsersService | Alta | Alta | Alta | Alta |
| UsersController | Alta | Alta | Alta | Alta |
| Utils | 100% | 100% | 100% | 100% |
| RedisCacheService | 100% | 86.66% | 100% | 100% |

## 📝 Información en Scalar

La documentación de Scalar (`/api-docs`) incluye información detallada sobre los tests, incluyendo:
- Estadísticas de cobertura
- Módulos testeados
- Comandos para ejecutar tests
- Métricas de calidad

## 🎯 Estrategia de Testing

### Tests Unitarios
- Cada servicio y controlador tiene su archivo de pruebas correspondiente
- Uso de mocks para dependencias externas
- Patrón Arrange-Act-Assert (AAA)
- Cobertura de casos exitosos y de error

### Mejores Prácticas
- ✅ Tests independientes y aislados
- ✅ Nombres descriptivos para tests
- ✅ Un test por caso de uso
- ✅ Mocks apropiados para servicios externos
- ✅ Verificación de llamadas a dependencias

