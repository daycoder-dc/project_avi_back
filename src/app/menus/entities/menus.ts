import { SCHEMA_PRIMARY } from "@core/constants";
import { BaseTable } from "@core/database/base";
import { Column, Entity } from "typeorm";

@Entity({ schema: SCHEMA_PRIMARY, name: "menus" })
export class MenusEntity extends BaseTable {
  @Column({ type: "varchar" })
  name: string;

  @Column({ type: "varchar", nullable: true })
  path: string | null;

  @Column({ type: "varchar", nullable: true })
  icon: string | null;

  @Column({ type: "int", default: 0 })
  order: number;

  @Column({ type: "text", nullable: true })
  id_parent: string | null;

  @Column({ type: "bool", nullable: true, default: true })
  is_view: boolean;
}
