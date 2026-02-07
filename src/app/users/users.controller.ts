import {
  Controller,
  Param,
  Patch,
  Body,
  Get,
  Post
} from "@nestjs/common";

import {
  UserCreateDto,
  UserUpdateDto
} from "./users.dto";

import { JWTSession } from "@core/decorator/session";
import { UsersService } from "./users.service";

@Controller({ path: "users", version: "1" })
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  async all() {
    return this.users.all();
  }

  @Get("roles")
  async roles() {
    return this.users.roles();
  }

  @Get("genders")
  async genders() {
    return this.users.genders();
  }

  @Get(":id")
  async find(@Param("id") id: string) {
    return this.users.find(id);
  }

  @Post()
  async create(@Body() dto: UserCreateDto, @JWTSession() token: string | null) {
    return this.users.create(dto, token);
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() data: UserUpdateDto, @JWTSession() token: string | null) {
    return this.users.update(id, data, token);
  }
}
