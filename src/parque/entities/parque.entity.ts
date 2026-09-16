import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Distrito } from '../../distrito/entities/distrito.entity';
import { Encargado } from '../../encargado/entities/encargado.entity';
import { Convenio } from '../../convenio/entities/convenio.entity';
import { Declaracion } from '../../declaracion/entities/declaracion.entity';

@Entity({
  name: 'PARQUE',
})
export class Parque {
  @PrimaryGeneratedColumn({
    name: 'id_parque',
  })
  id_parque!: number;

  @Column({
    name: 'ubicacion',
    type: 'varchar',
    length: 200,
  })
  ubicacion!: string;

  @Column({
    name: 'numero_finca',
    type: 'varchar',
    length: 50,
    unique: true,
  })
  numero_finca!: string;

  @Column({
    name: 'area',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  area!: number;

  @Column({
    name: 'numero_plano',
    type: 'varchar',
    length: 50,
    unique: true,
  })
  numero_plano!: string;

  @Column({
    name: 'visado',
    type: 'varchar',
    length: 50,
  })
  visado!: string;

  @Column({
    name: 'estado',
    type: 'varchar',
    length: 50,
  })
  estado!: string;

  @Column({
    name: 'descripcion_inversion',
    type: 'varchar',
    length: 500,
  })
  descripcion_inversion!: string;

  @Column({
    name: 'inversion',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  inversion!: number;

  @Column({
    name: 'fecha_inversion',
    type: 'date',
  })
  fecha_inversion!: string;

  @Column({
    name: 'id_distrito',
    type: 'int',
  })
  id_distrito!: number;

  @Column({
    name: 'id_encargado',
    type: 'int',
  })
  id_encargado!: number;

  // ============================
  // RELACIÓN CON DISTRITO
  // ============================

  @ManyToOne(
    () => Distrito,
    (distrito) => distrito.parques,
  )
  @JoinColumn({
    name: 'id_distrito',
  })
  distrito!: Distrito;

  // ============================
  // RELACIÓN CON ENCARGADO
  // ============================

  @ManyToOne(
    () => Encargado,
    (encargado) => encargado.parques,
  )
  @JoinColumn({
    name: 'id_encargado',
  })
  encargado!: Encargado;

  // ============================
  // RELACIÓN CON CONVENIOS
  // ============================

  @OneToMany(
    () => Convenio,
    (convenio) => convenio.parque,
  )
  convenios!: Convenio[];

  // ============================
  // RELACIÓN CON DECLARACIONES
  // ============================

  @OneToMany(
    () => Declaracion,
    (declaracion) => declaracion.parque,
  )
  declaraciones!: Declaracion[];
}
