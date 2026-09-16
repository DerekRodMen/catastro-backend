import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
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
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty({
    message:
      'El nombre es obligatorio.',
  })
  @MaxLength(50, {
    message:
      'El nombre no puede superar los 50 caracteres.',
  })
  nombre_usuario!: string;

  @ApiProperty({
    example: 'MiPassword2026*',
    minLength: 8,
    description:
      'Debe contener al menos una mayúscula, una minúscula, un número y un carácter especial.',
  })
  @IsString()
  @MinLength(8, {
    message:
      'La contraseña debe tener al menos 8 caracteres.',
  })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
    {
      message:
        'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial.',
    },
  )
  password!: string;
}