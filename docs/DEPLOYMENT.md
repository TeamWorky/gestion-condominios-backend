# 🚀 Despliegue en Producción

## Requisitos Previos

- ✅ Node.js 24.11.1
- ✅ Base de datos PostgreSQL (servicio gestionado o self-hosted)
- ✅ Instancia Redis (servicio gestionado o self-hosted)

## ✅ Checklist de Despliegue

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

## 🔐 Seguridad

### Variables de Entorno Críticas

Asegúrate de configurar estas variables en producción:

```env
NODE_ENV=production
JWT_SECRET=<secret-fuerte-y-aleatorio>
JWT_REFRESH_SECRET=<secret-fuerte-y-aleatorio-diferente>
CORS_ORIGIN=https://yourdomain.com
```

### Rate Limiting

El proyecto incluye rate limiting por defecto (100 req/min). Ajusta según tus necesidades en `app.module.ts`.

## 📊 Monitoreo

### Health Checks

El endpoint `/api/v1/health` verifica:
- Conexión a PostgreSQL
- Conexión a Redis

Configura alertas basadas en este endpoint.

### Logging

El proyecto usa Winston para logging estructurado. Configura:
- Niveles de log apropiados
- Rotación de logs
- Almacenamiento persistente

## 🔄 Migraciones

Antes de desplegar:

```bash
npm run migration:run
```

Para revertir en caso de problemas:

```bash
npm run migration:revert
```

## 🐳 Docker

Si usas Docker en producción, asegúrate de:

- Usar imágenes oficiales y versionadas
- Configurar volúmenes persistentes para PostgreSQL y Redis
- Configurar networks apropiadas
- Revisar recursos (CPU, memoria)

## 📦 Build de Producción

```bash
npm run build
npm run start:prod
```

## 🔍 Verificación Post-Despliegue

1. Verificar health check: `GET /api/v1/health`
2. Verificar documentación: `GET /api-docs`
3. Probar autenticación: `POST /api/v1/auth/login`
4. Verificar logs para errores

