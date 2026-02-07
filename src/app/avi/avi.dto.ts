import { IsArray, IsNotEmpty, IsString } from "class-validator";

export class AVITotalUsersDto {
  @IsNotEmpty()
  @IsString()
  attr: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  values: string[];
}
