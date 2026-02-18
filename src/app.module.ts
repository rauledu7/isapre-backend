import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dns from 'node:dns';
import { ClientsModule } from './modules/clients/clients.module';

/**
 * 🌐 SOLUCIÓN ESTÁNDAR PARA RENDER
 * En lugar de sobrescribir el DNS, usamos el método oficial para 
 * priorizar IPv4. Esto evita el crash que viste en los logs.
 */
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      /**
       * 🚀 CONEXIÓN PARA PRODUCCIÓN
       * Usamos la DATABASE_URL que configuraste en Render.
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
      
      // SSL obligatorio para Supabase
      ssl: { rejectUnauthorized: false },
      
      extra: {
        /**
         * 🚨 ANTÍDOTO ENETUNREACH
         * Forzamos al driver de la base de datos a usar IPv4 (familia 4).
         * Esto ignora la dirección 2600:... que causa el error en Render.
         */
        family: 4,
        connectionTimeoutMillis: 10000,
      },
    }),

    EventEmitterModule.forRoot(),
    ClientsModule,
  ],
})
export class AppModule {}