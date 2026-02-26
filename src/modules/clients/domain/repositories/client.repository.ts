import { Client } from '../entities/client.entity';

/**
 * CAPA DE DOMINIO - PUERTO (PORT)
 * Definimos qué búsquedas necesitamos hacer en la base de datos.
 */
export interface ClientRepository {
  save(client: Client): Promise<Client>;
  
  findByEmail(email: string): Promise<Client | null>;

  /**
   * 🔍 Buscamos por RUT para poder dar el error legible 
   */
  findByRut(rut: string): Promise<Client | null>;

  findById(id: string): Promise<Client | null>;
  
  findAll(): Promise<Client[]>;

  delete(id: string): Promise<void>;
}