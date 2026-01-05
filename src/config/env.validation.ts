import * as Joi from 'joi';

/**
 * Environment variables validation schema
 * Validates that all critical variables are present and have the correct format
 */
export const envValidationSchema = Joi.object({
  // Application configuration
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),

  // PostgreSQL database
  POSTGRES_HOST: Joi.string().required(),
  POSTGRES_PORT: Joi.number().default(5432),
  POSTGRES_USER: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),
  POSTGRES_DB: Joi.string().required(),

  // Redis
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  
  // Cache configuration
  CACHE_TTL_USER: Joi.number().default(300), // 5 minutes
  CACHE_TTL_USER_LIST: Joi.number().default(60), // 1 minute
  CACHE_TTL_DEFAULT: Joi.number().default(300), // 5 minutes default

  // JWT Secrets - Critical for security
  JWT_SECRET: Joi.string()
    .min(32)
    .required()
    .messages({
      'string.min': 'JWT_SECRET must have at least 32 characters for security',
      'any.required': 'JWT_SECRET is required and cannot be empty',
    }),
  JWT_REFRESH_SECRET: Joi.string()
    .min(32)
    .required()
    .messages({
      'string.min': 'JWT_REFRESH_SECRET must have at least 32 characters for security',
      'any.required': 'JWT_REFRESH_SECRET is required and cannot be empty',
    }),

  // Admin user (optional, have default values)
  ADMIN_EMAIL: Joi.string().email().default('admin@admin.com'),
  ADMIN_PASSWORD: Joi.string().min(8).default('admin'),
  ADMIN_FIRST_NAME: Joi.string().default('Admin'),
  ADMIN_LAST_NAME: Joi.string().default('User'),

  // CORS
  CORS_ORIGIN: Joi.string().default('*'),

  // Logging configuration
  // Console level: controls what appears in console (default: info)
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug', 'verbose')
    .default('info'),
  // Minimum level to save in database (default: warn to capture errors and warnings)
  // Set to 'error' for only errors, 'warn' for errors+warnings, 'info' for all important logs
  LOG_DB_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug', 'verbose')
    .default('warn'),
  LOG_BATCH_SIZE: Joi.number().default(10),
  LOG_BATCH_TIMEOUT: Joi.number().default(5000),
  LOG_RETENTION_DAYS: Joi.number().default(30),

  // Email/SMTP configuration
  SMTP_HOST: Joi.string().optional(),
  SMTP_PORT: Joi.number().default(587),
  SMTP_USER: Joi.string().optional(),
  SMTP_PASSWORD: Joi.string().optional(),
  SMTP_SECURE: Joi.boolean().default(false),
  SMTP_FROM: Joi.string().optional(),
  SMTP_FROM_NAME: Joi.string().default('NestJS App'),
  
  // Application URL (for email links)
  APP_URL: Joi.string().default('http://localhost:3000'),
}).options({
  allowUnknown: true, // Allow additional variables not in schema
  stripUnknown: true, // Remove unknown variables
});
