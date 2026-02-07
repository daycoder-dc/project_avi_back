import { PublicEndPoint } from "@core/decorator/public_endpoint";
import { Body, Controller, Get, Post, Res } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthLoginDto } from "./auth.dto";
import type { Response } from "express";

@Controller({ path: "auth", version: "1" })
export class AuthController {
  constructor (private readonly auth: AuthService) {}

  @PublicEndPoint()
  @Post("")
  async login(@Body() dto: AuthLoginDto, @Res({ passthrough: true }) res: Response) {
    return this.auth.login(dto, res);
  }

  @Get("logout")
  async logout(@Res({ passthrough: true }) res: Response) {
    return this.auth.logout(res);
  }

  @Get("verify")
  async verify() {
    return this.auth.verify();
  }
}
