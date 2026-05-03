import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { randomUUID } from 'crypto';
import { Client } from '../../domain/entities/client.entity';
import type { ClientRepository } from '../../domain/repositories/client.repository';
import { CreateClientDto } from '../dto/create-client.dto';

/**
 * CAPA DE APLICACIÓN - CASO DE USO (ORQUESTADOR)
 * Ajustado para manejar conteo y edades de cargas como campos directos.
 */
@Injectable()
export class RegisterClientUseCase {
  constructor(
    @Inject('ClientRepository')
    private readonly clientRepository: ClientRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Ejecuta la lógica de negocio para registrar un nuevo cliente.
   * @param dto Datos validados provenientes del exterior (incluye dependentsCount y dependentsAges).
   */
  async execute(dto: CreateClientDto): Promise<Client> {
    // 1. REGLA DE NEGOCIO: Verificar duplicados
    const existingClient = await this.clientRepository.findByEmail(dto.email);
    if (existingClient) {
      throw new Error(`El correo ${dto.email} ya está registrado en el sistema.`);
    }

    const existingClientByRut = await this.clientRepository.findByRut(dto.rut);
    if (existingClientByRut) {
      throw new Error(`El RUT ${dto.rut} ya está registrado en el sistema.`);
    }

    /**
     * 2. CREACIÓN DE LA ENTIDAD (DOMAIN OBJECT)
     * Ahora pasamos directamente dependentsCount (number) y dependentsAges (string).
     * Asegúrate de que el constructor de tu entidad 'Client' acepte estos campos.
     */
    const newClient = new Client(
      randomUUID(), // id
      dto.name,
      dto.email,
      dto.rut,
      dto.phone,
      dto.age,
      dto.clinics,
      dto.income,
      dto.healthInsurance,
      dto.dependentsCount || 0,     // Nuevo campo: Cantidad de cargas
      dto.dependentsAges || '',      // Nuevo campo: String de edades "12,4,2"
      new Date(),       // createdAt
      'PENDIENTE',      // status
    );

    // 3. PERSISTENCIA
    // El repositorio guardará estos campos directamente en la tabla 'clients'.
    await this.clientRepository.save(newClient);

    // 4. EVENTOS DE DOMINIO
    // Notificamos que un cliente ha sido registrado. 
    this.eventEmitter.emit('client.registered', {
      ...newClient,
      clientId: newClient.id,
      timestamp: new Date()
    });

    return newClient;
  }
}