import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}
  
  // Sensitive fields that should be filtered from logs
  private readonly sensitiveFields = [
    'password',
    'refreshToken',
    'accessToken',
    'token',
    'authorization',
    'secret',
    'apiKey',
    'apikey',
    'creditCard',
    'creditcard',
    'cvv',
    'ssn',
    'socialSecurityNumber',
  ];

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, query, params, headers } = request;
    const now = Date.now();

    // Filter sensitive fields before logging
    const sanitizedBody = this.sanitizeObject(body);
    const sanitizedQuery = this.sanitizeObject(query);
    const sanitizedParams = this.sanitizeObject(params);
    const sanitizedHeaders = this.sanitizeObject(headers);

    const requestId = request.headers['x-request-id'] as string;

    this.logger.log(
      `Incoming Request: ${method} ${url}`,
      LoggingInterceptor.name,
      {
        method,
        url,
        body: sanitizedBody,
        query: sanitizedQuery,
        params: sanitizedParams,
        requestId,
      },
    );

    return next.handle().pipe(
      tap({
        next: (data) => {
          const response = context.switchToHttp().getResponse();
          const { statusCode } = response;
          const delay = Date.now() - now;

          const requestId = request.headers['x-request-id'] as string;

          this.logger.log(
            `Outgoing Response: ${method} ${url}`,
            LoggingInterceptor.name,
            {
              method,
              url,
              statusCode,
              responseTime: delay,
              requestId,
            },
          );
        },
        error: (error) => {
          const delay = Date.now() - now;
          const requestId = request.headers['x-request-id'] as string;

          this.logger.error(
            `Request Error: ${method} ${url} - ${error.message}`,
            error.stack,
            LoggingInterceptor.name,
            {
              method,
              url,
              responseTime: delay,
              error: error.message,
              requestId,
            },
          );
        },
      }),
    );
  }

  /**
   * Sanitizes an object by removing or masking sensitive fields
   */
  private sanitizeObject(obj: any): any {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item));
    }

    const sanitized = { ...obj };

    for (const key in sanitized) {
      const lowerKey = key.toLowerCase();
      
      // Check if field is sensitive
      if (this.sensitiveFields.some((field) => lowerKey.includes(field.toLowerCase()))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        // Recursively sanitize nested objects
        sanitized[key] = this.sanitizeObject(sanitized[key]);
      }
    }

    return sanitized;
  }
}
