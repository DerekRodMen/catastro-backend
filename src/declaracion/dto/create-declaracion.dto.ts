import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
} from 'class-validator';

import {
  ApiProperty,
} from '@nestjs/swagger';

export class CreateDeclaracionDto {
  @ApiProperty({
    example: '2026-08-25',
  })
  @IsDateString()
  fecha_declaracion!: string;

  @ApiProperty({
    example: 'Vigente',
    enum: [
      'Vigente',
      'Vencida',
      'Finalizada',
    ],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn([
    'Vigente',
    'Vencida',
    'Finalizada',
  ])
  estado_declaracion!: string;

  @ApiProperty({
    example: 1,
  })
  @IsInt()
  @IsPositive()
  id_parque!: number;
}