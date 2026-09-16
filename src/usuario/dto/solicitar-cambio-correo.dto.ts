import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class SolicitarCambioCorreoDto {
  @IsOptional()
  @IsString()
  @MaxLength(50, {
    message:
      'El nombre no puede superar los 50 caracteres.',
  })
  nombre_usuario?: string;

  @IsEmail(
    {},
    {
      message:
        'Debe ingresar un correo electrónico válido.',
    },
  )
  @MaxLength(150, {
    message:
      'El correo no puede superar los 150 caracteres.',
  })
  correo_nuevo!: string;

  @IsOptional()
  @IsBoolean({
    message:
      'El estado debe ser un valor booleano.',
  })
  estado?: boolean;
}
