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

  async get_dimensiones() {
    return [
      { value: "barrio", label: "Barrio" },
      { value: "circuito", label: "Circuito" },
      { value: "tecnico", label: "Funcionarios" }
    ];
  }

  async get_indicadores(indicador: string) {
    return this.dt.query<any[]>(`
      select * from visitas v
      left join clientes c on v.poliza = c.cuenta
      where v.tipo_visita = $1
    `, [indicador]);
  }
}
