import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { randomUUID } from 'crypto';
import { Client } from '../../domain/entities/client.entity';
import type { ClientRepository } from '../../domain/repositories/client.repository';
import { CreateClientDto } from '../dto/create-client.dto';
/**
 * CAPA DE APLICACIÓN - CASO DE USO (ORQUESTADOR)
 * * Este es el "Director de Orquesta". Su única responsabilidad es definir
 * los pasos necesarios para registrar un cliente, sin importar qué
 * base de datos o framework se esté utilizando.
 */
@Injectable()
export class RegisterClientUseCase {
  constructor(
    // Inyectamos el "Puerto" (Interfaz). Gracias a esto, si cambiamos
    // la base de datos en el futuro, este archivo NO se modifica.
    @Inject('ClientRepository')
    private readonly clientRepository: ClientRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Ejecuta la lógica de negocio para registrar un nuevo cliente.
   * @param dto Datos validados provenientes del exterior.
   */
  async execute(dto: CreateClientDto): Promise<Client> {
    // 1. REGLA DE NEGOCIO: Verificar si el cliente ya existe por email
    const existingClient = await this.clientRepository.findByEmail(dto.email);
    if (existingClient) {
      throw new Error(`El correo ${dto.email} ya está registrado en el sistema.`);
    }

    // 2. CREACIÓN DE LA ENTIDAD (DOMAIN OBJECT)
    // Instanciamos el objeto de dominio donde se ejecutan las validaciones internas.
    const newClient = new Client(
      randomUUID(), // Generamos el ID único (Identidad del dominio)
      dto.name,
      dto.email,
      dto.rut,
      dto.phone,
      dto.age,
      dto.region,
      dto.commune,
      dto.income,
      dto.dependents,
      dto.healthInsurance
    );

    // 3. PERSISTENCIA
    // Le pedimos al puerto que guarde la entidad.
    await this.clientRepository.save(newClient);

    // 4. EVENTOS DE DOMINIO
    // Notificamos que un cliente ha sido registrado. 
    this.eventEmitter.emit('client.registered', {
      ...newClient,
      clientId: newClient.id, // Mapeamos 'id' a 'clientId' para compatibilidad con el listener
      timestamp: new Date()
    });

    return newClient;
  }
}