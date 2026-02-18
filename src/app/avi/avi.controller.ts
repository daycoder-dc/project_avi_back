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
import { AviUniverso } from "./avi-universo";

@Controller({ path:"avi", version: "1" })
export class AVIController {
  constructor (
    private readonly seguimiento: AviSeguimiento,
    private readonly universos: AviUniverso
  ) {}

  @Post("seguimiento/indicadores")
  async get_indicadores(@Body() data: AviSeguimientoDto) {
    return this.seguimiento.get_indicadores(data);
  }

  @Get("seguimiento/mapa")
  async get_map(@Query("value") value: string) {
    return this.seguimiento.get_map(value);
  }

  @Get("seguimiento/periodos")
  async get_periodos(@Query("value") value: string) {
    return this.seguimiento.get_periodos(value);
  }

  @Get("seguimiento/metricas")
  async get_metricas() {
    return this.seguimiento.get_metricas();
  }

  @Get("seguimiento/dimensiones-geograficas")
  async get_dimensiones_geograficas() {
    return this.seguimiento.get_dimensiones_geograficas();
  }

  @Get("universos/atributos")
  async get_attributes() {
    return this.universos.get_attributes();
  }

  @Get("universos/valores-atributos")
  async get_attribute_values(@Query("value") value: string) {
    return this.universos.get_attribute_values(value);
  }

  @Post("universos/total-usuarios")
  async get_total_users(@Body() data: AviTotalUsersDto) {
    return this.universos.get_total_users(data);
  }
}
