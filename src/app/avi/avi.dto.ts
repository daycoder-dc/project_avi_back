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
