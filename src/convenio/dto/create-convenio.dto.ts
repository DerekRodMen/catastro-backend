import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateConvenioDto {
  @IsDateString()
  fecha_firma!: string;

  @IsNumber()
  plazo!: number;

  @IsDateString()
  fecha_renovacion_firmas!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  estado_convenio!: string;

  @IsNumber()
  id_parque!: number;
}