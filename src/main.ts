import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * CONFIGURACIÓN PARA GOOGLE CLOUD RUN
 * Es vital que escuche en '0.0.0.0' y use el puerto 8080 por defecto.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validación global (mantenemos tu configuración actual)
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  /**
   * 🚀 MODIFICACIÓN PARA GOOGLE CLOUD:
   * 1. Google inyecta el puerto en la variable process.env.PORT (usualmente 8080).
   * 2. '0.0.0.0' es OBLIGATORIO para que el tráfico externo entre al contenedor.
   */
  const port = process.env.PORT || 8080;
  
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 Servidor en la nube escuchando en el puerto: ${port}`);
}

bootstrap();