import {
  BadRequestException,
  Injectable,
} from "@nestjs/common";

import {
  RolesCreateDto,
  RolesUpdateDto
} from "./roles.dto";

import { PermisosEntity } from "./entities/permisos";
import { RolesEntity } from "./entities/roles";
import { JwtService } from "@nestjs/jwt";
import { DataSource } from "typeorm";

@Injectable()
export class RolesService {
  constructor (
    private readonly dt: DataSource,
    private readonly jwt: JwtService,
  ) {}

  async all() {
    return this.dt.getRepository(RolesEntity)
      .createQueryBuilder("r")
      .where("r.delete = :delete", { delete: false })
      .orderBy("r.create_at", "ASC")
      .getMany();
  }

  async find(id:string) {
    return this.dt.getRepository(RolesEntity)
      .createQueryBuilder("r")
      .leftJoinAndSelect("r.permissions", "p", "p.delete = :delete", { delete: false })
      .leftJoinAndSelect("r.update_user", "up", "up.delete = :delete", { delete: false })
      .select([
          "r.id","r.delete","r.create_by","r.create_at","r.update_at",
          "r.name","r.enable","p.id_menu","p.p_view","p.p_create","p.p_update",
          "up.username"
      ])
      .where("r.delete = :delete", { delete: false })
      .andWhere("r.id = :id", { id })
      .getOne();
  }

  async create(data:RolesCreateDto, token:string | null) {
    const s_user = token ? this.jwt.decode(token) : null;

    // Verifica la existencia del rol
    {
      const rol = await this.dt.getRepository(RolesEntity)
        .existsBy({
          delete: false,
          name: data.name
        });

      if (rol) {
        throw new BadRequestException("ROL_NAME_EXISTS");
      }
    }

    // Registrar rol
    await this.dt.transaction(async (manager) => {
      const rol = await manager.save(RolesEntity, {
        name: data.name,
        create_by: s_user?.sub,
      });

      if (!data.menus) return;

      for (const item of data.menus) {
        await manager.save(PermisosEntity, {
          id_rol: rol.id,
          id_menu: item.id,
          p_view: item.p_view,
          p_create: item.p_create,
          p_update: item.p_update,
          create_by:s_user?.sub,
        });
      }
    });

    return { message: "ROLE CREATED" };
  }

  async update(id: string, data:RolesUpdateDto, token:string | null) {
    const s_user = token ? this.jwt.decode(token) : null;
    const date = new Date();

    // Validacion nombre de rol
    {
      if (data.name) {
        const repo = this.dt.getRepository(RolesEntity);

        const rol_exists = await repo.createQueryBuilder("r")
          .where("r.id = :id", { id })
          .getExists();

        if (!rol_exists) {
          throw new BadRequestException("ROL_NOT_EXISTS");
        }

        const rol_name_exists = await repo.createQueryBuilder("r")
          .where("r.id != :id", { id })
          .andWhere("r.name = :name", { name: data.name })
          .getExists();

        if (rol_name_exists) {
          throw new BadRequestException("ROL_NAME_EXISTS");
        }
      }
    }

    // Actalización
    await this.dt.transaction(async (manager) => {
      await manager.update(RolesEntity, { id }, {
        name: data.name,
        enable: data.enable,
        update_by: s_user?.sub,
        update_at: date.toISOString()
      });

      if (data.menus === undefined) return;

      for (const item of data.menus) {
        await manager.update(PermisosEntity, { id_menu: item.id, id_rol: id }, {
          p_view: item.p_view,
          p_create: item.p_create,
          p_update: item.p_update,
          update_by: s_user?.sub,
          update_at: date.toISOString(),
        });
      }
    });

    return { message: "ROLE_UPDATED" };
  }
}
