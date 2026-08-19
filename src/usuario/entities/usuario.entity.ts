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
    length: 100,
  })
  nombre_usuario!: string;

  @Column({
    type: 'varchar',
    length: 150,
    unique: true,
  })
  correo!: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  password!: string;

  @Column({
    type: 'bit',
    default: true,
  })
  estado!: boolean;
}