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
       * 🚀 CONEXIÓN INTELIGENTE
       * Priorizamos DATABASE_URL. Si está presente, TypeORM la usa automáticamente.
       * Si no, utiliza los campos desglosados (útil para desarrollo local).
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
      synchronize: true, // Esto creará las tablas automáticamente en 'isapre_db'
      logging: true,
      
      /**
       * 🔒 SEGURIDAD SSL
       * Requerido por Supabase. Permitimos certificados de proveedores de nube.
       */
      ssl: process.env.DATABASE_URL || process.env.DB_HOST 
        ? { rejectUnauthorized: false } 
        : false,
      
      /**
       * 🏗️ COMPATIBILIDAD DE INFRAESTRUCTURA
       * Mantenemos el soporte para socket de Cloud SQL por si vuelves a Google Cloud.
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