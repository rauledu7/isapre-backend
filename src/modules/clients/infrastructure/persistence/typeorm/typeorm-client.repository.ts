import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../../../domain/entities/client.entity';
import { ClientRepository } from '../../../domain/repositories/client.repository';
import { ClientOrmEntity } from './client.orm-entity';

/**
 * CAPA DE INFRAESTRUCTURA - ADAPTADOR DE SALIDA
 * Implementación actualizada para manejar cargas familiares como columnas directas.
 */
@Injectable()
export class TypeOrmClientRepository implements ClientRepository {
  constructor(
    @InjectRepository(ClientOrmEntity)
    private readonly repository: Repository<ClientOrmEntity>,
  ) {}

  /**
   * Guarda o actualiza un cliente.
   */
  async save(client: Client): Promise<Client> {
    const ormClient = this.repository.create({
      id: client.id,
      name: client.name,
      email: client.email,
      rut: client.rut,
      phone: client.phone,
      age: client.age,
      clinics: client.clinics,
      income: client.income,
      healthInsurance: client.healthInsurance,
      status: client.status,
      createdAt: client.createdAt,
      // NUEVOS CAMPOS DIRECTOS:
      dependentsCount: client.dependentsCount,
      dependentsAges: client.dependentsAges
    });

    await this.repository.save(ormClient);
    return client;
  }

  /**
   * Busca por RUT.
   */
  async findByRut(rut: string): Promise<Client | null> {
    const ormClient = await this.repository.findOne({ where: { rut } });
    if (!ormClient) return null;
    return this.mapToDomain(ormClient);
  }

  /**
   * Busca por email.
   */
  async findByEmail(email: string): Promise<Client | null> {
    const ormClient = await this.repository.findOne({ where: { email } });
    if (!ormClient) return null;
    return this.mapToDomain(ormClient);
  }

  async findById(id: string): Promise<Client | null> {
    const ormClient = await this.repository.findOne({ where: { id } });
    if (!ormClient) return null;
    return this.mapToDomain(ormClient);
  }

  async findAll(): Promise<Client[]> {
    const orms = await this.repository.find();
    return orms.map(orm => this.mapToDomain(orm));
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  /**
   * Mapeador: Transforma el modelo de DB (ORM) al modelo de Negocio (Domain).
   */
  private mapToDomain(orm: ClientOrmEntity): Client {
    return new Client(
      orm.id,
      orm.name,
      orm.email,
      orm.rut,
      orm.phone,
      orm.age,
      orm.clinics,
      Number(orm.income),
      orm.healthInsurance,
      orm.dependentsCount, // Nuevo
      orm.dependentsAges,  // Nuevo
      orm.createdAt,
      orm.status as 'PENDIENTE' | 'ACTIVO'
    );
  }
}