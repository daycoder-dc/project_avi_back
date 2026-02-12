import { Injectable } from "@nestjs/common";
import { AviTotalUsersDto } from "./avi.dto";
import { DataSource } from "typeorm";

@Injectable()
export class AviUniverso {
  constructor(
    private readonly dt: DataSource
  ) { }

  async get_attributes() {
    return [
      { name: "Universo", value: "universo" },
      { name: "Zona", value: "zona" },
      { name: "Circuito", value: "circuito" },
      { name: "Bario", value: "barrio" },
      { name: "Subcategoría", value: "subcategoria" },
      { name: "Estado predio", value: "estado_predio" },
      { name: "Inspección", value: "inspeccion" },
      { name: "Tipo medidor", value: "tipo_medidor" },
      { name: "Tipo predio", value: "tipo_predio" },
      { name: "Periodo visita", value: "periodo_visita" },
      { name: "Funcionario", value: "funcionario" },
    ];
  }

  async get_attribute_values(value: string) {
    const columns = await this.dt.query<{ column_name: string }[]>(`
      select
        column_name
      from information_schema."columns"
      where table_name = 'base_universo'
    `);

    const column_exists = columns.some(it => it.column_name == value);

    if (!column_exists) {
      return [];
    }

    return this.dt.query<any[]>(`
      select distinct
        ${value} as "name"
      from base_universo
    `);
  }

  async get_total_users(data: AviTotalUsersDto) {
    const columns = await this.dt.query<{ column_name: string }[]>(`
      select
        column_name
      from information_schema."columns"
      where table_name = 'base_universo'
    `);

    const column_exists = columns.some(it => it.column_name == data.attr);

    if (!column_exists) {
      return { total: 0 };
    }

    const sql = `select count(${data.attr}) as total from base_universo`;

    if (data.values.length > 0) {
      const _values = data.values.map(it => `'${it}'`).join(",");
      const dts = await this.dt.query<{ total: string }[]>(
        `${sql} where universo in (${_values})
      `);

      return { total: dts[0]?.total || 0 };
    }

    const dts = await this.dt.query<{ total: string }[]>(sql);
    return { total: dts[0]?.total || 0 };
  }
}
