import {
  Controller,
  Param,
  Patch,
  Post,
  Body,
  Get,
} from "@nestjs/common";

import {
  RolesCreateDto,
  RolesUpdateDto,
} from "./roles.dto";

import { RolesService } from "./roles.service";
import { JWTSession } from "@core/decorator/session";

@Controller({ path: "roles", version: "1" })
export class RolesController {
  constructor (private readonly roles: RolesService) {}

  @Get()
  async all() {
    return this.roles.all();
  }

  @Get(":id")
  async find(@Param("id") id: string) {
    return this.roles.find(id);
  }

  @Post()
  async create(@Body() data:RolesCreateDto, @JWTSession() token: string | null) {
    return this.roles.create(data, token);
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() data:RolesUpdateDto, @JWTSession() token: string | null) {
    return this.roles.update(id, data, token);
  }
}
