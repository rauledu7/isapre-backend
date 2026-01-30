import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

/**
 * CONFIGURACIÓN GLOBAL DE LA APLICACIÓN
 * Aquí activamos los motores que NestJS usará en todo el sistema.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Activamos los Pipes de Validación Global
  // Esto hace que los decoradores @IsEmail, @Length, etc., en los DTOs funcionen.
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,      // Elimina campos que no estén definidos en el DTO
    forbidNonWhitelisted: true, // Lanza error si envían campos extraños
    transform: true,      // Transforma automáticamente los tipos (ej: string a number)
  }));

  // 2. Prefijo para la API (opcional pero recomendado)
  // app.setGlobalPrefix('api/v1');

  // 3. Iniciamos el servidor en el puerto definido en el Canvas (.env)
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Aplicación corriendo en: http://localhost:${port}`);
}

bootstrap();