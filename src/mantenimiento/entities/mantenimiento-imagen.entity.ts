import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Mantenimiento } from './mantenimiento.entity';

export type TipoImagenMantenimiento =
  | 'ANTES'
  | 'DESPUES';

@Entity('MANTENIMIENTO_IMAGEN')
export class MantenimientoImagen {

  @PrimaryGeneratedColumn({
    name: 'id_imagen',
  })
  id_imagen!: number;


  @Column({
    name: 'id_mantenimiento',
    type: 'int',
  })
  id_mantenimiento!: number;


  @Column({
    name: 'tipo',
    type: 'varchar',
    length: 10,
  })
  tipo!: TipoImagenMantenimiento;


  @Column({
    name: 'ruta_imagen',
    type: 'varchar',
    length: 500,
  })
  ruta_imagen!: string;


  @Column({
    name: 'orden',
    type: 'int',
  })
  orden!: number;


  @ManyToOne(
    () => Mantenimiento,
    (mantenimiento) =>
      mantenimiento.imagenes,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'id_mantenimiento',
  })
  mantenimiento!: Mantenimiento;
}