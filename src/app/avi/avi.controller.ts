import {
  Controller,
  Query,
  Body,
  Post,
  Get,
} from "@nestjs/common";

import {
  AviSeguimientoDto,
  AviTotalUsersDto
} from "./avi.dto";

import { AviSeguimiento } from "./avi-seguimiento";

@Controller({ path:"avi", version: "1" })
export class AVIController {
  constructor (
    private readonly seguimiento: AviSeguimiento
  ) {}

  @Get("planned")
  async get_planned(@Query("value") value: string) {
    return this.seguimiento.get_planned(value);
  }

  @Get("executed")
  async get_executed(@Query("value") value: string) {
    return this.seguimiento.get_executed(value);
  }

  @Get("effective")
  async get_effective(@Query("value") value: string) {
    return this.seguimiento.get_effective(value);
  }

  @Get("grafico/mapa")
  async get_map(@Query("value") value: string) {
    return this.seguimiento.get_map(value);
  }

  @Post("grafico/metricas")
  async get_metrics_evolutions(@Body() data: AviSeguimientoDto) {
    return this.seguimiento.get_metrics_evolutions(data);
  }

  @Get("grafico/distribucion")
  async get_distribution(@Query("value") value: string) {
    return this.seguimiento.get_distribution(value);
  }

  @Get("attributes")
  async get_attributes() {
    return this.seguimiento.get_attributes();
  }

  @Get("attribute-values")
  async get_attribute_values(@Query("value") value: string) {
    return this.seguimiento.get_attribute_values(value);
  }

  @Post("total-users")
  async get_total_users(@Body() data: AviTotalUsersDto) {
    return this.seguimiento.get_total_users(data);
  }

  @Get("periodos")
  async get_periodos(@Query("value") value: string) {
    return this.seguimiento.get_periodos(value);
  }

  @Get("metricas")
  async get_metricas() {
    return this.seguimiento.get_metricas();
  }

  @Get("funcionarios")
  async get_funcionarios(@Query("value") value: string) {
    return this.seguimiento.get_funcionarios(value);
  }

  @Get("dimensiones-geograficas")
  async get_dimensiones_geograficas() {
    return this.seguimiento.get_dimensiones_geograficas();
  }
}
