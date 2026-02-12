# 🧰 Utilidades

El proyecto incluye varias utilidades reutilizables para operaciones comunes.

## 📅 Utilidades de Fecha

```typescript
import { DateUtil } from './utils/date.util';

DateUtil.now()                    // Fecha actual
DateUtil.addDays(date, 7)         // Agregar días
DateUtil.isExpired(date)          // Verificar expiración
```

## 🔤 Utilidades de String

```typescript
import { StringUtil } from './utils/string.util';

StringUtil.slugify('Hello World')                    // 'hello-world'
StringUtil.maskEmail('user@example.com')             // 'u***@example.com'
StringUtil.generateRandomString(32)                  // String aleatorio
```

## 🔐 Utilidades de Criptografía

```typescript
import { CryptoUtil } from './utils/crypto.util';

CryptoUtil.generateHash(data)              // Generar hash
CryptoUtil.generateRandomToken()            // Token aleatorio
CryptoUtil.generateUUID()                   // UUID
```

## 📤 Utilidades de Respuesta

```typescript
import { ResponseUtil } from './utils/response.util';

ResponseUtil.success(data)                           // Respuesta exitosa
ResponseUtil.paginated(items, page, limit, total)     // Respuesta paginada
ResponseUtil.error(message)                          // Respuesta de error
```

