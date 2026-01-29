import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';
import { ValidationPipe, Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // ✅ Globálna validácia vstupov
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Odstráni neznáme polia z objektu
      transform: true, // Automaticky transformuje typy (string -> number)
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 🧩 Obslúha statické súbory z priečinka "pdfs"
  app.use('/pdfs', express.static(join(__dirname, '..', '..', 'pdfs')));

  // Povolenie CORS pre localhost a lokálne siete počas vývoja
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? ['https://yourdomain.com']
        : [
            /^http:\/\/localhost:\d+$/,
            /^http:\/\/192\.168\.\d+\.\d+:\d+$/,
            /^http:\/\/127\.0\.0\.1:\d+$/,
          ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],
    credentials: true,
  });

  const port = parseInt(process.env.PORT || '3002', 10);
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 Server beží na http://localhost:${port}`);
  logger.log(`📊 Dashboard: http://localhost:${port}/dashboard`);
  logger.log(`📄 PDFs: http://localhost:${port}/pdfs`);
}
void bootstrap();
