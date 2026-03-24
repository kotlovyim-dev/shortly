import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  PORT: Joi.number().integer().min(1).max(65535).default(3000),
  DATABASE_URL: Joi.string().min(1).required(),
  MONGODB_URI: Joi.string().min(1).optional(),
  REDIS_URL: Joi.string().min(1).optional(),
  JWT_SECRET: Joi.string().min(8).required(),
  THROTTLE_TTL: Joi.number().integer().min(1).default(60000),
  THROTTLE_LIMIT: Joi.number().integer().min(1).default(10),
}).unknown(true);
