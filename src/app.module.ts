import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dns from 'node:dns';
import { ClientsModule } from './modules/clients/clients.module';

/**
 * 🌐 SOLUCIÓN PARA ENETUNREACH (IPv6)
 * Esta línea es vital en Render. Obliga a Node.js a buscar primero 
 * direcciones IPv4, evitando el error de red que bloquea el arranque.
 */
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      /**
       * 🚀 CONEXIÓN INTELIGENTE
       * Priorizamos DATABASE_URL. Si está presente, TypeORM la usa automáticamente.
       */
      ...(process.env.DATABASE_URL 
        ? { url: process.env.DATABASE_URL } 
        : {
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || '5432', 10),
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
          }
      ),
      
      autoLoadEntities: true,
      synchronize: true, 
      logging: true,
      
      /**
       * 🔒 SEGURIDAD SSL
       * Requerido por Supabase para aceptar la conexión desde Render.
       */
      ssl: process.env.DATABASE_URL || process.env.DB_HOST 
        ? { rejectUnauthorized: false } 
        : false,
      
      /**
       * 🏗️ AJUSTES DE RED (Solución al error de puertos)
       */
      extra: {
        // Forzamos IPv4 a nivel de driver para asegurar la conexión
        family: 4,
        // Tiempo de espera para no dar timeout tan rápido
        connectionTimeoutMillis: 10000,
        /**
         * Soporte para socket de Cloud SQL por si vuelves a Google Cloud.
         */
        ...(process.env.DB_HOST?.startsWith('/cloudsql') 
          ? { socketPath: process.env.DB_HOST } 
          : {}
        ),
      },
    }),

    EventEmitterModule.forRoot(),
    ClientsModule,
  ],
})
export class AppModule {}