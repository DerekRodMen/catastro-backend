import {
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

import {
  ApiProperty,
} from '@nestjs/swagger';

export class RestablecerPasswordDto {
  @ApiProperty({
    example: 'token_recibido_por_correo',
  })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty({
    example: 'NuevaClave2026*',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;
}