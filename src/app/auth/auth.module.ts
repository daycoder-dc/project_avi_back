import { AuthController } from "./auth.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtConfig } from "@core/jwt/config";
import { AuthService } from "./auth.service";
import { EmailService } from "@core/email";
import { Module } from "@nestjs/common";

@Module({
  imports: [
    TypeOrmModule.forFeature(),
    JwtConfig
  ],
  controllers: [
    AuthController
  ],
  providers: [
    AuthService,
    EmailService
  ]
})
export class AuthModule {}
