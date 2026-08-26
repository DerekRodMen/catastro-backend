import {
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

import {
  ApiProperty,
} from '@nestjs/swagger';

export class ActivarUsuarioDto {
  @ApiProperty({
    example: 'token_recibido_por_correo',
  })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty({
    example: 'Juan Pérez',
  })
  @IsString()
  @IsNotEmpty()
  nombre_usuario!: string;

  @ApiProperty({
    example: 'MiPassword2026*',
  })
  @IsString()
  @MinLength(8)
  password!: string;
}