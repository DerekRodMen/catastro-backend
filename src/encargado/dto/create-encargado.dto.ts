import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

export class CreateEncargadoDto {
  @ApiProperty({
    example: 'Asociación de Desarrollo Integral de Grecia',
  })
  @IsString()
  @IsNotEmpty({
    message: 'La entidad encargada es obligatoria.',
  })
  @MaxLength(150)
  entidad_encargada!: string;

  @ApiPropertyOptional({
    example: '3-002-123456',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  cedula_juridica?: string;

  @ApiProperty({
    example: 'Juan Pérez Rodríguez',
  })
  @IsString()
  @IsNotEmpty({
    message: 'El representante legal es obligatorio.',
  })
  @MaxLength(150)
  representante_legal!: string;

  @ApiProperty({
    example: 'encargado@correo.com',
  })
  @IsEmail(
    {},
    {
      message:
        'Debe ingresar un correo electrónico válido.',
    },
  )
  @MaxLength(150)
  correo_encargado!: string;

  @ApiProperty({
    example: '8888-8888',
  })
  @IsString()
  @IsNotEmpty({
    message: 'El teléfono es obligatorio.',
  })
  @MaxLength(50)
  telefono_encargado!: string;
}