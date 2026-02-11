import {
  AviSeguimientoDto,
  AviTotalUsersDto
} from "./avi.dto";

import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

@Injectable()
export class AviSeguimiento {
  constructor(
    private readonly dt: DataSource
  ) { }

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
      where v.tipo_visita = $1 and v.ejecutado in ('Si', 'No');
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
        c.longitud, c.barrio, v.tecnico, c.circuito,
        v.ejecutado, v.periodo
      from visitas v
      left join clientes c on v.poliza = c.cuenta
      where v.tipo_visita = $1;
    `, [value]);
  }

  async get_metrics_evolutions(params: AviSeguimientoDto) {
    let db = await this.dt.query<any[]>(`
      select * from visitas v
      left join clientes c on v.poliza = c.cuenta
      where v.tipo_visita = $1
    `, [params.tipo_seguimiento]);

    if (!params.tipo_periodos.includes("0")) {
      db = db.filter(it => params.tipo_periodos.includes(it.periodo));
    }

    const build_dataset = (data: any[], x_type: "sum" | "mean", x_value?: { s_column: string, s_value: string[] }) => {
      const get_datatimes = {
        data: data
          .map(it => {
            let datetime: Date | null = null;

            if (params.tipo_periodos.includes("0")) {
              const date = String(it.periodo).match(/^(\d{4})(\d{2})$/);
              datetime = date ? new Date(parseInt(date[1]), parseInt(date![2]) - 1) : null;
            } else {
              datetime = new Date(it.fecha_visita);
            }

            return {
              datetime,
              x_value: x_value ? Number(x_value.s_value.includes(it[x_value.s_column])) : 1
            }
          })
          .filter(it => it.datetime != null)
          .sort((a, b) => a.datetime!.getTime() - b.datetime!.getTime())
      };

      const group_datatimes = {
        data: get_datatimes.data
          .reduce((acc, cur) => {
            if (cur.datetime) {
              const key = cur.datetime.toLocaleDateString("en-US").replace(/\//g, "-");

              if (!acc[key]) {
                acc[key] = { sum: 0, count: 0 }
              }

              acc[key].sum += cur.x_value;
              acc[key].count += 1;
            }

            return acc;
          }, {})
      };

      if (x_type == "mean") {
        return Object.entries(group_datatimes.data).map(([key, data]: any) => ({
          x_time: key,
          y_value: Number((100 * (data["sum"] / data["count"])).toFixed(1))
        }));
      }

      return Object.entries(group_datatimes.data).map(([key, data]: any) => ({
        x_time: key,
        y_value: data["sum"]
      }));
    }

    let data = {
      x_title: params.tipo_periodos.includes("0") ? "Periodo" : "Día",
      dataset: [
        { x_time: "", y_value: 0 }
      ]
    };

    if (params.tipo_metrica == "efectivas") {
      data.dataset = build_dataset(db, "sum", {
        s_column: "resultado",
        s_value: ["Efectiva"]
      });
    }
    else if (params.tipo_metrica == "planificadas") {
      data.dataset = build_dataset(db, "sum");
    }
    else if (params.tipo_metrica == "ejecutadas") {
      data.dataset = build_dataset(db, "sum", {
        s_column: "ejecutado",
        s_value: ["Si", "No"]
      });
    }
    else if (params.tipo_metrica == "efectividad") {
      data.dataset = build_dataset(db, "mean", {
        s_column: "resultado",
        s_value: ["Efectiva"]
      });
    }

    return data;
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
    ]
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

  async get_periodos(value: string) {
    const months = [
      "Enero", "Febrero", "Marzo", "Abril",
      "Mayo", "Junio", "Julio", "Agosto",
      "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const dts = await this.dt.query<{ periodo: string }[]>(`
      select distinct
        v.periodo
      from visitas v
      where v.tipo_visita = $1
      order by v.periodo desc
      limit 15;
    `, [value]);

    const data = dts.map(it => {
      const year = it.periodo.substring(0, 4);
      const month = parseInt(it.periodo.substring(4));

      return {
        value: it.periodo,
        label: `${months[month - 1]} de ${year}`
      };
    });

    data.unshift({ value: "0", label: "Total proyecto" });

    return data;
  }

  async get_metricas() {
    return [
      { value: "planificadas", label: "Planificadas" },
      { value: "ejecutadas", label: "Ejecuadas" },
      { value: "efectivas", label: "Efectivas" },
      { value: "efectividad", label: "% Efectividad" }
    ];
  }

  async get_funcionarios(value: string) {
    const dts = await this.dt.query<{ tecnico: string }[]>(`
      select distinct
        v.tecnico
      from visitas v
      where v.tipo_visita = $1 and v.tecnico != '';
    `, [value]);

    const data = dts.map(it => {
      const value = it.tecnico.trim();
      const label = it.tecnico.trim().toUpperCase();
      return { value, label };
    });

    data.unshift({ value: "0", label: "Total Funcionario" });
    return data;
  }

  async get_dimensiones_geograficas() {
    return [
      { value: "barrio", label: "Barrio" },
      { value: "circuito", label: "Circuito" },
      { value: "tecnico", label: "Funcionarios" }
    ];
  }
}
