import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

@Injectable()
export class AviUniverso {
  constructor (
    private readonly dt: DataSource
  ) {}
}
