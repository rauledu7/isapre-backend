import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * 🚀 FUNCIÓN DE ARRANQUE (Bootstrap)
 * Optimizada para depurar errores de inicio en Google Cloud Run.
 */
async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    logger.log('--- INICIO DE DIAGNÓSTICO ---');
    
    // Verificamos el puerto y el entorno sin revelar secretos
    const port = process.env.PORT || 8080;
    const hasDbUrl = !!process.env.DATABASE_URL;
    const dbHost = process.env.DB_HOST || 'No definido';
    
    logger.log(`Variable PORT detectada: ${process.env.PORT || 'Usando default 8080'}`);
    logger.log(`¿Existe DATABASE_URL?: ${hasDbUrl ? 'SÍ' : 'NO'}`);
    logger.log(`DB_HOST actual: ${dbHost}`);
    logger.log('------------------------------');

    logger.log('1. 🛠️  Creando instancia de NestJS...');
    
    /**
     * IMPORTANTE: Si la app se queda "pegada" aquí, el problema está 
     * en la conexión de TypeORM dentro de AppModule.
     */
    const app = await NestFactory.create(AppModule);

    // Configuración de seguridad y validación
    app.enableCors({
      origin: '*', 
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });

    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    logger.log(`2. 📡 Intentando abrir puerto ${port} en 0.0.0.0...`);
    
    /**
     * Obligatorio: Escuchar en '0.0.0.0' para Cloud Run.
     * El puerto DEBE ser el que entrega la variable de entorno PORT.
     */
    await app.listen(Number(port), '0.0.0.0');
    
    logger.log(`3. ✅ ¡SISTEMA ONLINE! Backend escuchando en puerto ${port}`);
    
  } catch (error) {
    logger.error('❌ FALLO CRÍTICO: La aplicación no pudo arrancar.');
    logger.error(`Mensaje: ${error.message}`);
    
    if (error.stack) {
      logger.error('Revisa si la URL de la base de datos es correcta o si hay problemas de SSL.');
      logger.error(error.stack);
    }
    
    // Salida forzada para que Google Cloud detecte el fallo inmediatamente
    process.exit(1);
  }
}

bootstrap();