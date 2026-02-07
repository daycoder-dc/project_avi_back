import {
  UnauthorizedException,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";

import { UserEntity } from "@app/users/entities/user";
import { TOKEN_NAME } from "@core/constants";
import { EmailService } from "@core/email";
import { AuthLoginDto } from "./auth.dto";
import { JwtService } from "@nestjs/jwt";
import { DataSource } from "typeorm";
import { compareSync } from "bcrypt";
import { Response } from "express";

@Injectable()
export class AuthService {
  constructor (
    private readonly dt: DataSource,
    private readonly jwt: JwtService,
    private readonly email: EmailService
  ) {}

  async login(dto:AuthLoginDto, res: Response) {
    const LOGIN_INTENTS = 3;
    const LOGIN_MINUTES_EXPIRE = 30;
    const isPro = process.env.ENV == "pro";

    const user = await this.dt.getRepository(UserEntity)
      .createQueryBuilder("user")
      .innerJoinAndSelect("user.person", "person", "person.delete = false")
      .addSelect("user.password")
      .where("user.delete = false")
      .andWhere("user.username = :username", { username: dto.username })
      .getOne();

    if (user == null) {
      throw new UnauthorizedException("LOGIN_INVALID");
    }

    let {
      login_failed_attempts,
      login_locked_until,
      id_status
    } = user;

    switch (id_status) {
      case 'INACTIVE':
        throw new ForbiddenException("USER_INACTIVE");
      case 'BLOCKED':
        if (login_locked_until) {
          const target = Date.parse(login_locked_until);
          const current = Date.now();

          if (current <= target) {
            throw new UnauthorizedException("USER_BLOCKED");
          }
        }

        await this.dt.transaction(async (manager) => {
          await manager.update(UserEntity, { id: user.id }, {
            login_failed_attempts: 0,
            login_locked_until: null,
            id_status: "ACTIVE"
          });
        });
    }

    if (!compareSync(dto.password, user.password)) {
      const date = new Date();
      login_failed_attempts++;

      if (login_failed_attempts === LOGIN_INTENTS) {
        date.setMinutes(date.getMinutes() + LOGIN_MINUTES_EXPIRE);
        id_status = "BLOCKED";
        login_locked_until = date.toISOString();

        await this.dt.transaction(async (manager) => {
          await manager.update(UserEntity, { id: user.id }, {
            login_failed_attempts,
            login_locked_until,
            id_status
          });
        });

        this.email.send({
          to: user.person.email,
          subject: "Tu cuenta está bloqueada",
          template: {
            name: "user_blocked",
            local: {
              name: user.person.first_name.split(" ").at(0),
              login_locked_until: date.toLocaleString("ES-CO", { timeZone: "America/Bogota" })
            }
          }
        });

        throw new UnauthorizedException("USER_BLOCKED", {
          cause: { login_failed_attempts }
        });
      }

      await this.dt.transaction(async (manager) => {
        await manager.update(UserEntity, { id: user.id }, {
          login_failed_attempts,
          login_locked_until,
          id_status
        });
      });

      throw new UnauthorizedException("LOGIN_INVALID", {
        cause: { login_failed_attempts, login_locked_until }
      });
    }

    await this.dt.transaction(async (manager) => {
      await manager.update(UserEntity, { id: user.id }, {
        login_failed_attempts: 0,
        login_locked_until: null,
      });
    });

    const token = this.jwt.sign({ sub: user.id });

    res.cookie(TOKEN_NAME, token, {
      maxAge: 8 * 60 * 60 * 1000,
      httpOnly: true,
      secure: isPro,
      sameSite: "lax",
      path: "/"
    });

    return { message: "LOGIN_SUCCESSFULL" };
  }

  async logout(res: Response) {
    res.clearCookie(TOKEN_NAME);
    return { message: "LOGOUT_SUCCESSFULL" };
  }

  async verify() {
    return { status: 1 };
  }
}
