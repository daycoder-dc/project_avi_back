import { AviTotalUsersDto } from "./avi.dto";
import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

@Injectable()
export class AviUniverso {
  constructor(
    private readonly dt: DataSource
  ) { }

  async get_universos() {
    return this.dt.query<any[]>(`select * from base_universo`);
  }

  async get_visitas() {
    return this.dt.query(`select * from visitas`);
  }

  async get_atritubutos() {
    return [
      { label: "Universo", value: "universo" },
      { label: "Zona", value: "zona" },
      { label: "Circuito", value: "circuito" },
      { label: "Bario", value: "barrio" },
      { label: "Subcategoría", value: "subcategoria" },
      { label: "Estado predio", value: "estado_predio" },
      { label: "Inspección", value: "inspeccion" },
      { label: "Tipo medidor", value: "tipo_medidor" },
      { label: "Tipo predio", value: "tipo_predio" },
      { label: "Periodo visita", value: "periodo_visita" },
      { label: "Funcionario", value: "funcionario" },
    ];
  }
}
