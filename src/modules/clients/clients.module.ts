import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegisterClientUseCase } from './application/use-cases/register-client.use-case';
import { ClientsController } from './infrastructure/controllers/clients.controller';
import { ClientEventsListener } from './infrastructure/listeners/client-events.listener';
import { ClientOrmEntity } from './infrastructure/persistence/typeorm/client.orm-entity';
// ELIMINADO: DependentOrmEntity ya no existe
import { TypeOrmClientRepository } from './infrastructure/persistence/typeorm/typeorm-client.repository';

/**
 * CAPA DE INFRAESTRUCTURA - MÓDULO (ENSAMBLADOR)
 * * Este archivo une todas las piezas del módulo de clientes.
 */
@Module({
  imports: [
    /**
     * Registramos solo ClientOrmEntity. 
     * TypeORM ya no necesita gestionar la tabla de dependientes.
     */
    TypeOrmModule.forFeature([ClientOrmEntity]),
  ],
  controllers: [
    ClientsController
  ],
  providers: [
    RegisterClientUseCase,
    ClientEventsListener,
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