import {
  ApiProperty,
} from '@nestjs/swagger';

import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateConvenioDto {

  // ==========================================
  // NÚMERO DE CONVENIO
  // ==========================================

  @ApiProperty({
    example: 'CONV-2026-001',
    description:
      'Número identificador del convenio',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  numero_convenio!: string;

  // ==========================================
  // FECHA DE FIRMA
  // ==========================================

  @ApiProperty({
    example: '2026-08-27',
    description:
      'Fecha en que se firmó el convenio',
  })
  @IsDateString()
  fecha_firma!: string;

  // ==========================================
  // PLAZO EN AÑOS
  // ==========================================

  @ApiProperty({
    example: 5,
    description:
      'Plazo del convenio en años',
  })
  @IsInt()
  @Min(1)
  plazo!: number;

  // ==========================================
  // FECHA DE RENOVACIÓN
  // ==========================================

  @ApiProperty({
    example: '2031-08-27',
    description:
      'Fecha de renovación de firmas calculada según la fecha de firma y el plazo del convenio',
  })
  @IsDateString()
  fecha_renovacion_firmas!: string;

  // ==========================================
  // ESTADO
  // ==========================================

  @ApiProperty({
    example: 'Vigente',
    description:
      'Estado actual del convenio',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  estado_convenio!: string;

  // ==========================================
  // PARQUE
  // ==========================================

  @ApiProperty({
    example: 1,
    description:
      'ID del parque asociado al convenio',
  })
  @IsInt()
  id_parque!: number;
}