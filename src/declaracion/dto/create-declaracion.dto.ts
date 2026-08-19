import {
  IsBoolean,
  IsDateString,
  IsNumber,
} from 'class-validator';

export class CreateDeclaracionDto {
  @IsDateString()
  fecha_declaracion!: string;

  @IsBoolean()
  vigente!: boolean;

  @IsNumber()
  id_parque!: number;
}