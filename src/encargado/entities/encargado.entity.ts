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
    name: 'entidad_encargada',
    type: 'varchar',
    length: 150,
  })
  entidad_encargada!: string;

  @Column({
    name: 'cedula_juridica',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  cedula_juridica!: string | null;

  @Column({
    name: 'representante_legal',
    type: 'varchar',
    length: 150,
  })
  representante_legal!: string;

  @Column({
    name: 'correo_encargado',
    type: 'varchar',
    length: 150,
  })
  correo_encargado!: string;

  @Column({
    name: 'telefono_encargado',
    type: 'varchar',
    length: 50,
  })
  telefono_encargado!: string;

  @OneToMany(
    () => Parque,
    (parque) => parque.encargado,
  )
  parques!: Parque[];
}