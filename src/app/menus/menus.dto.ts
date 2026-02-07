import {
  IsOptional,
  IsNotEmpty,
  IsString,
  IsInt,
} from "class-validator";

export class MenusCreateDto {
  @IsNotEmpty()
  @IsString()
  name:string;

  @IsOptional()
  @IsString()
  path: string | null;

  @IsOptional()
  @IsString()
  icon: string | null;

  @IsNotEmpty()
  @IsInt()
  order: number;

  @IsOptional()
  @IsString()
  id_parent: string | null;
}
