import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateParqueDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  ubicacion!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  numero_finca!: string;

  @IsNumber()
  area!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  numero_plano!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  visado!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  estado!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  descripcion_inversion!: string;

  @IsNumber()
  inversion!: number;

  @IsDateString()
  fecha_inversion!: string;

  @IsNumber()
  id_distrito!: number;

  @IsNumber()
  id_asociacion!: number;
}