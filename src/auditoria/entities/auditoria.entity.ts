import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import {
  Usuario,
} from '../../usuario/entities/usuario.entity';


@Entity('AUDITORIA')
export class Auditoria {

  @PrimaryGeneratedColumn()
  id_auditoria!: number;


  // ============================================
  // USUARIO
  // ============================================

  @Column({
    type: 'int',
    nullable: true,
  })
  id_usuario!: number | null;


  @ManyToOne(
    () => Usuario,
    {
      nullable: true,
      onDelete: 'SET NULL',
    },
  )
  @JoinColumn({
    name: 'id_usuario',
  })
  usuario!: Usuario | null;


  // ============================================
  // DATOS HISTÓRICOS DEL USUARIO
  // ============================================

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  nombre_usuario!: string | null;


  @Column({
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  correo_usuario!: string | null;


  // ============================================
  // ACCIÓN REALIZADA
  // ============================================

  @Column({
    type: 'varchar',
    length: 50,
  })
  modulo!: string;


  @Column({
    type: 'varchar',
    length: 20,
  })
  accion!: string;


  @Column({
    type: 'int',
    nullable: true,
  })
  id_registro!: number | null;


  @Column({
    type: 'varchar',
    length: 500,
  })
  descripcion!: string;


  // ============================================
  // CAMBIOS REALIZADOS
  // ============================================

  @Column({
    type: 'nvarchar',
    length: 'MAX',
    nullable: true,
  })
  datos_anteriores!: string | null;


  @Column({
    type: 'nvarchar',
    length: 'MAX',
    nullable: true,
  })
  datos_nuevos!: string | null;


  // ============================================
  // FECHA
  // ============================================

  @Column({
    type: 'datetime2',
    default: () => 'SYSDATETIME()',
  })
  fecha_hora!: Date;
}