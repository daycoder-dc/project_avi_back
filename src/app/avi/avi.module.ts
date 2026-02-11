import { AviSeguimiento } from "./avi-seguimiento";
import { AVIController } from "./avi.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AviUniverso } from "./avi-universo";
import { Module } from "@nestjs/common";

@Module({
  imports: [
    TypeOrmModule
  ],
  controllers: [
    AVIController
  ],
  providers: [
    AviSeguimiento,
    AviUniverso
  ]
})
export class AVIModule {}
