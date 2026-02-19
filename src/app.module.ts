import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule } from './modules/clients/clients.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      useFactory: () => {
        /**
         * 🛠️ PROCESAMIENTO DE CONEXIÓN
         * Extraemos los datos de la URL para forzar IPv4 manualmente.
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
          synchronize: true,
          logging: true,
          
          ssl: { rejectUnauthorized: false },

          /**
           * 🚨 EL ÚLTIMO RECURSO
           * Al pasar el host por separado y no como URL completa, 
           * esta opción de 'family: 4' se vuelve obligatoria para el socket.
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