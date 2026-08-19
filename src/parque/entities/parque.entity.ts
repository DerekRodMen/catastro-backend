import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Distrito } from '../../distrito/entities/distrito.entity';
import { Asociacion } from '../../asociacion/entities/asociacion.entity';
import { Convenio } from '../../convenio/entities/convenio.entity';
import { Declaracion } from '../../declaracion/entities/declaracion.entity';

@Entity('PARQUE')
export class Parque {
  @PrimaryGeneratedColumn()
  id_parque!: number;

  @Column({
    type: 'varchar',
    length: 200,
  })
  ubicacion!: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  numero_finca!: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  area!: number;

  @Column({
    type: 'varchar',
    length: 50,
  })
  numero_plano!: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  visado!: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  estado!: string;

  @Column({
    type: 'varchar',
    length: 500,
  })
  descripcion_inversion!: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  inversion!: number;

  @Column({
    type: 'date',
  })
  fecha_inversion!: Date;

  @ManyToOne(
    () => Distrito,
    (distrito) => distrito.parques,
  )
  @JoinColumn({
    name: 'id_distrito',
  })
  distrito!: Distrito;

  @ManyToOne(
    () => Asociacion,
    (asociacion) => asociacion.parques,
  )
  @JoinColumn({
    name: 'id_asociacion',
  })
  asociacion!: Asociacion;

  @OneToMany(
  () => Convenio,
  (convenio) => convenio.parque,
)
convenios!: Convenio[];

@OneToMany(
  () => Declaracion,
  (declaracion) => declaracion.parque,
)
declaraciones!: Declaracion[];
}