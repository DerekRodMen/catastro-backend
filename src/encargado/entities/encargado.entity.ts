import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Parque } from '../../parque/entities/parque.entity';

@Entity({
  name: 'ENCARGADO',
})
export class Encargado {
  @PrimaryGeneratedColumn({
    name: 'id_encargado',
  })
  id_encargado!: number;

  @Column({
    name: 'tipo_encargado',
    type: 'varchar',
    length: 20,
  })
  tipo_encargado!: string;

  @Column({
    name: 'nombre_asociacion',
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  nombre_asociacion!: string | null;

  @Column({
    name: 'cedula_juridica',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  cedula_juridica!: string | null;

  @Column({
    name: 'nombre_encargado',
    type: 'varchar',
    length: 150,
  })
  nombre_encargado!: string;

  @Column({
    name: 'cedula_fisica',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  cedula_fisica!: string | null;

  @Column({
    name: 'correo_encargado',
    type: 'varchar',
    length: 150,
  })
  correo_encargado!: string;

  @Column({
    name: 'telefono_encargado',
    type: 'varchar',
    length: 20,
  })
  telefono_encargado!: string;

  @OneToMany(
    () => Parque,
    (parque) => parque.encargado,
  )
  parques!: Parque[];
}