import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { AppModule } from './app.module';
import { LinksService } from './features/links/links.service';

async function bootstrap() {
  const server = express();

  server.get('/:shortCode', async (req, res, next) => {
    if (req.params.shortCode === 'api') {
      return next();
    }

    const linksService = app.get(LinksService);

    try {
      const url = await linksService.resolveShortCode(req.params.shortCode);
      res.redirect(302, url);
    } catch {
      next();
    }
  });

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

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

