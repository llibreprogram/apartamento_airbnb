import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Swagger - Setup BEFORE global prefix
  const config = new DocumentBuilder()
    .setTitle('Apartamento Airbnb API')
    .setDescription('API para gestión de apartamentos en alquiler vacacional')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Global API prefix
  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT || 3001, '0.0.0.0', () => {
    console.log(`✨ Server running on port ${process.env.PORT || 3001}`);
  });
}

bootstrap();
