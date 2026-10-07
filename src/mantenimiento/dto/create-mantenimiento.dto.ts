import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import {
  Type,
} from 'class-transformer';

export class CreateMantenimientoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre_mantenimiento!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  descripcion!: string;

  @Type(() => Number)
  @IsNumber(
    {
      maxDecimalPlaces: 2,
    },
    {
      message: 'La inversión debe ser un número válido con máximo 2 decimales.',
    },
  )
  @Min(0)
  @Max(9999999999.99)
  inversion!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  descripcion_inversion!: string;

  @IsDateString()
  fecha_mantenimiento!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_parque!: number;
}
