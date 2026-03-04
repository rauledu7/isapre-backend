import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * 🚀 FUNCIÓN DE ARRANQUE (Bootstrap)
 * Optimizada para detectar fallos de configuración de variables en Google Cloud Run.
 */
async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    logger.log('--- INICIO DE DIAGNÓSTICO DE ENTORNO ---');
    
    const port = process.env.PORT || 8080;
    const dbUrl = process.env.DATABASE_URL;
    
    // 🚩 VERIFICACIÓN CRÍTICA:
    // Si estamos en Cloud Run y no hay DATABASE_URL, la app va a fallar.
    if (!dbUrl) {
      logger.warn('⚠️ ADVERTENCIA: La variable DATABASE_URL no está definida.');
      logger.warn('La aplicación intentará usar la configuración LOCAL (host: db).');
      logger.warn('Si esto es Google Cloud Run, el despliegue FALLARÁ por timeout.');
    } else {
      logger.log('✅ DATABASE_URL detectada. Procediendo a conectar con la nube...');
    }

    logger.log(`Puerto de escucha configurado: ${port}`);
    logger.log('---------------------------------------');

    logger.log('1. 🛠️  Creando instancia de NestJS...');
    
    /**
     * Si el proceso se detiene aquí, revisa los logs de AppModule.
     * Probablemente hay un re-intento infinito de conexión a base de datos.
     */
    const app = await NestFactory.create(AppModule);

    // Configuración de CORS para evitar bloqueos en el navegador (image_62233a.png)
    app.enableCors({
      origin: '*', 
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });

    // Transformación automática de datos (ej: strings a numbers)
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    logger.log(`2. 📡 Abriendo puerto ${port} en interfaz 0.0.0.0...`);
    
    /**
     * Escuchar en 0.0.0.0 es indispensable para que el tráfico externo 
     * llegue al contenedor en Cloud Run.
     */
    await app.listen(Number(port), '0.0.0.0');
    
    logger.log(`3. ✅ ¡SISTEMA ONLINE! Backend escuchando en puerto ${port}`);
    
  } catch (error) {
    logger.error('❌ ERROR CRÍTICO: El servidor no pudo iniciarse.');
    logger.error(`Mensaje del error: ${error.message}`);
    
    if (error.stack) {
      logger.error('Detalles del fallo (Stack Trace):');
      logger.error(error.stack);
    }
    
    // Salida forzada para avisar a Cloud Run del error inmediatamente
    process.exit(1);
  }
}

bootstrap();