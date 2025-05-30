import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🧩 Pridaj túto časť – obslúži statické súbory z priečinka "pdfs"
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  app.use('/pdfs', express.static(join(__dirname, '..', '..', 'pdfs')));

  // Povolenie CORS
  app.enableCors();

  await app.listen(3000, '0.0.0.0');
}
bootstrap();
