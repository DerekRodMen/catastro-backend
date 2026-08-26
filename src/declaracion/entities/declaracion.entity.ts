import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Parque } from '../../parque/entities/parque.entity';

@Entity({
  name: 'DECLARACION',
})
export class Declaracion {
  @PrimaryGeneratedColumn({
    name: 'id_declaracion',
  })
  id_declaracion!: number;

  @Column({
    name: 'fecha_declaracion',
    type: 'date',
  })
  fecha_declaracion!: Date;

  @Column({
    name: 'estado_declaracion',
    type: 'varchar',
    length: 50,
  })
  estado_declaracion!: string;

  @Column({
    name: 'id_parque',
    type: 'int',
  })
  id_parque!: number;

  @ManyToOne(
    () => Parque,
    (parque) => parque.declaraciones,
  )
  @JoinColumn({
    name: 'id_parque',
  })
  parque!: Parque;
}