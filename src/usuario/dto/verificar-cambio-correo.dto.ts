import {
  IsString,
  Matches,
} from 'class-validator';

export class VerificarCambioCorreoDto {
  @IsString()
  @Matches(/^\d{6}$/, {
    message:
      'El código debe contener exactamente 6 dígitos.',
  })
  codigo!: string;
}
