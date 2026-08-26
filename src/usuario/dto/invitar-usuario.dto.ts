import {
  IsEmail,
} from 'class-validator';

import {
  ApiProperty,
} from '@nestjs/swagger';

export class InvitarUsuarioDto {
  @ApiProperty({
    example: 'usuario@correo.com',
  })
  @IsEmail()
  correo!: string;
}