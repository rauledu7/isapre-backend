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
       * Si existe DATABASE_URL (Supabase/Render), la usamos directamente.
       * Si no, usamos las variables individuales para local.
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
       * Requerido por Supabase y Render para evitar que la conexión sea rechazada.
       */
      ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
      
      /**
       * 🛠️ CONFIGURACIÓN EXTRA (Solución definitiva al ENETUNREACH)
       * Usamos un objeto dinámico para los parámetros adicionales del driver 'pg'.
       */
      extra: {
        // 1. Si es Google Cloud Run, usamos el socketPath de Cloud SQL.
        ...(process.env.DB_HOST?.startsWith('/cloudsql') 
          ? { socketPath: process.env.DB_HOST } 
          : { 
              // 2. Para Render/Supabase, forzamos IPv4 (family: 4).
              // Esto evita que Node.js intente usar IPv6, lo que causa el error ENETUNREACH.
              family: 4 
            }
        ),
        // Agregamos un pequeño timeout para que la conexión no sea tan impaciente
        connectionTimeoutMillis: 5000,
      }, 
    }),

    EventEmitterModule.forRoot(),
    ClientsModule,
  ],
})
export class AppModule {}