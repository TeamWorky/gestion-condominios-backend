import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import helmet from 'helmet';
import compression = require('compression');
import { apiReference } from '@scalar/nestjs-api-reference';
import { AppModule } from './app.module';
import { LoggerService } from './logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const loggerService = app.get(LoggerService);

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );
  app.use(compression());

  const corsOrigin = configService.get<string>('CORS_ORIGIN') || '*';
  const allowedOrigins =
    corsOrigin === '*' ? '*' : corsOrigin.split(',').map((origin) => origin.trim());

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  });

  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Generate OpenAPI specification dynamically
  const config = new DocumentBuilder()
    .setTitle('NestJS Proptech API')
    .setDescription('Complete backend template with authentication, multi-tenancy, and subscription management')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addServer('http://localhost:3000', 'Development')
    .addServer('https://api.production.com', 'Production')
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Health', 'Health check endpoints')
    .addTag('Logs', 'Logs management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Serve OpenAPI JSON
  app.use('/api/openapi.json', (req, res) => {
    res.json(document);
  });

  // Scalar API Documentation UI
  app.use(
    '/api-docs',
    apiReference({
      theme: 'purple',
      url: '/api/openapi.json',
      darkMode: true,
      layout: 'modern',
      showSidebar: true,
      hideModels: false,
      hideDownloadButton: false,
      defaultHttpClient: {
        targetKey: 'js',
        clientKey: 'fetch',
      },
      searchHotKey: 'k',
    }),
  );

  app.enableShutdownHooks();

  // Global error handler for uncaught exceptions
  process.on('uncaughtException', (error: Error) => {
    loggerService.error(
      'Uncaught Exception',
      error.stack,
      'Bootstrap',
      { error: error.message, name: error.name },
    );
    process.exit(1);
  });

  // Global error handler for unhandled promise rejections
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    const errorMessage = reason instanceof Error ? reason.message : String(reason);
    const errorStack = reason instanceof Error ? reason.stack : undefined;
    loggerService.error(
      'Unhandled Promise Rejection',
      errorStack,
      'Bootstrap',
      { reason: errorMessage, promise: String(promise) },
    );
  });

  const port = configService.get<number>('PORT') || 3000;

  await app.listen(port);

  loggerService.log(
    `Application is running on: http://localhost:${port}`,
    'Bootstrap',
  );
  loggerService.log(
    `API Documentation available at: http://localhost:${port}/api-docs`,
    'Bootstrap',
  );
  loggerService.log(
    `Health Check available at: http://localhost:${port}/api/health`,
    'Bootstrap',
  );
}
bootstrap();
