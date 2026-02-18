import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dns from 'node:dns';
import { ClientsModule } from './modules/clients/clients.module';

/**
 * 🌐 SOLUCIÓN NIVEL SISTEMA
 * Forzamos a Node.js a ignorar IPv6 en todas las resoluciones DNS.
 */
dns.setDefaultResultOrder('ipv4first');

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      /**
       * 🚀 CONFIGURACIÓN DE CONEXIÓN
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
       * 🔒 SEGURIDAD SSL (Ajuste para Supabase)
       * Algunos servidores de Supabase rechazan la conexión si no es explícitamente segura.
       */
      ssl: process.env.DATABASE_URL || process.env.DB_HOST 
        ? { 
            rejectUnauthorized: false,
          } 
        : false,
      
      /**
       * 🛠️ AJUSTES DE RED Y DRIVER (Solución al ENETUNREACH)
       */
      extra: {
        /**
         * 🚨 EL ANTÍDOTO DEFINITIVO
         * Forzamos al socket de red a usar la familia 4 (IPv4) exclusivamente.
         * Esto debería impedir que el driver siquiera vea la dirección 2600:...
         */
        family: 4,

        /**
         * 🏗️ COMPATIBILIDAD GOOGLE CLOUD
         */
        ...(process.env.DB_HOST?.startsWith('/cloudsql') 
          ? { socketPath: process.env.DB_HOST } 
          : {}
        ),

        // Ajustes de rendimiento para evitar que Render mate la conexión
        keepAlive: true,
        connectionTimeoutMillis: 20000, // 20 segundos de gracia
      }, 
    }),

    EventEmitterModule.forRoot(),
    ClientsModule,
  ],
})
export class AppModule {}