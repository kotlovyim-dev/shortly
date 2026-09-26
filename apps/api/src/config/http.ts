import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { json, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import { randomUUID } from 'node:crypto';

export function configureHttp(app: NestExpressApplication) {
  const config = app.get(ConfigService);
  app.disable('x-powered-by');
  app.set(
    'trust proxy',
    config.get<string>('TRUST_PROXY')?.split(',').filter(Boolean) || false,
  );
  app.use(helmet());
  app.use(json({ limit: '16kb' }));
  const origin = config.getOrThrow<string>('CORS_ORIGIN');
  app.enableCors({ origin, credentials: true });
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Request-Id', randomUUID());
    // Cookie authentication needs a CSRF boundary, including same-site sibling origins.
    if (
      !['GET', 'HEAD', 'OPTIONS'].includes(req.method) &&
      ((req.headers.origin && req.headers.origin !== origin) ||
        (!req.headers.origin && req.headers['sec-fetch-site'] === 'cross-site'))
    ) {
      res.status(403).json({ message: 'Untrusted request origin' });
      return;
    }
    res.setHeader('Cache-Control', 'no-store');
    next();
  });
  app.setGlobalPrefix('api', {
    exclude: [{ path: ':shortCode', method: RequestMethod.GET }],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableShutdownHooks();
}
