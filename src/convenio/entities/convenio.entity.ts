import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import {
  Parque,
} from '../../parque/entities/parque.entity';

@Entity('CONVENIO')
export class Convenio {
  @PrimaryGeneratedColumn({
    name: 'id_convenio',
  })
  id_convenio!: number;

  @Column({
    name: 'numero_convenio',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  numero_convenio!: string | null;

  @Column({
    name: 'fecha_firma',
    type: 'date',
  })
  fecha_firma!: Date;

  @Column({
    name: 'plazo',
    type: 'int',
  })
  plazo!: number;

  @Column({
    name: 'fecha_renovacion_firmas',
    type: 'date',
  })
  fecha_renovacion_firmas!: Date;

  @Column({
    name: 'estado_convenio',
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