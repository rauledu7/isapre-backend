import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // Usamos el Logger para ver qué pasa en Cloud Logging
  const logger = new Logger('Bootstrap');
  
  try {
    logger.log('1. 🚀 Iniciando NestFactory...');
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    // Google Cloud requiere el puerto 8080 y la IP 0.0.0.0
    const port = process.env.PORT || 8080;
    
    logger.log(`2. 📡 Intentando escuchar en el puerto ${port}...`);
    
    await app.listen(port, '0.0.0.0');
    
    logger.log(`3. ✅ ¡SISTEMA ONLINE! App escuchando en puerto ${port}`);
  } catch (error) {
    // ESTO ES LO MÁS IMPORTANTE: Ver por qué falló
    logger.error('❌ ERROR CRÍTICO EN EL ARRANQUE:');
    logger.error(error.message);
    if (error.stack) logger.error(error.stack);
    
    // Forzamos el cierre para que Google vea el error de inmediato
    process.exit(1);
  }
}

bootstrap();