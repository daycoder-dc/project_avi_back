import { RolesController } from "./roles.controller";
import { PermisosEntity } from "./entities/permisos";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RolesService } from "./roles.service";
import { RolesEntity } from "./entities/roles";
import { JwtService } from "@nestjs/jwt";
import { Module } from "@nestjs/common";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RolesEntity,
      PermisosEntity
    ]),
  ],
  controllers: [
    RolesController
  ],
  providers: [
    RolesService,
    JwtService,
  ]
})
export class RolesModule {}
