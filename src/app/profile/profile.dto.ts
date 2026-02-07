import {
  IsOptional,
  IsString,
  IsEmail,
  IsNotEmpty,
} from "class-validator";

export class ProfileUpdateDto {
  @IsNotEmpty()
  @IsString()
  id_person: string;

  @IsOptional()
  @IsString()
  password?:string;

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
