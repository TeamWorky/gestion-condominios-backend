# 🔍 Solución de Problemas

## ❌ La aplicación no inicia

### Verificaciones

- ✅ Verificar que los servicios Docker estén corriendo: `docker-compose ps`
- ✅ Verificar si PostgreSQL es accesible: `docker-compose logs postgres`
- ✅ Verificar si Redis es accesible: `docker-compose logs redis`
- ✅ Verificar variables de entorno en `.env`

### Soluciones

```bash
# Reiniciar servicios Docker
docker-compose restart

# Ver logs detallados
docker-compose logs -f
```

## ❌ Error de conexión a base de datos

### Verificaciones

- ✅ Verificar que el contenedor PostgreSQL esté corriendo
- ✅ Verificar que las variables `POSTGRES_*` en `.env` coincidan con docker-compose.yml
- ✅ Verificar que el puerto 5432 no esté ocupado por otro proceso

### Soluciones

```bash
# Reiniciar servicios Docker
docker-compose restart

# Verificar conexión manual
docker-compose exec postgres psql -U postgres -d nest_proptech
```

## ❌ Error de conexión a Redis

### Verificaciones

- ✅ Verificar que el contenedor Redis esté corriendo
- ✅ Verificar que las variables `REDIS_*` en `.env` coincidan con docker-compose.yml
- ✅ Verificar que el puerto 6379 no esté ocupado por otro proceso

### Soluciones

```bash
# Reiniciar servicios Docker
docker-compose restart

# Verificar conexión manual
docker-compose exec redis redis-cli ping
```

## ❌ Error de autenticación JWT

### Verificaciones

- ✅ Verificar que `JWT_SECRET` y `JWT_REFRESH_SECRET` estén configurados
- ✅ Verificar que los secrets tengan al menos 32 caracteres
- ✅ Verificar que el token no haya expirado

## ❌ Emails no se envían

### Verificaciones

- ✅ Verificar configuración SMTP en `.env`
- ✅ Verificar logs del servicio de email
- ✅ Verificar que el servicio SMTP esté accesible
- ✅ Verificar credenciales SMTP

### Soluciones

```typescript
// Verificar estado de trabajos en cola
const status = await emailQueueService.getJobStatus(jobId);
console.log(status.failedReason); // Ver razón del fallo
```

## ❌ Tests fallan

### Verificaciones

- ✅ Verificar que todas las dependencias estén instaladas: `npm install`
- ✅ Verificar que los mocks estén configurados correctamente
- ✅ Ejecutar tests individualmente para identificar el problema

### Soluciones

```bash
# Ejecutar un test específico
npm test -- src/auth/auth.service.spec.ts

# Ejecutar con más información
npm test -- --verbose
```

## ❌ Migraciones fallan

### Verificaciones

- ✅ Verificar conexión a base de datos
- ✅ Verificar que no haya migraciones conflictivas
- ✅ Verificar permisos de usuario de base de datos

### Soluciones

```bash
# Revertir última migración
npm run migration:revert

# Ver estado de migraciones
npm run typeorm -- migration:show
```

## 📝 Logs y Debugging

### Ver logs de la aplicación

```bash
# En desarrollo
npm run start:dev

# Ver logs de Docker
docker-compose logs -f
```

### Niveles de log

- `error`: Errores críticos
- `warn`: Advertencias
- `info`: Información general
- `debug`: Información de debugging
- `verbose`: Información detallada

### Habilitar debug

```env
LOG_LEVEL=debug
```

