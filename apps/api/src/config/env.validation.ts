import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  PORT: Joi.number().integer().min(1).max(65535).default(3001),
  DATABASE_URL: Joi.string()
    .uri({ scheme: ['postgres', 'postgresql'] })
    .required(),
  MONGODB_URI: Joi.string()
    .pattern(/^mongodb(?:\+srv)?:\/\//)
    .required(),
  REDIS_URL: Joi.string()
    .uri({ scheme: ['redis', 'rediss'] })
    .required(),
  JWT_SECRET: Joi.string().min(32).required(),
  CORS_ORIGIN: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .default('http://localhost:3000'),
  TRUST_PROXY: Joi.string().allow('').default(''),
  THROTTLE_TTL: Joi.number().integer().min(1000).default(60000),
  THROTTLE_LIMIT: Joi.number().integer().min(1).default(120),
  ANALYTICS_RETENTION_DAYS: Joi.number().integer().min(1).max(3650).default(90),
}).unknown(true);
