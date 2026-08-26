import {
  IsEmail,
} from 'class-validator';

import {
  ApiProperty,
} from '@nestjs/swagger';

export class SolicitarRecuperacionDto {
  @ApiProperty({
    example:
      'usuario@correo.com',
  })
  @IsEmail()
  correo!: string;
}