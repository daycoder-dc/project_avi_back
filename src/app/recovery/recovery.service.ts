import {
  UnauthorizedException,
  BadRequestException,
  Injectable,
} from "@nestjs/common";

import {
  RecoveryEmailVerifyDto,
  RecoveryCodeVerifyDto,
  RecoveryPasswordDto
} from "./recovery.dto";

import { UserEntity } from "@app/users/entities/user";
import { compareSync, hashSync } from "bcrypt";
import { EmailService } from "@core/email";
import randomNumber from "random-number";
import { DataSource } from "typeorm";

@Injectable()
export class RecoveryService {
  constructor (
    private readonly dt: DataSource,
    private readonly email: EmailService,
  ) {}

  async verify_email(data:RecoveryEmailVerifyDto) {
    const user = await this.dt.getRepository(UserEntity)
      .createQueryBuilder("usr")
      .innerJoinAndSelect("usr.person", "person")
      .where("usr.delete = false and person.email = :email", { email: data.email })
      .getOne();

    if (!user) {
      throw new UnauthorizedException("EMAIL_NOT_VALID");
    }

    const {
      recovery_filed_attempts,
      recovery_locked_until,
    } = user;

    if (recovery_locked_until) {
      if (recovery_filed_attempts == 3) {
        const target = Date.parse(recovery_locked_until);
        const current = Date.now();

        if (target > current) {
          throw new UnauthorizedException("RECOVERY_BLOCKED");
        }
      }
    }

    const code = randomNumber({min: 1111, max: 9999, integer: true });
    const time = new Date();

    await this.dt.transaction(async (manager) => {
      await manager.update(UserEntity, { id: user.id }, {
        recovery_code: code.toString(),
        recovery_timestamp: time.toISOString(),
        recovery_filed_attempts: 0,
        recovery_locked_until: null,
        recovery_allowed: false
      });
    });

    this.email.send({
      to: user.person.email,
      subject: "Restablecimiento de contraseña",
      template: {
        name: "recovery_code",
        local: {
          name: user.person.first_name.split(" ").at(0),
          code: code.toString()
        }
      }
    });

    return { message: "EMAIL_VERIFY", id: user.id };
  }

  async verify_code(data:RecoveryCodeVerifyDto) {
    const user = await this.dt.getRepository(UserEntity)
      .createQueryBuilder("usr")
      .innerJoinAndSelect("usr.person", "person")
      .where("usr.delete = false")
      .andWhere("usr.id = :id", { id: data.id })
      .getOne();

    if (!user) {
      throw new UnauthorizedException("EMAIL_NOT_VALID");
    }

    let {
      recovery_filed_attempts,
      recovery_timestamp,
      recovery_code
    } = user;

    if (recovery_timestamp) {
      const time_target = 15 * 60 * 1000;
      const time_current = Date.now();
      const time_init = Date.parse(recovery_timestamp);

      if ((time_current - time_init) >= time_target) {
        throw new UnauthorizedException("RECOVERY_CODE_EXPIRED");
      }
    }

    if (recovery_filed_attempts == 3) {
      this.email.send({
        to: user.person.email,
        subject: "Restablecimiento de contraseña",
        template: {
          name: "recovery_blocked",
          local: {
            name: user.person.first_name.split(" ").at(0)
          }
        }
      });

      throw new UnauthorizedException("RECOVERY_BLOCKED");
    }

    if (recovery_code != data.code) {
      const date = new Date();
      date.setMinutes(date.getMinutes() + 5);

      recovery_filed_attempts++;

      await this.dt.transaction(async (manager) => {
        if (recovery_filed_attempts == 3) {
          await manager.update(UserEntity, { id: user.id }, {
            recovery_filed_attempts,
            recovery_locked_until: date.toISOString()
          });
        }
        else {
          await manager.update(UserEntity, { id: user.id }, {
            recovery_filed_attempts,
          });
        }
      });

      throw new BadRequestException("RECOVERY_CODE_NOT_VALID");
    }

    await this.dt.transaction(async (manager) => {
      await manager.update(UserEntity, { id: user.id }, {
        recovery_code: null,
        recovery_filed_attempts: 0,
        recovery_locked_until: null,
        recovery_timestamp: null,
        recovery_allowed: true
      });
    });

    return { message: "RECOVERY_CODE_SUCCESSFULL" };
  }

  async update_password(data:RecoveryPasswordDto) {
    const user = await this.dt.getRepository(UserEntity)
      .createQueryBuilder("user")
      .innerJoinAndSelect("user.person", "person")
      .addSelect("user.password")
      .where("user.delete = false")
      .andWhere("user.id = :id", { id: data.id })
      .getOne();

    if (!user) {
      throw new UnauthorizedException("RECOVERY_INVALID");
    }

    if (!user.recovery_allowed) {
      throw new UnauthorizedException("RECOVERY_NOT_ALLOWED");
    }

    if (compareSync(data.new_password, user.password)) {
      throw new BadRequestException("RECOVERY_PASS_USED");
    }

    await this.dt.transaction(async (manager) => {
      await manager.update(UserEntity, { id: user.id }, {
        password: hashSync(data.new_password, 10),
        recovery_allowed: false
      });
    });

    const date = new Date();

    this.email.send({
      to: user.person.email,
      subject: "Recuperación de contraseña",
      template: {
        name: "recovery_exito",
        local: {
          name: user.person.first_name.split(" ").at(0),
          date: date.toLocaleString("ES-CO", { timeZone: "America/Bogota" })
        }
      }
    });
  }
}
