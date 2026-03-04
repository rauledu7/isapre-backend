import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * 🚀 FUNCIÓN DE ARRANQUE (Bootstrap)
 * Configura el servidor para que sea compatible con Docker Local y Google Cloud Run.
 */
async function bootstrap() {
  // Usamos el Logger de Nest para que los mensajes aparezcan formateados en Google Cloud Logging
  const logger = new Logger('Bootstrap');
  
  try {
    logger.log('1. 🛠️  Iniciando NestFactory con AppModule...');
    
    // Creamos la instancia de la aplicación
    const app = await NestFactory.create(AppModule);

    /**
     * 🛡️ SEGURIDAD: Configuración de CORS
     * Permite que tu Frontend (Next.js en Cloud Run) se comunique con esta API.
     * Al usar '*', permites peticiones desde cualquier origen para evitar bloqueos.
     */
    app.enableCors({
      origin: '*', 
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });

    /**
     * 📝 VALIDACIÓN: Pipes globales
     * Garantiza que los datos que entran coincidan con tus CreateClientDto.
     */
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    /**
     * 🚪 GESTIÓN DE PUERTOS
     * Cloud Run inyecta automáticamente la variable PORT (usualmente 8080).
     * En local, si no hay variable PORT, usará el 8080 por defecto.
     */
    const port = process.env.PORT || 8080;
    
    logger.log(`2. 📡 Intentando escuchar en el puerto ${port} (Host: 0.0.0.0)...`);
    
    /**
     * IMPORTANTE: '0.0.0.0' es obligatorio en la nube. 
     * Indica que el servidor acepta conexiones externas, no solo locales.
     */
    await app.listen(port, '0.0.0.0');
    
    logger.log(`3. ✅ ¡SISTEMA ONLINE! Backend listo en el puerto ${port}`);
    
  } catch (error) {
    /**
     * 🚨 MANEJO DE ERRORES CRÍTICOS
     * Si la base de datos no conecta o el puerto está ocupado, el error se captura aquí.
     */
    logger.error('❌ ERROR CRÍTICO EN EL ARRANQUE DEL SERVIDOR:');
    logger.error(error.message);
    
    if (error.stack) {
      logger.error('Detalles técnicos del error:');
      logger.error(error.stack);
    }
    
    /**
     * Forzamos la salida del proceso con código 1. 
     * Esto le dice a Google Cloud Run que el contenedor falló, 
     * permitiendo que reinicie o muestre el log de error de inmediato.
     */
    process.exit(1);
  }
}

// Ejecutamos el arranque
bootstrap();