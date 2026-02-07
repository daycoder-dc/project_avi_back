import {
  UnauthorizedException,
  BadRequestException,
  Injectable,
} from "@nestjs/common";

import {
  compareSync,
  hashSync
} from "bcrypt";

import { PersonGenderEntity } from "@app/users/entities/person_gender";
import { PersonEntity } from "@app/users/entities/person";
import { RolesEntity } from "@app/roles/entities/roles";
import { UserEntity } from "@app/users/entities/user";
import { ProfileUpdateDto } from "./profile.dto";
import { JwtService } from "@nestjs/jwt";
import { DataSource } from "typeorm";

@Injectable()
export class ProfileService {
  constructor (
    private readonly dt: DataSource,
    private readonly jwt: JwtService
  ) {}

  async get_user(token: string) {
    const s_user = this.jwt.decode(token);

    return this.dt.getRepository(UserEntity)
      .createQueryBuilder("u")
      .leftJoinAndSelect("u.update_user", "up", "up.delete = :delete", { delete: false })
      .leftJoinAndSelect("u.person", "p", "p.delete = :delete", { delete: false })
      .select([
        "u.username", "u.id_rol", "up.username", "u.update_at",
        "p.id", "p.first_name", "p.last_name", "p.id_gender", "p.email"
      ])
      .where("u.delete = :delete", { delete: false })
      .andWhere("u.id = :id", { id: s_user?.sub })
      .getOne();
  }

  async update(data: ProfileUpdateDto, token: string) {
    const s_user = this.jwt.decode(token);
    const date = new Date();

    const user = await this.dt.getRepository(UserEntity)
      .createQueryBuilder("u")
      .addSelect("u.password")
      .where("u.delete = :delete", { delete: false })
      .andWhere("u.id = :id", { id: s_user.sub })
      .getOne();

    if (!user) {
      throw new UnauthorizedException("PROFILE_NOT_VALID");
    }

    if (data.password) {
      if (compareSync(data.password, user.password)) {
        throw new BadRequestException("PROFILE_PASS_NOT_VALID");
      }
    }

    await this.dt.transaction(async (manager) => {
      if (data.password) {
        await manager.update(UserEntity, { id: s_user.sub }, {
          password: hashSync(data.password, 10),
          update_at: date.toISOString(),
          update_by: s_user.sub
        });
      }

      await manager.update(PersonEntity, { id: data.id_person }, {
        first_name: data?.first_name,
        last_name: data?.last_name,
        id_gender: data?.id_gender,
        email: data?.email
      });
    });

    return { message: "PROFILE_UPDATE" };
  }

  async get_roles() {
    return this.dt.getRepository(RolesEntity)
      .createQueryBuilder("r")
      .select(["r.id", "r.name"])
      .where("r.delete = :delete", { delete: false })
      .andWhere("r.enable = :enable", { enable: true })
      .getMany();
  }

  async get_genders() {
    return this.dt.getRepository(PersonGenderEntity)
      .createQueryBuilder("p")
      .select(["p.value", "p.description"])
      .where("p.delete = :delete",{ delete: false })
      .getMany();
  }

  async get_menus(token: string) {
    type Menu = {
      id: string,
      name: string,
      path: string | null,
      icon: string | null,
      order: number,
      id_parent: string | null,
      is_view: boolean,
      p_view: boolean,
      p_create: boolean,
      p_update: boolean
    };

    const s_user = this.jwt.decode(token);
    const user_menu = await this.dt.getRepository(UserEntity)
      .createQueryBuilder("u")
      .innerJoinAndSelect("u.rol", "r", "r.delete = :delete", { delete: false })
      .innerJoinAndSelect("r.permissions", "p", "p.delete = :delete", { delete: false })
      .innerJoinAndSelect("p.menu", "m", "m.delete = :delete", { delete: false })
      .where("u.id = :id", { id: s_user.sub })
      .andWhere("r.enable = :enable", { enable: true })
      .getOne();

    const menus: Menu[] = [];

    for (const permiso of user_menu?.rol?.permissions || []) {
      if(permiso.menu.is_view == false) {
        permiso.p_view = (user_menu?.rol?.permissions || [])
          .filter(it => it.menu.id_parent == permiso.id_menu)
          .some(it => it.p_view == true);
      }

      if (permiso.p_view) {
        menus.push({
          id: permiso.id_menu,
          name: permiso.menu.name,
          path: permiso.menu.path,
          icon: permiso.menu.icon,
          order: permiso.menu.order,
          id_parent: permiso.menu.id_parent,
          is_view: permiso.menu.is_view,
          p_view: permiso.p_view,
          p_create: permiso.p_create,
          p_update: permiso.p_update
        });
      }
    }

    return menus;
  }
}
