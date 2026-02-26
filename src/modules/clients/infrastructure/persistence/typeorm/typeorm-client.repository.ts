import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../../../domain/entities/client.entity';
import { Dependent } from '../../../domain/entities/dependent.entity';
import { ClientRepository } from '../../../domain/repositories/client.repository';
import { ClientOrmEntity } from './client.orm-entity';

/**
 * CAPA DE INFRAESTRUCTURA - ADAPTADOR DE SALIDA
 * Implementación concreta que maneja la persistencia de Clientes y sus Cargas.
 */
@Injectable()
export class TypeOrmClientRepository implements ClientRepository {
  constructor(
    @InjectRepository(ClientOrmEntity)
    private readonly repository: Repository<ClientOrmEntity>,
  ) {}

  /**
   * Guarda o actualiza un cliente.
   * Gracias a 'cascade: true' en la entidad ORM, TypeORM guardará 
   * automáticamente los registros en la tabla 'dependents'.
   */
  async save(client: Client): Promise<Client> {
    const ormClient = this.repository.create({
      id: client.id,
      name: client.name,
      email: client.email,
      rut: client.rut,
      phone: client.phone,
      age: client.age,
      region: client.region,
      commune: client.commune,
      income: client.income,
      /**
       * 🔢 CORRECCIÓN DE PROPIEDAD
       * Cambiamos 'dependentsCount' por 'dependents' para coincidir con 
       * el nombre de la columna definido en ClientOrmEntity.
       */
      dependents: client.dependentsCount, 
      healthInsurance: client.healthInsurance,
      status: client.status,
      createdAt: client.createdAt,
      
      // 🔗 Mapeamos los objetos de dominio a la relación de la DB
      dependentEntities: client.dependents.map(d => ({
        id: d.id,
        rut: d.rut,
        age: d.age,
        createdAt: d.createdAt
      }))
    });

    await this.repository.save(ormClient);
    return client;
  }

  /**
   * Busca un cliente por email incluyendo sus cargas familiares.
   */
  async findByEmail(email: string): Promise<Client | null> {
    const ormClient = await this.repository.findOne({ 
      where: { email },
      relations: ['dependentEntities'] 
    });
    
    if (!ormClient) return null;
    return this.mapToDomain(ormClient);
  }

  /**
   * Busca un cliente por ID incluyendo sus cargas.
   */
  async findById(id: string): Promise<Client | null> {
    const ormClient = await this.repository.findOne({ 
      where: { id },
      relations: ['dependentEntities'] 
    });
    
    if (!ormClient) return null;
    return this.mapToDomain(ormClient);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  /**
   * Mapeador: Transforma el modelo de DB (ORM) al modelo de Negocio (Domain).
   */
  private mapToDomain(orm: ClientOrmEntity): Client {
    // 1. Reconstruimos la lista de objetos de dominio 'Dependent'
    const domainDependents = (orm.dependentEntities || []).map(d => 
      new Dependent(d.id, d.rut, d.age, d.createdAt)
    );

    // 2. Instanciamos el Cliente con su lista real (el conteo es automático vía getter)
    return new Client(
      orm.id,
      orm.name,
      orm.email,
      orm.rut,
      orm.phone,
      orm.age,
      orm.region,
      orm.commune,
      Number(orm.income),
      orm.healthInsurance,
      orm.createdAt,
      orm.status as 'PENDIENTE' | 'ACTIVO',
      domainDependents
    );
  }
}