import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dns from 'node:dns';
import { ClientsModule } from './modules/clients/clients.module';

/**
 * 🌐 PARCHE DE RED
 * Fuerza a Node.js a preferir IPv4. 
 * Esto evita fallos de conexión intermitentes en entornos Docker.
 */
dns.setDefaultResultOrder('ipv4first');

@Module({
  imports: [
    // Cargamos variables de entorno (.env o variables de sistema)
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const dbUrlString = process.env.DATABASE_URL;

        /**
         * 🔍 LÓGICA DE DETECCIÓN DE ENTORNO
         * Si no existe DATABASE_URL, estamos en LOCAL (Docker).
         * Si existe pero apunta a 'db' o 'localhost', también es LOCAL.
         */
        const isLocal = !dbUrlString || 
                        dbUrlString.includes('localhost') || 
                        dbUrlString.includes('127.0.0.1') || 
                        dbUrlString.includes('@db');

        if (!isLocal && dbUrlString) {
          // --- ☁️ CONFIGURACIÓN PARA NUBE (Supabase / Neon / GCP) ---
          const dbUrl = new URL(dbUrlString);
          return {
            type: 'postgres',
            host: dbUrl.hostname,
            port: parseInt(dbUrl.port || '5432', 10),
            username: dbUrl.username,
            password: decodeURIComponent(dbUrl.password),
            database: dbUrl.pathname.slice(1) || 'postgres',
            autoLoadEntities: true,
            synchronize: true, // Sincronización automática
            ssl: { rejectUnauthorized: false }, // SSL obligatorio en la nube
            extra: {
              family: 4, // Fuerza IPv4 para Google Cloud Run
              connectionTimeoutMillis: 20000,
            },
          };
        }

        // --- 💻 CONFIGURACIÓN PARA LOCAL (Docker Compose) ---
        return {
          type: 'postgres',
          // El host 'db' coincide con el nombre del servicio en tu Canvas de Docker Compose
          host: process.env.DB_HOST || 'db', 
          port: parseInt(process.env.DB_PORT || '5432', 10),
          username: process.env.DB_USER || 'admin',
          password: process.env.DB_PASSWORD || 'admin123',
          database: process.env.DB_NAME || 'isapre_db',
          autoLoadEntities: true,
          synchronize: true,
          ssl: false, // 🚨 CRÍTICO: SSL desactivado para evitar errores en Docker local
        };
      },
    }),

    EventEmitterModule.forRoot(),
    ClientsModule,
  ],
})
export class AppModule {}