import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dns from 'node:dns';
import { ClientsModule } from './modules/clients/clients.module';

/**
 * 🛡️ ESCUDO ANTI-IPV6 PARA RENDER
 * Esta configuración es la "bala de plata". Obliga a todo el proceso de Node.js
 * a ignorar las rutas IPv6 (que causan el error ENETUNREACH en Render).
 */
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      // Priorizamos la URL de conexión única (Supabase)
      url: process.env.DATABASE_URL,
      
      autoLoadEntities: true,
      synchronize: true, 
      logging: true,
      
      // SSL con configuración de tolerancia para nubes gratuitas
      ssl: {
        rejectUnauthorized: false,
      },
      
      /**
       * ⚙️ CONFIGURACIÓN DEL DRIVER (pg)
       * Forzamos la familia 4 (IPv4) directamente en el socket de red.
       */
      extra: {
        family: 4, 
        connectionTimeoutMillis: 15000, // Damos 15s para que la red de Render despierte
      },
    }),

    EventEmitterModule.forRoot(),
    ClientsModule,
  ],
})
export class AppModule {}