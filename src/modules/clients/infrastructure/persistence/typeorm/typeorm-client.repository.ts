import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientRepository } from '../../../domain/repositories/client.repository';
import { Client } from '../../../domain/entities/client.entity';
import { ClientOrmEntity } from './client.orm-entity';

/**
 * CAPA DE INFRAESTRUCTURA - ADAPTADOR DE SALIDA
 * Implementación concreta del puerto ClientRepository utilizando TypeORM para PostgreSQL.
 */
@Injectable()
export class TypeOrmClientRepository implements ClientRepository {
  constructor(
    @InjectRepository(ClientOrmEntity)
    private readonly repository: Repository<ClientOrmEntity>,
  ) {}

  /**
   * Guarda o actualiza un cliente en la base de datos.
   * Cumple con el contrato devolviendo la entidad de dominio.
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
      dependents: client.dependents,
      healthInsurance: client.healthInsurance,
      status: client.status,
      createdAt: client.createdAt,
    });

    await this.repository.save(ormClient);
    
    // Devolvemos la entidad de dominio original para confirmar la persistencia
    return client;
  }

  /**
   * Busca un cliente por su correo electrónico.
   */
  async findByEmail(email: string): Promise<Client | null> {
    const ormClient = await this.repository.findOneBy({ email });
    if (!ormClient) return null;
    return this.mapToDomain(ormClient);
  }

  /**
   * Busca un cliente por su ID único.
   */
  async findById(id: string): Promise<Client | null> {
    const ormClient = await this.repository.findOneBy({ id });
    if (!ormClient) return null;
    return this.mapToDomain(ormClient);
  }

  /**
   * Elimina físicamente un cliente de la base de datos.
   */
  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  /**
   * Mapeador privado para transformar la entidad de base de datos (ORM)
   * de vuelta a una instancia de la Entidad de Dominio.
   */
  private mapToDomain(orm: ClientOrmEntity): Client {
    return new Client(
      orm.id,
      orm.name,
      orm.email,
      orm.rut,
      orm.phone,
      orm.age,
      orm.region,
      orm.commune,
      Number(orm.income), // Conversión necesaria para tipos Decimal de SQL
      orm.dependents,
      orm.healthInsurance,
      orm.createdAt,
      orm.status as 'PENDIENTE' | 'ACTIVO',
    );
  }
}