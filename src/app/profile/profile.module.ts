import { ProfileController } from "./profile.controller";
import { ProfileService } from "./profile.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtService } from "@nestjs/jwt";
import { Module } from "@nestjs/common";

@Module({
  imports: [
    TypeOrmModule.forFeature(),
  ],
  controllers: [
    ProfileController
  ],
  providers: [
    ProfileService,
    JwtService
  ]
})
export class ProfileModule {}
