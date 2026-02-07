import {
  ValidateNested,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  IsBoolean,
} from "class-validator";

import { Type } from "class-transformer";

export class RolesMenuCreateDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsBoolean()
  p_view: boolean;

  @IsNotEmpty()
  @IsBoolean()
  p_create: boolean;

  @IsNotEmpty()
  @IsBoolean()
  p_update: boolean;
}

export class RolesCreateDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsArray()
  @Type(() => RolesMenuCreateDto)
  @ValidateNested()
  menus?: RolesMenuCreateDto[] | null;
}

export class RolesUpdateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  enable?: boolean;

  @IsOptional()
  @IsArray()
  @Type(() => RolesMenuCreateDto)
  @ValidateNested()
  menus?: RolesMenuCreateDto []
}
