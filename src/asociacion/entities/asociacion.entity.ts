import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Parque } from '../../parque/entities/parque.entity';

@Entity('ASOCIACION')
export class Asociacion {
  @PrimaryGeneratedColumn()
  id_asociacion!: number;

  @Column({
    type: 'varchar',
    length: 150,
  })
  nombre_asociacion!: string;

  @Column({
    type: 'varchar',
    length: 20,
  })
  cedula_juridica!: string;

  @Column({
    type: 'varchar',
    length: 150,
  })
  nombre_encargado!: string;

  @Column({
    type: 'varchar',
    length: 150,
  })
  correo_encargado!: string;

  @Column({
    type: 'varchar',
    length: 20,
  })
  telefono_encargado!: string;

  @OneToMany(
    () => Parque,
    (parque) => parque.asociacion,
  )
  parques!: Parque[];
}