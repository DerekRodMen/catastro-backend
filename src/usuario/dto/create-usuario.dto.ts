import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre_usuario!: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(150)
  correo!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(100)
  password!: string;

  @IsBoolean()
  @IsOptional()
  estado?: boolean;
}