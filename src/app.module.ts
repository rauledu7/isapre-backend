import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dns from 'node:dns';
import { ClientsModule } from './modules/clients/clients.module';

/**
 * 🌐 SOLUCIÓN GLOBAL PARA ENETUNREACH (IPv6)
 * Esta línea obliga a Node.js a buscar primero direcciones IPv4.
 * Es la solución definitiva cuando el entorno de nube (Render) intenta
 * conectar a Supabase por una red IPv6 que no está disponible.
 */
dns.setDefaultResultOrder('ipv4first');

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      /**
       * 🚀 CONFIGURACIÓN DE CONEXIÓN FLEXIBLE
       * Priorizamos DATABASE_URL para Supabase/Render.
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
       * Supabase requiere SSL. 'rejectUnauthorized: false' es necesario
       * para aceptar los certificados de los proveedores de nube.
       */
      ssl: process.env.DATABASE_URL || process.env.DB_HOST ? { rejectUnauthorized: false } : false,
      
      /**
       * 🛠️ CONFIGURACIÓN EXTRA
       */
      extra: {
        /**
         * Forzamos nuevamente la familia 4 a nivel de socket del driver 'pg'.
         */
        family: 4,

        /**
         * 🏗️ COMPATIBILIDAD CON GOOGLE CLOUD RUN
         */
        ...(process.env.DB_HOST?.startsWith('/cloudsql') 
          ? { socketPath: process.env.DB_HOST } 
          : {}
        ),

        // Ajustes de estabilidad para producción
        connectionTimeoutMillis: 15000, // Aumentamos a 15s por si la red está lenta
        idleTimeoutMillis: 30000,
        max: 15,
      }, 
    }),

    EventEmitterModule.forRoot(),
    ClientsModule,
  ],
})
export class AppModule {}