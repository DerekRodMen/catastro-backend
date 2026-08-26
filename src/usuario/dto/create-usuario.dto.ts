import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateUsuarioDto {
  @ApiProperty({
    example: 'Administrador',
    description: 'Nombre del usuario',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre_usuario!: string;

  @ApiProperty({
    example: 'admin@catastro.com',
    description: 'Correo electrónico del usuario',
  })
  @IsEmail()
  @MaxLength(150)
  correo!: string;

  @ApiProperty({
    example: 'Admin123*',
    description: 'Contraseña del usuario',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  password!: string;

  @ApiProperty({
    example: true,
    description: 'Indica si el usuario está activo',
  })
  @IsBoolean()
  estado!: boolean;
}