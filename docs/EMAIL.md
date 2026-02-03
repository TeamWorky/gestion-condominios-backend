# 📧 Sistema de Email

El módulo de email permite enviar emails de forma síncrona o asíncrona usando colas.

## 🔧 Configuración

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

## 📨 Envío Síncrono

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

## 📬 Envío Asíncrono (Cola)

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

## 📋 Plantillas Disponibles

| Plantilla | Descripción | Variables Requeridas |
|-----------|-------------|---------------------|
| `WELCOME` | Email de bienvenida | `name`, `loginUrl` |
| `PASSWORD_RESET` | Reset de contraseña | `name`, `resetUrl`, `expiresIn` |
| `EMAIL_VERIFICATION` | Verificación de email | `name`, `verifyUrl`, `expiresIn` |
| `PASSWORD_CHANGED` | Contraseña cambiada | `name`, `supportUrl` |
| `ACCOUNT_LOCKED` | Cuenta bloqueada | `name`, `unlockUrl`, `supportUrl` |
| `CUSTOM` | Email personalizado | `html` o `text` |

## 💡 Ejemplo Completo

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

## ⚙️ Características de la Cola

- ✅ **Reintentos automáticos**: Hasta 3 intentos con backoff exponencial
- ✅ **Persistencia**: Los trabajos completados se mantienen por 24 horas
- ✅ **Manejo de errores**: Los trabajos fallidos se mantienen por 7 días
- ✅ **Monitoreo**: Puedes verificar el estado de cada trabajo

## 🔍 Verificación de Estado

```typescript
// Obtener estado de un trabajo
const status = await this.emailQueueService.getJobStatus(jobId);

console.log(status);
// {
//   id: 'job-123',
//   state: 'completed',
//   progress: 100,
//   attemptsMade: 1,
//   data: { to: 'user@example.com', ... },
//   failedReason: null,
//   finishedOn: 1234567890,
//   processedOn: 1234567890
// }
```

## ⚠️ Manejo de Errores

El sistema de colas maneja automáticamente los errores:

- Si un email falla, se reintenta automáticamente hasta 3 veces
- Los errores se registran en los logs
- Los trabajos fallidos se mantienen por 7 días para revisión

