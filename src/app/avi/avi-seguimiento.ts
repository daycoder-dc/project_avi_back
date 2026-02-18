import { AviSeguimientoDto } from "./avi.dto";
import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

@Injectable()
export class AviSeguimiento {
  constructor(
    private readonly dt: DataSource
  ) { }

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

  async get_dimensiones_geograficas() {
    return [
      { value: "barrio", label: "Barrio" },
      { value: "circuito", label: "Circuito" },
      { value: "tecnico", label: "Funcionarios" }
    ];
  }

  async get_indicadores(params: AviSeguimientoDto) {
    let db = await this.dt.query<any[]>(`
      select * from visitas v
      left join clientes c on v.poliza = c.cuenta
      where v.tipo_visita = $1
    `, [params.indicador]);

    if (!params.periodos.includes("0")) {
      db = db.filter(it => params.periodos.includes(it.periodo));
    }

    const officials = {
      data: [... new Set(db.map(it => it.tecnico))]
      .filter(Boolean)
      .sort()
      .map((it:string) => ({
        value: it.trim(),
        label: it.trim().toUpperCase()
      }))
    }

    officials.data.unshift({ value: "0", label: "Total Funcionario" });

    if (!params.funcionarios.includes("0")) {
      db = db.filter(it => params.funcionarios.includes(String(it.tecnico).trim()));
    }

    const executed = db.filter(it => ["Si", "No"].includes(it.ejecutado)).length;
    const effectives = db.filter(it => it.resultado == "Efectiva").length;
    const planned = db.length;

    const build_metrics_dataset = (x_type: "sum" | "mean", x_value?: { s_column: string, s_value: string[] }) => {
      const data = db
        .map(it => {
          let datetime: Date | null = null;

          if (params.periodos.includes("0") || params.periodos.length > 1) {
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
        .reduce((acc, cur) => {
          if (cur.datetime) {
            const key = cur.datetime.toISOString();

            if (!acc[key]) {
              acc[key] = { sum: 0, count: 0 }
            }

            acc[key].sum += cur.x_value;
            acc[key].count += 1;
          }

          return acc;
        }, {});

      if (x_type == "mean") {
        return Object.entries(data).map(([key, data]: any) => ({
          x_time: key,
          y_value: Number((100 * (data["sum"] / data["count"])).toFixed(1))
        }));
      }

      return Object.entries(data).map(([key, data]: any) => ({
        x_time: key,
        y_value: data["sum"]
      }));
    }

    const build_distribution_dataset = (x_value?: { s_column:string, s_value: string[]}) => {
      return Object.entries(
        (x_value ? db.filter(it => x_value.s_value.includes(it[x_value.s_column])) : db)
        .map(it =>  it.barrio)
        .filter(it => !["", null].includes(it))
        .reduce((acc, cur) => {
          if (!acc[cur]) {
            acc[cur] = { value: 0 }
          }

          acc[cur].value += 1;
          return acc;
        }, {})
      )
      .map(([k, v]: any) => ({
        x_value: String(k),
        y_value: Number(v["value"])
      }))
      .sort((a,b) => b.y_value - a.y_value)
      .slice(0, 10);
    }

    const data = {
      indicators: {
        planned: planned,
        executed: executed,
        effectives: effectives,
        operational_effective: 0,
        execution_effective: 0
      },
      officials: officials.data,
      distribution_graphic: {
        x_title: `${params.dimension}`,
        dataset: [
          { x_value: "", y_value: 0 }
        ]
      },
      metrics_graphic: {
        x_title: params.periodos.includes("0") ? "Periodo" : "Día",
        dataset: [
          { x_time: "", y_value: 0 }
        ]
      }
    };

    data.indicators.operational_effective = planned > 0 ? (executed / planned) * 100 : 0;
    data.indicators.execution_effective = executed > 0 ? (effectives / executed) * 100 : 0;

    switch (params.metrica) {
      case "efectivas":
        {
          const filter = { s_column: "resultado", s_value: ["Efectiva"] };
          data.metrics_graphic.dataset = build_metrics_dataset("sum", filter);
          data.distribution_graphic.dataset = build_distribution_dataset(filter);
        }

        break;
      case "planificadas":
        data.metrics_graphic.dataset = build_metrics_dataset("sum");
        break;
      case "ejecutadas":
        {
          const filter = { s_column: "ejecutado", s_value: ["Si", "No"] };
          data.metrics_graphic.dataset = build_metrics_dataset("sum", filter);
        }

        break;
      case "efectividad":
        {
          const filter = { s_column: "resultado", s_value: ["Efectiva"] };
          data.metrics_graphic.dataset = build_metrics_dataset("mean", filter);
        }

        break;
    }

    return data;
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
}
