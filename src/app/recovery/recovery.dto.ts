import {
  IsNumberString,
  IsNotEmpty,
  MaxLength,
  IsString,
  IsEmail,
} from "class-validator";

export class RecoveryEmailVerifyDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
}

export class RecoveryCodeVerifyDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  @IsNumberString()
  @MaxLength(4)
  code: string;
}

export class RecoveryPasswordDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  new_password: string;
}
