import { MenusController } from "./menus.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MenusService } from "./menus.service";
import { MenusEntity } from "./entities/menus";
import { Module } from "@nestjs/common";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MenusEntity
    ])
  ],
  controllers: [
    MenusController
  ],
  providers: [
    MenusService
  ],
})
export class MenusModule {}
