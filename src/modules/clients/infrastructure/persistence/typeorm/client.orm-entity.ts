import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

/**
 * CAPA DE INFRAESTRUCTURA - MODELO DE BASE DE DATOS
 * Representa la tabla 'clients' en Supabase.
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
  clinics: string;

  @Column()
  income: number;

  // NUEVOS CAMPOS: Ahora son columnas simples
  @Column({ name: 'dependents_count', default: 0 })
  dependentsCount: number;

  @Column({ name: 'dependents_ages', nullable: true })
  dependentsAges: string;

  @Column()
  healthInsurance: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: 'PENDIENTE' })
  status: string;

  // NOTA: Hemos eliminado la relación @OneToMany con DependentOrmEntity
  // porque la información ahora vive en las columnas de arriba.
}