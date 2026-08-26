import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateParqueDto {
  @ApiProperty({
    example:
      'Barrio Latino, Grecia Centro',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  ubicacion!: string;

  @ApiProperty({
    example:
      '2-123456-000',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  numero_finca!: string;

  @ApiProperty({
    example: 2500.5,
  })
  @IsNumber()
  @IsPositive()
  area!: number;

  @ApiProperty({
    example:
      'A-1234567-2026',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  numero_plano!: string;

  @ApiProperty({
    example:
      'Visado municipal aprobado',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  visado!: string;

  @ApiProperty({
    example: 'Activo',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  estado!: string;

  @ApiProperty({
    example:
      'Sin inversión registrada',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  descripcion_inversion!: string;

  @ApiProperty({
    example: 0,
  })
  @IsNumber()
  inversion!: number;

  @ApiProperty({
    example:
      '2026-01-01',
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