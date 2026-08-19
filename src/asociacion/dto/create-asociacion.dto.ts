import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateAsociacionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre_asociacion!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  cedula_juridica!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre_encargado!: string;

  @IsEmail()
  @MaxLength(150)
  correo_encargado!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  telefono_encargado!: string;
}