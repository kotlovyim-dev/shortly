import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { AppModule } from './app.module';
import { LinksService } from './features/links/links.service';

async function bootstrap() {
  const server = express();

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  server.get(/^\/(?!api(?:\/|$))([^/]+)$/, async (req, res, next) => {
    const shortCode = req.params[0];

    if (!shortCode) {
      return next();
    }

    const linksService = app.get(LinksService);

    try {
      const url = await linksService.resolveShortCode(shortCode);
      return res.redirect(302, url);
    } catch {
      return next();
    }
  });

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(Number(process.env.PORT ?? 3001));
}
bootstrap();
