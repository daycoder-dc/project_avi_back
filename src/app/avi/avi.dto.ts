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
  tipo_seguimiento: string;

  @IsNotEmpty()
  @IsString()
  tipo_metrica: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  tipo_periodos: string[];

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  funcionarios: string[];
}
