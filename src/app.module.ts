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
       * 🚀 CONFIGURACIÓN DE CONEXIÓN DINÁMICA
       * Si existe DATABASE_URL (Supabase/Render), TypeORM la usa como prioridad.
       * De lo contrario, utiliza las variables individuales (Local/Dev).
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
      synchronize: true, // Sincroniza las tablas automáticamente
      logging: true,
      
      /**
       * 🔒 SEGURIDAD SSL
       * Requerido para conectar de forma segura a Supabase y Render.
       */
      ssl: process.env.DATABASE_URL || process.env.DB_HOST 
        ? { rejectUnauthorized: false } 
        : false,
      
      /**
       * 🏗️ COMPATIBILIDAD CON GOOGLE CLOUD
       * Mantenemos el soporte para el socket de Cloud SQL por si vuelves a GCP.
       */
      extra: process.env.DB_HOST?.startsWith('/cloudsql') 
        ? { socketPath: process.env.DB_HOST } 
        : {},
    }),

    EventEmitterModule.forRoot(),
    ClientsModule,
  ],
})
export class AppModule {}