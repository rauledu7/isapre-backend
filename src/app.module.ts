import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dns from 'node:dns';
import { ClientsModule } from './modules/clients/clients.module';

// Forzamos IPv4 para estabilidad en Docker y Cloud Run
dns.setDefaultResultOrder('ipv4first');

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const dbUrlString = process.env.DATABASE_URL;
        
        /**
         * 🔍 NUEVA LÓGICA DE DETECCIÓN (SIN ERRORES)
         * Si hay DATABASE_URL y NO es localhost, es CLOUD.
         * Eliminamos la búsqueda de "@db" que causaba el conflicto con Supabase.
         */
        const isCloud = dbUrlString && !dbUrlString.includes('localhost') && !dbUrlString.includes('127.0.0.1');

        if (isCloud) {
          console.log('☁️ [Database] Modo NUBE detectado con éxito.');
          const dbUrl = new URL(dbUrlString);
          return {
            type: 'postgres',
            host: dbUrl.hostname,
            port: parseInt(dbUrl.port || '5432', 10),
            username: dbUrl.username,
            password: decodeURIComponent(dbUrl.password),
            database: dbUrl.pathname.slice(1) || 'postgres',
            autoLoadEntities: true,
            synchronize: true, 
            ssl: { rejectUnauthorized: false }, 
            extra: {
              family: 4, 
              connectionTimeoutMillis: 10000, 
            },
          };
        }

        // --- CONFIGURACIÓN LOCAL (DOCKER) ---s
        console.log('🏠 [Database] Modo LOCAL detectado correctamente.');
        return {
          type: 'postgres',
          host: process.env.DB_HOST || 'db', 
          port: parseInt(process.env.DB_PORT || '5432', 10),
          username: process.env.DB_USER || 'admin',
          password: process.env.DB_PASSWORD || 'admin123',
          database: process.env.DB_NAME || 'isapre_db',
          autoLoadEntities: true,
          synchronize: true,
          ssl: false,
        };
      },
    }),

    EventEmitterModule.forRoot(),
    ClientsModule,
  ],
})
export class AppModule {}