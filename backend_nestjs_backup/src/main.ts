import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const corsOrigins = process.env.CORS_ORIGINS?.split(',').map((s) => s.trim()) ?? [
    '*',
  ];
  app.enableCors({
    origin: corsOrigins.includes('*') ? true : corsOrigins,
    credentials: true,
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: false,
    }),
  );
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}
bootstrap();
