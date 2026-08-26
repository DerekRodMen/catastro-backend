import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

export class CreateEncargadoDto {
  @ApiProperty({
    example: 'ASOCIACION',
    enum: [
      'ASOCIACION',
      'PERSONA',
    ],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn([
    'ASOCIACION',
    'PERSONA',
  ])
  tipo_encargado!: string;

  @ApiPropertyOptional({
    example:
      'Asociación de Desarrollo Integral de Grecia',
  })
  @ValidateIf(
    (obj) =>
      obj.tipo_encargado ===
      'ASOCIACION',
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre_asociacion?: string;

  @ApiPropertyOptional({
    example: '3-002-123456',
  })
  @ValidateIf(
    (obj) =>
      obj.tipo_encargado ===
      'ASOCIACION',
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  cedula_juridica?: string;

  @ApiProperty({
    example:
      'Juan Pérez Rodríguez',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre_encargado!: string;

  @ApiPropertyOptional({
    example: '1-1234-5678',
  })
  @ValidateIf(
    (obj) =>
      obj.tipo_encargado ===
      'PERSONA',
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  cedula_fisica?: string;

  @ApiProperty({
    example:
      'juan.perez@correo.com',
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(150)
  correo_encargado!: string;

  @ApiProperty({
    example: '8888-8888',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  telefono_encargado!: string;
}