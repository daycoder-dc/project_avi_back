import {
  Controller,
  Query,
  Body,
  Post,
  Get,
} from "@nestjs/common";

import { AviSeguimiento } from "./avi-seguimiento";
import { AviTotalUsersDto } from "./avi.dto";
import { AviUniverso } from "./avi-universo";

@Controller({ path:"avi", version: "1" })
export class AVIController {
  constructor (
    private readonly seguimiento: AviSeguimiento,
    private readonly universos: AviUniverso
  ) {}

  @Get("seguimiento/indicadores")
  async get_indicadores(@Query("indicador") indicador:string) {
    return this.seguimiento.get_indicadores(indicador);
  }

  @Get("seguimiento/periodos")
  async get_periodos(@Query("value") value: string) {
    return this.seguimiento.get_periodos(value);
  }

  @Get("seguimiento/metricas")
  async get_metricas() {
    return this.seguimiento.get_metricas();
  }

  @Get("seguimiento/dimensiones")
  async get_dimensiones() {
    return this.seguimiento.get_dimensiones();
  }

  @Get("universos")
  async get_universos() {
    return this.universos.get_universos();
  }

  @Get("universos/atributos")
  async get_atributos() {
    return this.universos.get_atritubutos();
  }

  @Get("universos/visitas")
  async get_visitas() {
    return this.universos.get_visitas();
  }
}
