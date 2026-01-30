import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegisterClientUseCase } from './application/use-cases/register-client.use-case';
import { ClientsController } from './infrastructure/controllers/clients.controller';
import { ClientEventsListener } from './infrastructure/listeners/client-events.listener';
import { ClientOrmEntity } from './infrastructure/persistence/typeorm/client.orm-entity';
import { DependentOrmEntity } from './infrastructure/persistence/typeorm/dependent.orm-entity';
import { TypeOrmClientRepository } from './infrastructure/persistence/typeorm/typeorm-client.repository';
/**
 * CAPA DE INFRAESTRUCTURA - MÓDULO (ENSAMBLADOR)
 * * Este archivo une todas las piezas del módulo de clientes.
 * Aquí es donde ocurre la "magia" de la Inyección de Dependencias.
 */
@Module({
  imports: [
    /**
     * Registramos la entidad de TypeORM para que NestJS cree 
     * el repositorio base que usaremos en nuestro adaptador.
     */
    TypeOrmModule.forFeature([ClientOrmEntity, DependentOrmEntity]),
  ],
  controllers: [
    // Registramos el Adaptador de Entrada (HTTP)
    ClientsController
  ],
  providers: [
    // Registramos el Caso de Uso (Orquestador)
    RegisterClientUseCase,
    ClientEventsListener,
    /**
     * INVERSIÓN DE DEPENDENCIAS (EL CORAZÓN DEL HEXÁGONO)
     * * Aquí le decimos a NestJS:
     * "Cuando alguien pida 'ClientRepository' (el Puerto), 
     * entrégale una instancia de TypeOrmClientRepository (el Adaptador)".
     */
    {
      provide: 'ClientRepository',
      useClass: TypeOrmClientRepository,
    },
  ],
  exports: [
    // Si otros módulos necesitaran usar el repositorio, lo exportaríamos aquí
  ],
})
export class ClientsModule {}