import { MenusEntity } from "./entities/menus";
import { MenusCreateDto } from "./menus.dto";
import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

@Injectable()
export class MenusService {
  constructor (
    private readonly dt: DataSource
  ) {}

  async all() {
    const menus = await this.dt.getRepository(MenusEntity)
      .createQueryBuilder("menu")
      .where("menu.delete = false")
      .getMany()

    return menus;
  }

  async create(data:MenusCreateDto) {
    await this.dt.transaction(async (manager) => {
      await manager.save(MenusEntity, {
        name: data.name,
        path: data.path,
        icon: data.icon,
        order: data.order,
        id_parent: data.id_parent
      });
    });

    return { message: "MENU_CREATED" };
  }
}
