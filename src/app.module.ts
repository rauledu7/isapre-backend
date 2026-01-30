import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ClientsModule } from './modules/clients/clients.module';

/**
 * MÓDULO RAÍZ DE LA APLICACIÓN
 * * Este archivo actúa como el "Plug" principal donde conectamos los módulos del negocio
 * y las configuraciones globales (Base de Datos, Eventos).
 */
@Module({
  imports: [
    // 1. Configuración de la Base de Datos (PostgreSQL)
    TypeOrmModule.forRoot({
      type: 'postgres',
      // En Docker usamos el nombre del servicio definido en docker-compose ('db')
      host: process.env.DB_HOST || 'db', 
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || 'admin',
      password: process.env.DB_PASSWORD || 'admin123',
      database: process.env.DB_NAME || 'isapre_db',
      autoLoadEntities: true, // Carga automáticamente los .orm-entity.ts
      synchronize: true,      // Crea las tablas automáticamente (Solo para desarrollo)
    }),

    // 2. Habilitar la arquitectura de eventos
    EventEmitterModule.forRoot(),

    // 3. Importar nuestro módulo de negocio
    ClientsModule,
  ],
  controllers: [], // Vacío, ya que cada módulo tiene sus propios controladores
  providers: [],   // Vacío, ya que cada módulo tiene sus propios servicios
})
export class AppModule {}