import {
  IsOptional,
  IsNotEmpty,
  IsBoolean,
  IsString,
  IsEmail,
} from "class-validator";

export class UserCreateDto {
  @IsOptional()
  @IsString()
  id_rol: string;

  @IsNotEmpty()
  @IsString()
  first_name: string;

  @IsNotEmpty()
  @IsString()
  last_name: string;

  @IsOptional()
  @IsString()
  id_gender: string | null;

  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class UserUpdateDto {
  @IsOptional()
  @IsString()
  id_person?: string;

  @IsOptional()
  @IsString()
  id_rol?: string;

  @IsOptional()
  @IsString()
  id_status?:string;

  @IsOptional()
  @IsBoolean()
  is_enable?:boolean;

  @IsOptional()
  @IsString()
  first_name?: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  @IsOptional()
  @IsString()
  id_gender?: string;

  @IsOptional()
  @IsEmail()
  email?: string ;
}
