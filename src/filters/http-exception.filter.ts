import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse } from '../common/interfaces/api-response.interface';
import { LoggerService } from '../logger/logger.service';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const errorResponse: ApiResponse = {
      success: false,
      message: typeof message === 'string' ? message : (message as any).message,
      errors:
        typeof message === 'object' && (message as any).message
          ? Array.isArray((message as any).message)
            ? (message as any).message
            : [(message as any).message]
          : undefined,
    };

    const requestId = request.headers['x-request-id'] as string;

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} - ${errorResponse.message}`,
        exception instanceof Error ? exception.stack : undefined,
        HttpExceptionFilter.name,
        {
          method: request.method,
          url: request.url,
          statusCode: status,
          requestId,
          error: exception instanceof Error ? exception.message : String(exception),
        },
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} - ${status} - ${errorResponse.message}`,
        HttpExceptionFilter.name,
        {
          method: request.method,
          url: request.url,
          statusCode: status,
          requestId,
        },
      );
    }

    response.status(status).json(errorResponse);
  }
}
