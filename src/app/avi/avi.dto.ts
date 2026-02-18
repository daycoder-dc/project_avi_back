import { IsArray, IsNotEmpty, IsString } from "class-validator";

export class AviTotalUsersDto {
  @IsNotEmpty()
  @IsString()
  attr: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  values: string[];
}

export class AviSeguimientoDto {
  @IsNotEmpty()
  @IsString()
  indicador: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  periodos: string[];

  @IsNotEmpty()
  @IsString()
  metrica: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  funcionarios: string[];

  @IsNotEmpty()
  @IsString()
  dimension: string;
}
