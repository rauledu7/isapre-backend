import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dns from 'node:dns';
import { ClientsModule } from './modules/clients/clients.module';

/**
 * 🌐 CONFIGURACIÓN GLOBAL DE RED
 * Establecemos el orden de resolución a IPv4 como prioridad máxima.
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
       * 🚀 CONEXIÓN DE PRODUCCIÓN
       * Usamos la DATABASE_URL de Supabase.
       */
      url: process.env.DATABASE_URL,
      
      autoLoadEntities: true,
      synchronize: true, 
      logging: true,
      
      // SSL requerido para Supabase
      ssl: {
        rejectUnauthorized: false,
      },
      
      /**
       * 🛠️ AJUSTES DEL DRIVER PG
       * 'family: 4' obliga al socket de la base de datos a usar IPv4.
       * Esto es lo que detendrá el error ENETUNREACH 2600:...
       */
      extra: {
        family: 4,
        connectionTimeoutMillis: 15000,
      },
    }),

    EventEmitterModule.forRoot(),
    ClientsModule,
  ],
})
export class AppModule {}