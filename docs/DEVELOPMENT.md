# 🏗️ Guía de Desarrollo

## Crear un Nuevo Módulo

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

### Usando RedisCacheService

```typescript
import { RedisCacheService } from './redis/redis-cache.service';

constructor(private readonly cache: RedisCacheService) {}

async findOne(id: string) {
  return this.cache.getOrSet(
    `user:${id}`,
    async () => {
      return await this.repository.findOne({ where: { id } });
    },
    300 // TTL en segundos
  );
}
```

## ⚠️ Excepciones Personalizadas

```typescript
import { 
  NotFoundException, 
  AlreadyExistsException 
} from './common/exceptions/business.exception';

throw new NotFoundException('User');
throw new AlreadyExistsException('Email');
```

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

## 🧪 Escribir Tests

Cada módulo debe incluir tests unitarios. Ver [TESTING.md](./TESTING.md) para más detalles.

### Ejemplo de Test

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { YourService } from './your.service';

describe('YourService', () => {
  let service: YourService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [YourService],
    }).compile();

    service = module.get<YourService>(YourService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

