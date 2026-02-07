import { Body, Controller, Get, Post } from "@nestjs/common";
import { MenusService } from "./menus.service";
import { MenusCreateDto } from "./menus.dto";

@Controller({ path: "menus", version: "1" })
export class MenusController {
  constructor (private readonly menus:MenusService) {}

  @Get()
  async all() {
    return this.menus.all();
  }

  @Post()
  async create(@Body() data:MenusCreateDto) {
    return this.menus.create(data);
  }
}
