import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dns from 'node:dns';
import { ClientsModule } from './modules/clients/clients.module';

/**
 * 🌐 PARCHE DE RED
 * Fuerza a Node.js a preferir IPv4 para evitar errores de red internos 
 * en Docker y problemas de resolución en Google Cloud Run.
 */
dns.setDefaultResultOrder('ipv4first');

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const dbUrlString = process.env.DATABASE_URL;
        
        /**
         * 🔍 DETECCIÓN DE ENTORNO
         * Es local si no hay URL, o si la URL apunta a localhost o al servicio 'db'.
         */
        const isLocal = !dbUrlString || 
                        dbUrlString.includes('localhost') || 
                        dbUrlString.includes('127.0.0.1') || 
                        dbUrlString.includes('@db');

        if (!isLocal && dbUrlString) {
          console.log('☁️ [Database] Modo NUBE detectado (SSL On)');
          const dbUrl = new URL(dbUrlString);
          return {
            type: 'postgres',
            host: dbUrl.hostname,
            port: parseInt(dbUrl.port || '5432', 10),
            username: dbUrl.username,
            password: decodeURIComponent(dbUrl.password),
            database: dbUrl.pathname.slice(1) || 'postgres',
            autoLoadEntities: true,
            synchronize: true, // Crea las tablas automáticamente
            ssl: { rejectUnauthorized: false }, // Requerido para Supabase/Cloud SQL
            extra: {
              family: 4, 
              connectionTimeoutMillis: 15000, 
            },
          };
        }

        // --- CONFIGURACIÓN LOCAL (DOCKER / LOCALHOST) ---
        console.log('🏠 [Database] Modo LOCAL detectado (SSL Off)');
        return {
          type: 'postgres',
          host: process.env.DB_HOST || 'db', 
          port: parseInt(process.env.DB_PORT || '5432', 10),
          username: process.env.DB_USER || 'admin',
          password: process.env.DB_PASSWORD || 'admin123',
          database: process.env.DB_NAME || 'isapre_db',
          autoLoadEntities: true,
          synchronize: true,
          ssl: false, // 🚨 CRÍTICO: Desactivado para evitar el error de conexión en local
        };
      },
    }),

    EventEmitterModule.forRoot(),
    ClientsModule,
  ],
})
export class AppModule {}