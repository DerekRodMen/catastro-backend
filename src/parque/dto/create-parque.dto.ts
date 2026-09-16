import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Matches,
  Max,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateParqueDto {
  @ApiProperty({
    example: 'Barrio Latino, Grecia Centro',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  ubicacion!: string;

  @ApiProperty({
    example: '2123456000',
    maxLength: 50,
    description: 'Solo números.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Matches(/^\d+$/, {
    message: 'El número de finca solo puede contener números.',
  })
  numero_finca!: string;

  @ApiProperty({
    example: 2500.5,
    maximum: 9999999999.99,
    description: 'Máximo 10 dígitos enteros y 2 decimales.',
  })
  @IsNumber(
    {
      maxDecimalPlaces: 2,
    },
    {
      message: 'El área debe ser un número válido con máximo 2 decimales.',
    },
  )
  @IsPositive({
    message: 'El área debe ser mayor que 0.',
  })
  @Max(9999999999.99, {
    message: 'El área excede el máximo permitido.',
  })
  area!: number;

  @ApiProperty({
    example: 'A-1234567-2026',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  numero_plano!: string;

  @ApiProperty({
    example: 'Aprobado',
    enum: ['Aprobado', 'Solicitado', 'No tiene'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['Aprobado', 'Solicitado', 'No tiene'], {
    message: 'El visado debe ser Aprobado, Solicitado o No tiene.',
  })
  visado!: string;

  @ApiProperty({
    example: 'Bueno',
    enum: ['Bueno', 'Regular', 'Malo', 'Vacío'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['Bueno', 'Regular', 'Malo', 'Vacío'], {
    message: 'El estado debe ser Bueno, Regular, Malo o Vacío.',
  })
  estado!: string;

  @ApiProperty({
    example: 'Sin inversión registrada',
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  descripcion_inversion!: string;

  @ApiProperty({
    example: 0,
    maximum: 9999999999.99,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Max(9999999999.99)
  inversion!: number;

  @ApiProperty({
    example: '2026-01-01',
  })
  @IsDateString()
  fecha_inversion!: string;

  @ApiProperty({
    example: 1,
  })
  @IsInt()
  @IsPositive()
  id_distrito!: number;

  @ApiProperty({
    example: 1,
  })
  @IsInt()
  @IsPositive()
  id_encargado!: number;
}
