import {
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';


export class CrearAuditoriaDto {

  @IsOptional()
  @IsInt()
  id_usuario?: number | null;


  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre_usuario?: string | null;


  @IsOptional()
  @IsString()
  @MaxLength(150)
  correo_usuario?: string | null;


  @IsString()
  @MaxLength(50)
  modulo!: string;


  @IsString()
  @MaxLength(20)
  accion!: string;


  @IsOptional()
  @IsInt()
  id_registro?: number | null;


  @IsString()
  @MaxLength(500)
  descripcion!: string;


  @IsOptional()
  @IsObject()
  datos_anteriores?: Record<string, unknown> | null;


  @IsOptional()
  @IsObject()
  datos_nuevos?: Record<string, unknown> | null;
}