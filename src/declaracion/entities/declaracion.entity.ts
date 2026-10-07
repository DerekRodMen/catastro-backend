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

@Entity({
  name: 'DECLARACION',
})
export class Declaracion {

  // ==========================================
  // ID
  // ==========================================

  @PrimaryGeneratedColumn({
    name: 'id_declaracion',
  })
  id_declaracion!: number;

  // ==========================================
  // FECHA DE DECLARACIÓN
  // ==========================================

  @Column({
    name: 'fecha_declaracion',
    type: 'date',
  })
  fecha_declaracion!: Date;

  // ==========================================
  // FECHA DE VENCIMIENTO
  // ==========================================

  @Column({
    name: 'fecha_vencimiento',
    type: 'date',
  })
  fecha_vencimiento!: Date;

  // ==========================================
  // ESTADO
  // ==========================================

  @Column({
    name: 'estado_declaracion',
    type: 'varchar',
    length: 50,
  })
  estado_declaracion!: string;

  // ==========================================
  // PARQUE
  // ==========================================

  @Column({
    name: 'id_parque',
    type: 'int',
  })
  id_parque!: number;

  @ManyToOne(
    () => Parque,
    (parque) =>
      parque.declaraciones,
  )
  @JoinColumn({
    name: 'id_parque',
  })
  parque!: Parque;
}