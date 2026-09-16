import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Parque } from '../../parque/entities/parque.entity';
import { MantenimientoImagen } from './mantenimiento-imagen.entity';

@Entity('MANTENIMIENTO')
export class Mantenimiento {
  @PrimaryGeneratedColumn({
    name: 'id_mantenimiento',
  })
  id_mantenimiento!: number;

  @Column({
    name: 'nombre_mantenimiento',
    type: 'varchar',
    length: 100,
  })
  nombre_mantenimiento!: string;

  @Column({
    name: 'descripcion',
    type: 'varchar',
    length: 500,
  })
  descripcion!: string;

  @Column({
    name: 'inversion',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  inversion!: number | null;

  @Column({
    name: 'descripcion_inversion',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  descripcion_inversion!: string | null;

  @Column({
    name: 'fecha_mantenimiento',
    type: 'date',
  })
  fecha_mantenimiento!: string;

  @Column({
    name: 'id_parque',
    type: 'int',
  })
  id_parque!: number;

  @ManyToOne(
    () => Parque,
    {
      nullable: false,
      onDelete: 'NO ACTION',
    },
  )
  @JoinColumn({
    name: 'id_parque',
  })
  parque!: Parque;

  @OneToMany(
    () => MantenimientoImagen,
    (imagen) => imagen.mantenimiento,
  )
  imagenes!: MantenimientoImagen[];
}
