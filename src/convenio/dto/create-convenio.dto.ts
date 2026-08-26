import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateConvenioDto {
  @ApiProperty({
    example: '2026-08-19',
    description: 'Fecha en que se firmó el convenio',
  })
  @IsDateString()
  fecha_firma!: string;

  @ApiProperty({
    example: 12,
    description: 'Plazo del convenio en meses',
  })
  @IsInt()
  plazo!: number;

  @ApiProperty({
    example: '2027-08-19',
    description: 'Fecha de renovación de firmas',
  })
  @IsDateString()
  fecha_renovacion_firmas!: string;

  @ApiProperty({
    example: 'Vigente',
    description: 'Estado actual del convenio',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  estado_convenio!: string;

  @ApiProperty({
    example: 1,
    description: 'ID del parque asociado al convenio',
  })
  @IsInt()
  id_parque!: number;
}