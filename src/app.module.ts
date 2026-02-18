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
       * 🚀 SOLUCIÓN FINAL AL ENOTFOUND:
       * Priorizamos la propiedad 'url'. Si existe DATABASE_URL, TypeORM la usa directamente.
       * Esto es ideal para Supabase o Render.
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
       * 🔒 CONFIGURACIÓN DE SEGURIDAD Y CONEXIÓN:
       * 1. SSL: Requerido para conexiones seguras (Supabase/Render).
       * 2. extra: Permite usar el socket de Unix si estamos en Google Cloud Run.
       */
      ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
      
      extra: process.env.DB_HOST?.startsWith('/cloudsql') 
        ? { socketPath: process.env.DB_HOST } 
        : {},
    }),

    EventEmitterModule.forRoot(),
    ClientsModule,
  ],
})
export class AppModule {}