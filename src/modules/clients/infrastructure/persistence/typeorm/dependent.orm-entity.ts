import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { ClientOrmEntity } from './client.orm-entity';

/**
 * CAPA DE INFRAESTRUCTURA - MODELO DE BASE DE DATOS
 * * Nota: Esta clase es diferente a la Entidad de Dominio. 
 * Esta clase solo define cómo se guardan los datos en la tabla 'dependents' de PostgreSQL.
 * Aquí sí usamos decoradores de TypeORM porque estamos en la capa de Infraestructura.
 */
@Entity('dependents')
export class DependentOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ unique: true })
  rut: string;

  @Column()
  age: number;

  @CreateDateColumn()
  createdAt: Date;


  /**
   * RELACIÓN: Muchos dependientes pertenecen a UN cliente.
   * * onDelete: 'CASCADE' asegura que si borras al cliente, 
   * sus cargas se borren automáticamente.
   */
  @ManyToOne(() => ClientOrmEntity, (client) => client.dependentEntities, { 
    onDelete: 'CASCADE' 
  })
  client: ClientOrmEntity;
}