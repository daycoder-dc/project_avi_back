import { AVIController } from "./avi.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AVIService } from "./avi.service";
import { Module } from "@nestjs/common";

@Module({
  imports: [
    TypeOrmModule
  ],
  controllers: [
    AVIController
  ],
  providers: [
    AVIService
  ]
})
export class AVIModule {}
