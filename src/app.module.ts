import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dns from 'node:dns';
import { ClientsModule } from './modules/clients/clients.module';

/**
 * 🚀 SOLUCIÓN NUCLEAR PARA ENETUNREACH (IPv6)
 * Forzamos a Node.js a ignorar IPv6 a nivel de sistema. 
 * Esto evita que el servidor intente conectar a la IP 2600:... que ves en los logs.
 */
// @ts-ignore
const dnsLookup = dns.lookup;
// @ts-ignore
dns.lookup = (hostname, options, callback) => {
  if (typeof options === 'function') return dnsLookup(hostname, { family: 4 }, options);
  return dnsLookup(hostname, { ...options, family: 4 }, callback);
};

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      /**
       * 🔗 CONEXIÓN
       * Usamos DATABASE_URL para producción (Render/Supabase).
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
       * Obligatorio para Supabase.
       */
      ssl: { rejectUnauthorized: false },
      
      /**
       * 🏗️ AJUSTES DE DRIVER
       */
      extra: {
        family: 4, // Refuerzo de IPv4 a nivel de driver
        connectionTimeoutMillis: 10000,
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