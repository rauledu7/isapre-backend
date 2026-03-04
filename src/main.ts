import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * 🚀 FUNCIÓN DE ARRANQUE (Bootstrap)
 * Versión optimizada para depurar el error de "Timeout/Port" en Cloud Run.
 */
async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    logger.log('--- INICIO DE DIAGNÓSTICO ---');
    
    const port = process.env.PORT || 8080;
    const dbUrl = process.env.DATABASE_URL;
    
    // Validamos la presencia de la variable antes de iniciar NestJS
    if (!dbUrl) {
      logger.warn('⚠️ ADVERTENCIA: No se detectó DATABASE_URL. La app usará configuración LOCAL.');
      logger.warn('Si estás en la nube, esto causará un error de "Timeout" al no encontrar el host "db".');
    } else {
      logger.log(`✅ DATABASE_URL detectada (Longitud: ${dbUrl.length} caracteres).`);
    }

    logger.log(`Configuración de puerto: ${port}`);
    logger.log('------------------------------');

    /**
     * 1. CREACIÓN DE LA APP
     * NestFactory.create dispara la inicialización de módulos. 
     * Si la conexión a la DB falla o tarda mucho, el log se detendrá aquí.
     */
    logger.log('1. Levantando módulos de NestJS...');
    const app = await NestFactory.create(AppModule);

    // Habilitamos CORS para permitir peticiones desde el Frontend
    app.enableCors({
      origin: '*', 
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });

    // Filtros de validación para los DTOs
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    /**
     * 2. ESCUCHA DEL PUERTO
     * Cloud Run requiere que la app escuche en '0.0.0.0'.
     */
    logger.log(`2. Intentando escuchar en el puerto ${port}...`);
    await app.listen(port, '0.0.0.0');
    
    logger.log(`3. ✅ ¡SISTEMA ONLINE! App funcionando en puerto ${port}`);
    
  } catch (error) {
    logger.error('❌ FALLO CRÍTICO EN EL ARRANQUE:');
    logger.error(error.message);
    
    if (error.stack) {
      logger.error('Detalles técnicos del fallo:');
      logger.error(error.stack);
    }
    
    // Terminamos el proceso para que Google detecte el fallo de inmediato
    process.exit(1);
  }
}

bootstrap();