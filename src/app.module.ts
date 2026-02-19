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
       * 🚀 CONEXIÓN DE PRODUCCIÓN
       * Usamos la DATABASE_URL de Supabase. Al usar el objeto 'url',
       * TypeORM ignora host/port/user individuales.
       */
      url: process.env.DATABASE_URL,
      
      autoLoadEntities: true,
      synchronize: true, 
      logging: true,
      
      /**
       * 🔒 SEGURIDAD SSL
       * Supabase requiere SSL activo con certificados autorizados.
       */
      ssl: {
        rejectUnauthorized: false,
      },
      
      /**
       * 🛠️ AJUSTES DEL DRIVER PG
       * Mantenemos family: 4 como red de seguridad para asegurar que el 
       * driver de la base de datos use siempre la ruta de IPv4.
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