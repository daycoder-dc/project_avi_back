import { BadRequestException, Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { AVITotalUsersDto } from "./avi.dto";

@Injectable()
export class AVIService {
  constructor (
    private readonly dt: DataSource
  ) {}

  async get_planned(value: string) {
    const reusults = await this.dt.query<object[]>(`
      select
        count(*) as value
      from visitas v
      left join clientes c on v.poliza = c.cuenta
      where v.tipo_visita = $1;
    `, [value]);

    return reusults.at(0) || 0;
  }

  async get_executed(value: string) {
    const results = await this.dt.query<object[]>(`
      select
        count(*) as value
      from visitas v
      left join clientes c on v.poliza = c.cuenta
      where v.tipo_visita = $1 and v.ejecutado != '';
    `, [value]);

    return results.at(0) || 0;
  }

  async get_effective(value: string) {
    const results = await this.dt.query<object[]>(`
      select
        count(*) as value
      from visitas v
      left join clientes c on v.poliza = c.cuenta
      where v.tipo_visita = $1 and v.resultado = $2;
    `, [value, 'Efectiva']);

    return results.at(0) || 0;
  }

  async get_map(value: string) {
    return this.dt.query<object[]>(`
      select
        v.resultado, v.poliza, v.fecha_visita, c.latitud,
        c.longitud, c.barrio, v.tecnico, c.circuito
      from visitas v
      join clientes c on v.poliza = c.cuenta
      where v.tipo_visita = $1;
    `, [value]);
  }

  async get_metrics_evolutions(value: string) {
    return this.dt.query(`
      select
        to_char(v.fecha_visita, 'YYYY-MM') as mes,
        count(*) as visitas
      from visitas v
      where v.tipo_visita = $1 and v.resultado = $2
      group by "mes"
      order by "mes" asc;
    `, [value, 'Efectiva']);
  }

  async get_distribution(value: string) {
    return this.dt.query(`
      select
        c.barrio, count(v.*) as visitas
      from clientes c
      left join visitas v on v.poliza = c.cuenta
      where v.tipo_visita = $1 and v.resultado = $2
      group by c.barrio
      order by visitas desc
      limit 10;
    `, [value, 'Efectiva']);
  }

  async get_attributes() {
    return [
      { name:"Universo", value:"universo" },
      { name:"Zona", value:"zona" },
      { name:"Circuito", value:"circuito" },
      { name:"Bario", value:"barrio" },
      { name:"Subcategoría", value:"subcategoria" },
      { name:"Estado predio", value:"estado_predio" },
      { name:"Inspección", value:"inspeccion" },
      { name:"Tipo medidor", value:"tipo_medidor" },
      { name:"Tipo predio", value:"tipo_predio" },
      { name:"Periodo visita", value:"periodo_visita" },
      { name:"Funcionario", value:"funcionario" },
    ]
  }

  async get_attribute_values(value: string) {
    const columns = await this.dt.query<{column_name:string}[]>(`
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

  async get_total_users(data: AVITotalUsersDto) {
    const columns = await this.dt.query<{column_name:string}[]>(`
      select
        column_name
      from information_schema."columns"
      where table_name = 'base_universo'
    `);

    const column_exists = columns.some(it => it.column_name == data.attr);

    if (!column_exists) {
      return { total: 0};
    }

    const sql = `select count(${data.attr}) as total from base_universo`;

    if (data.values.length > 0) {
      const _values = data.values.map(it => `'${it}'`).join(",");
      const dts = await this.dt.query<{total:string}[]>(
        `${sql} where universo in (${_values})
      `);

      return { total: dts[0]?.total || 0 };
    }

    const dts = await this.dt.query<{total:string}[]>(sql);
    return { total: dts[0]?.total || 0 };
  }
}
