import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { randomUUID } from 'crypto';
import { Client } from '../../domain/entities/client.entity';
import { Dependent } from '../../domain/entities/dependent.entity';
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

    const existingClientByRut = await this.clientRepository.findByRut(dto.rut);
    if (existingClientByRut) {
      throw new Error(`El RUT ${dto.rut} ya está registrado en el sistema.`);
    }

    /**
     * 2. PROCESAMIENTO DE CARGAS FAMILIARES
     * Transformamos la data plana del DTO en Objetos de Dominio 'Dependent'.
     * Si el frontend envía [], 'dependentObjects' será un arreglo vacío.
     */
    const rawList = Array.isArray(dto.dependentsList) ? dto.dependentsList : [];
    
    const dependentObjects = rawList.map((d) => 
      new Dependent(
        randomUUID(),
        d.rut,
        d.age
      )
    );

    /**
     * 3. CREACIÓN DE LA ENTIDAD (DOMAIN OBJECT)
     * Notar que ya no pasamos el número de dependientes manualmente.
     * La entidad 'Client' calculará su propio conteo basándose en 'dependentObjects'.
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
      new Date(),     // createdAt
      'PENDIENTE',    // status
      dependentObjects // Lista de objetos de dominio
    );

    // 4. PERSISTENCIA
    // Le pedimos al puerto que guarde la entidad. 
    // El repositorio se encargará de guardar en 'clients' y 'dependents' por cascada.
    await this.clientRepository.save(newClient);

    // 5. EVENTOS DE DOMINIO
    // Notificamos que un cliente ha sido registrado. 
    this.eventEmitter.emit('client.registered', {
      ...newClient,
      clientId: newClient.id,
      dependentsCount: newClient.dependentsCount, // Enviamos el conteo real calculado 
      timestamp: new Date()
    });

    return newClient;
  }
}