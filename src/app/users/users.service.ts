import {
  UserCreateDto,
  UserUpdateDto
} from "./users.dto";

import { PersonGenderEntity } from "./entities/person_gender";
import { RolesEntity } from "@app/roles/entities/roles";
import { PersonEntity } from "./entities/person";
import { UserEntity } from "./entities/user";
import { generate } from "generate-password";
import { Injectable } from "@nestjs/common";
import { EmailService } from "@core/email";
import { JwtService } from "@nestjs/jwt";
import { DataSource } from "typeorm";
import { hashSync } from "bcrypt";

@Injectable()
export class UsersService {
  constructor (
    private readonly email: EmailService,
    private readonly jwt: JwtService,
    private readonly dt: DataSource,
  ) {}

  async all() {
    return this.dt.getRepository(UserEntity)
      .createQueryBuilder("u")
      .innerJoinAndSelect("u.person", "p", "p.delete = :delete", { delete: false })
      .leftJoinAndSelect("u.rol", "r", "r.delete = :delete", { delete: false })
      .leftJoinAndSelect("u.status", "s", "s.delete = :delete", { delete: false })
      .leftJoinAndSelect("p.gender", "g", "g.delete = :delete", { delete: false })
      .select([
        "u.id","u.delete","u.update_by","u.create_at","u.update_at",
        "u.username","p.id","p.first_name","p.last_name","p.id_gender",
        "p.email","s.value","s.description","r.name", "u.is_enable",
        "s.severity"
      ])
      .where("u.delete = :delete", { delete: false })
      .orderBy("u.create_at", "ASC")
      .getMany();
  }

  async find(id: string) {
    return this.dt.getRepository(UserEntity)
      .createQueryBuilder("u")
      .innerJoinAndSelect("u.person", "p", "p.delete = :delete", { delete: false })
      .leftJoinAndSelect("u.update_user", "up", "up.delete = :delete", { delete: false })
      .select([
        "u.id","u.update_at", "u.username", "u.id_rol","up.username",
        "p.id", "p.first_name", "p.last_name", "p.id_gender", "p.email"
      ])
      .where("u.delete = :delete", { delete: false })
      .andWhere("u.id = :id", { id })
      .getOne();
  }

  async create(dto: UserCreateDto, token: string | null) {
    const s_user = token ? this.jwt.decode(token) : null;
    let _username = dto.email.split("@").at(0);

    const _users = await this.dt.getRepository(UserEntity)
      .createQueryBuilder("u")
      .where("u.username LIKE :username", { username: `${_username}%` })
      .getCount();

    if (_users > 0) {
      _username = `${_username}${_users + 1}`;
    }

    const _password = generate({
      length: 15,
      numbers: true,
      symbols: "!#$%&?.",
      lowercase: true,
      uppercase: true
    });

    await this.dt.transaction(async (manager) => {
      const _person = await manager.save(PersonEntity, {
        first_name: dto.first_name,
        last_name: dto.last_name,
        id_gender: dto.id_gender,
        email: dto.email,
        create_by: s_user?.sub
      });

      await manager.save(UserEntity, {
        id_person: _person.id,
        id_rol: dto.id_rol,
        username: _username,
        password: hashSync(_password, 10),
        create_by: s_user?.sub
      });
    });

    this.email.send({
      to: dto.email,
      subject: "Tus credenciales",
      template: {
        name: "credentials",
        local: {
          name: dto.first_name.split(" ").at(0),
          user: _username,
          pass: _password
        }
      }
    });

    return { message: "USER_CREATED" };
  }

  async update(id: string, data: UserUpdateDto, token: string | null) {
    const s_user = token ? this.jwt.decode(token) : null;
    const date = new Date();

    await this.dt.transaction(async (manager) => {
      await manager.update(UserEntity, { id }, {
        id_rol: data?.id_rol,
        id_status: data?.id_status,
        is_enable: data?.is_enable,
        update_at: date.toISOString(),
        update_by: s_user?.sub
      });

      if (typeof data.id_person == "string") {
        await manager.update(PersonEntity, { id: data.id_person }, {
          first_name: data?.first_name,
          last_name: data?.last_name,
          id_gender: data?.id_gender,
          email: data?.email
        });
      }
    });

    if (typeof data?.id_status == "string") {
      const user = await this.dt.getRepository(UserEntity)
        .createQueryBuilder("u")
        .leftJoinAndSelect("u.status", "s", "s.delete = :delete", { delete: false })
        .where("u.delete = :delete", { delete: false })
        .andWhere("u.id = :id", { id })
        .getOne();

      return user?.status;
    }

    return { message: "USER_UPDATED" };
  }

  async roles() {
    return this.dt.getRepository(RolesEntity)
      .createQueryBuilder("r")
      .select(["r.id", "r.name"])
      .where("r.delete = :delete", { delete: false })
      .andWhere("r.enable = :enable", { enable: true })
      .getMany();
  }

  async genders() {
    return this.dt.getRepository(PersonGenderEntity)
      .createQueryBuilder("p")
      .select(["p.value", "p.description"])
      .where("p.delete = :delete",{ delete: false })
      .getMany();
  }
}
