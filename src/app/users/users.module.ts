import { PersonGenderEntity } from "./entities/person_gender";
import { UserStatusEntity } from "./entities/user_status";
import { UsersController } from "./users.controller";
import { PersonEntity } from "./entities/person";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersService } from "./users.service";
import { UserEntity } from "./entities/user";
import { EmailService } from "@core/email";
import { JwtService } from "@nestjs/jwt";
import { Module } from "@nestjs/common";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PersonGenderEntity,
      UserStatusEntity,
      PersonEntity,
      UserEntity
    ])
  ],
  controllers: [
    UsersController
  ],
  providers: [
    UsersService,
    EmailService,
    JwtService
  ]
})
export class UsersModule {}
