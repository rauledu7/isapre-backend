import { Client } from '../entities/client.entity';

/**
 * CAPA DE DOMINIO - PUERTO (PORT)
 * * Esta es la interfaz que define el contrato para persistir clientes.
 * * En Arquitectura Hexagonal, esto es un "Puerto" que la capa de aplicación usa.
 * * La implementación concreta (Adaptador) estará en la capa de infraestructura.
 */
export interface ClientRepository {
  /**
   * Busca un cliente por su email.
   * @param email Email del cliente a buscar.
   * @returns El cliente encontrado o null si no existe.
   */
  findByEmail(email: string): Promise<Client | null>;

  /**
   * Guarda un nuevo cliente o actualiza uno existente.
   * @param client Entidad de dominio a persistir.
   * @returns El cliente guardado.
   */
  save(client: Client): Promise<Client>;

  /**
   * Busca un cliente por su ID.
   * @param id ID único del cliente.
   * @returns El cliente encontrado o null si no existe.
   */
  findById(id: string): Promise<Client | null>;

  /**
   * Elimina un cliente por su ID.
   * @param id ID único del cliente a eliminar.
   */
  delete(id: string): Promise<void>;
}
