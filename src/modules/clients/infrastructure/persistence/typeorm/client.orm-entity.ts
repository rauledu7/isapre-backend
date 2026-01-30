import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { DependentOrmEntity } from './dependent.orm-entity';

/**
 * CAPA DE INFRAESTRUCTURA - MODELO DE BASE DE DATOS
 * * Nota: Esta clase es diferente a la Entidad de Dominio. 
 * Esta clase solo define cómo se guardan los datos en la tabla 'clients' de PostgreSQL.
 * Aquí sí usamos decoradores de TypeORM porque estamos en la capa de Infraestructura.
 */
@Entity('clients')
export class ClientOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  rut: string;

  @Column()
  phone: string;

  @Column()
  age: number;

  @Column()
  region: string;

  @Column()
  commune: string;

  // Usamos decimal para precisión financiera en la renta
  @Column()
  income: number;

  @Column()
  dependents: number;

  @Column()
  healthInsurance: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: 'PENDIENTE' })
  status: string;

  /**
   * RELACIÓN: Un cliente tiene MUCHOS dependientes.
   * * cascade: true -> Permite guardar automáticamente las cargas al guardar el cliente.
   * * eager: true -> Carga automáticamente las entidades relacionadas al buscar un cliente.
   */
  @OneToMany(() => DependentOrmEntity, (dependent) => dependent.client, { 
    cascade: true,
    eager: true 
  })
  dependentEntities: DependentOrmEntity[];
}