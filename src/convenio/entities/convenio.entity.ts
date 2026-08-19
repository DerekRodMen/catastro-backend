import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Parque } from '../../parque/entities/parque.entity';

@Entity('CONVENIO')
export class Convenio {
  @PrimaryGeneratedColumn()
  id_convenio!: number;

  @Column({
    type: 'date',
  })
  fecha_firma!: Date;

  @Column({
    type: 'int',
  })
  plazo!: number;

  @Column({
    type: 'date',
  })
  fecha_renovacion_firmas!: Date;

  @Column({
    type: 'varchar',
    length: 50,
  })
  estado_convenio!: string;

  @ManyToOne(
    () => Parque,
    (parque) => parque.convenios,
  )
  @JoinColumn({
    name: 'id_parque',
  })
  parque!: Parque;
}