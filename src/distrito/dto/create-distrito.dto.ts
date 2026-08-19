import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateDistritoDto {
  @ApiProperty({
    example: 'Grecia',
    description: 'Nombre del distrito',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre_distrito!: string;

  @ApiProperty({
    example: 1,
    description: 'Número del distrito',
  })
  @IsInt()
  @IsNotEmpty()
  numero_distrito!: number;
}