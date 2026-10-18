import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, Logger } from '@nestjs/common';
import { json, urlencoded } from 'express';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common/pipes';
import { ValidationError } from 'class-validator';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  app.setGlobalPrefix('/v1');

  const allowedOrigins = config
    .getOrThrow<string>('ALLOWED_ORIGINS')
    .split(',')
    .map((s) => s.trim());

  const allowedHeaders = config
    .getOrThrow<string>('ALLOWED_HEADERS')
    .split(',')
    .map((s) => s.trim());

  app.enableCors({
    origin: allowedOrigins,
    allowedHeaders,
    exposedHeaders: [
      'Content-Disposition',
      'X-Export-Skip-Report',
      'Accept-Ranges',
      'Content-Range',
      'ETag',
    ],
    credentials: config.get<string>('CREDENTIALS') === 'true',
  });

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (validationErrors: ValidationError[]) => {
        const firstError = validationErrors?.[0];
        const constraints = Object.values(
          firstError?.constraints ||
            firstError?.children?.[0]?.constraints ||
            {},
        )?.[0];
        return new BadRequestException({
          success: false,
          message: constraints || 'Validation failed',
        });
      },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Akku Ka Chasma')
    .setDescription('Api listing for the project - Akku ka chasma')
    .setVersion('0.0.1')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('docs', app, swaggerDocument);

  const port = Number(config.get('PORT') ?? 8000);
  await app.listen(port, () =>
    Logger.log(`server is running on PORT ${port}`),
  );
}
bootstrap();