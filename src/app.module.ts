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
       * Si existe DATABASE_URL, TypeORM la usa y omite los campos individuales.
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
      synchronize: true, // Esto creará las tablas en tu nueva 'isapre_db'
      logging: true,
      
      // SSL es obligatorio para Supabase desde Render
      ssl: { rejectUnauthorized: false },
      
      // Forzamos IPv4 para evitar el error ENETUNREACH que vimos en los logs
      extra: {
        family: 4 
      },
    }),

    EventEmitterModule.forRoot(),
    ClientsModule,
  ],
})
export class AppModule {}