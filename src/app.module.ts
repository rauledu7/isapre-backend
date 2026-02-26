import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule } from './modules/clients/clients.module';

@Module({
  imports: [
    // 1. Cargamos las variables de entorno de Google Cloud Run
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      useFactory: () => {
        /**
         * 🛠️ PROCESAMIENTO DE CONEXIÓN (Blindaje Máximo)
         * Extraemos los datos de la URL para forzar IPv4 manualmente.
         * Esto evita errores de red (como ENETUNREACH o EAI_AGAIN) en la nube.
         */
        const dbUrl = new URL(process.env.DATABASE_URL || '');
        
        return {
          type: 'postgres',
          host: dbUrl.hostname,
          port: parseInt(dbUrl.port || '5432', 10),
          username: dbUrl.username,
          password: decodeURIComponent(dbUrl.password),
          database: dbUrl.pathname.slice(1) || 'postgres',
          
          autoLoadEntities: true,
          synchronize: true, // Crea las tablas en Supabase automáticamente
          logging: true,
          
          // SSL es obligatorio para Supabase
          ssl: { rejectUnauthorized: false },

          /**
           * 🚨 EL FILTRO DEFINITIVO
           * Al pasar el host por separado, esta opción de 'family: 4' 
           * obliga al socket de red a usar IPv4 exclusivamente.
           */
          extra: {
            family: 4,
            connectionTimeoutMillis: 20000,
          },
        };
      },
    }),

    EventEmitterModule.forRoot(),
    ClientsModule,
  ],
})
export class AppModule {}