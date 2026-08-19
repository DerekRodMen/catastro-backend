import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Parque } from '../../parque/entities/parque.entity';

@Entity('DISTRITO')
export class Distrito {
  @PrimaryGeneratedColumn()
  id_distrito!: number;

  @Column({
    type: 'varchar',
    length: 100,
  })
  nombre_distrito!: string;

  @Column({
    type: 'int',
  })
  numero_distrito!: number;

  @OneToMany(
    () => Parque,
    (parque) => parque.distrito,
  )
  parques!: Parque[];
}