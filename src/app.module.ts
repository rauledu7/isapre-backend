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
       * Priorizamos la propiedad 'url'. Si existe DATABASE_URL, TypeORM ignora el resto.
       * Esto evita que se mezcle con variables antiguas como DB_HOST.
       */
      ...(process.env.DATABASE_URL 
        ? { url: process.env.DATABASE_URL } 
        : {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT, 10) || 5432,
            username: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'admin123',
            database: process.env.DB_NAME || 'isapre_db',
          }
      ),
      
      autoLoadEntities: true,
      synchronize: true, 
      logging: true,
      // Requerido para Supabase en la nube
      ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
    }),

    EventEmitterModule.forRoot(),
    ClientsModule,
  ],
})
export class AppModule {}