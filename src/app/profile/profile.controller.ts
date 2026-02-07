import {
  Controller,
  Body,
  Get,
  Put,
} from "@nestjs/common";

import { JWTSession } from "@core/decorator/session";
import { ProfileService } from "./profile.service";
import { ProfileUpdateDto } from "./profile.dto";

@Controller({ path: "profile", version: "1" })
export class ProfileController {
  constructor (private readonly profile: ProfileService) {}

  @Get()
  async get_user(@JWTSession() token: string) {
    return this.profile.get_user(token);
  }

  @Put()
  async update(@Body() data:ProfileUpdateDto, @JWTSession() token: string) {
    return this.profile.update(data, token);
  }

  @Get("roles")
  async get_roles() {
    return this.profile.get_roles();
  }

  @Get("genders")
  async get_genders() {
    return this.profile.get_genders();
  }

  @Get("menus")
  async get_menus(@JWTSession() token: string) {
    return this.profile.get_menus(token);
  }
}
