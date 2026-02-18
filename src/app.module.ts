import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule } from './modules/clients/clients.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      /**
       * 🚀 CONFIGURACIÓN DE CONEXIÓN FLEXIBLE
       * Usamos la URL completa si existe (Render/Supabase) o variables individuales (Local).
       */
      url: process.env.DATABASE_URL,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      
      autoLoadEntities: true,
      synchronize: true, 
      logging: true,
      
      /**
       * 🔒 SEGURIDAD SSL
       * Supabase y Render requieren SSL. Activamos 'rejectUnauthorized: false' 
       * para permitir certificados autofirmados de proveedores de nube.
       */
      ssl: process.env.DATABASE_URL || process.env.DB_HOST ? { rejectUnauthorized: false } : false,
      
      /**
       * 🛠️ CONFIGURACIÓN EXTRA (Solución definitiva al error de red)
       */
      extra: {
        /**
         * 🌐 ANTÍDOTO PARA ENETUNREACH (IPv6)
         * Forzamos 'family: 4' para obligar al sistema a usar IPv4. 
         * Esto evita que intente conectar a la dirección 2600:... de tus logs.
         */
        family: 4,

        /**
         * 🏗️ COMPATIBILIDAD CON GOOGLE CLOUD RUN
         * Si detectamos un socket de Cloud SQL, lo priorizamos.
         */
        ...(process.env.DB_HOST?.startsWith('/cloudsql') 
          ? { socketPath: process.env.DB_HOST } 
          : {}
        ),

        // Ajustes de estabilidad para producción
        connectionTimeoutMillis: 10000, // 10 segundos de espera para conectar
        idleTimeoutMillis: 30000,       // Cerrar conexiones inactivas tras 30s
        max: 15,                        // Pool de máximo 15 conexiones
      }, 
    }),

    EventEmitterModule.forRoot(),
    ClientsModule,
  ],
})
export class AppModule {}