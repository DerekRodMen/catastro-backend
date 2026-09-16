import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('USUARIO')
export class Usuario {
  @PrimaryGeneratedColumn()
  id_usuario!: number;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  nombre_usuario!: string | null;

  @Column({
    type: 'varchar',
    length: 150,
    unique: true,
  })
  correo!: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  password!: string | null;

  @Column({
    type: 'bit',
    default: false,
  })
  estado!: boolean;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  token_activacion!: string | null;

  @Column({
    type: 'datetime2',
    nullable: true,
  })
  token_expiracion!: Date | null;

  // ============================================
  // CAMBIO DE CORREO PENDIENTE
  // ============================================

  @Column({
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  correo_pendiente!: string | null;

  @Column({
    type: 'varchar',
    length: 64,
    nullable: true,
  })
  codigo_correo_hash!: string | null;

  @Column({
    type: 'datetime2',
    nullable: true,
  })
  codigo_correo_expiracion!: Date | null;
}
