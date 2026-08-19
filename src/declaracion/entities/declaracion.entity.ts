import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Parque } from '../../parque/entities/parque.entity';

@Entity('DECLARACION')
export class Declaracion {
  @PrimaryGeneratedColumn()
  id_declaracion!: number;

  @Column({
    type: 'date',
  })
  fecha_declaracion!: Date;

  @Column({
    type: 'bit',
  })
  vigente!: boolean;

  @ManyToOne(
    () => Parque,
    (parque) => parque.declaraciones,
  )
  @JoinColumn({
    name: 'id_parque',
  })
  parque!: Parque;
}