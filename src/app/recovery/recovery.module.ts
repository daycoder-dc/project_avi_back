import { RecoveryController } from "./recovery.controller";
import { RecoveryService } from "./recovery.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EmailService } from "@core/email";
import { Module } from "@nestjs/common";

@Module({
  imports: [
    TypeOrmModule.forFeature()
  ],
  controllers: [
    RecoveryController
  ],
  providers: [
    RecoveryService,
    EmailService
  ]
})
export class RecoveryModule {}
