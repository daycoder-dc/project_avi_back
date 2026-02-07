import { SCHEMA_PRIMARY } from "@core/constants";
import { BaseTable } from "@core/database/base";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { RolesEntity } from "./roles";
import { MenusEntity } from "@app/menus/entities/menus";

@Entity({ name: "permissions", schema: SCHEMA_PRIMARY })
export class PermisosEntity extends BaseTable {
  @Column({ type: "text", nullable: false })
  id_rol: string;

  @Column({ type: "text", nullable: false })
  id_menu: string;

  @Column({ type: "bool", nullable: true, default: false })
  p_view: boolean;

  @Column({ type: "bool", nullable: true, default: false })
  p_create: boolean;

  @Column({ type: "bool", nullable: true, default: false })
  p_update: boolean;

  @ManyToOne(() => RolesEntity, { onDelete: "NO ACTION", onUpdate: "NO ACTION" })
  @JoinColumn({ name: "id_rol" })
  rol: RolesEntity;

  @ManyToOne(() => MenusEntity, { onDelete: "NO ACTION", onUpdate: "NO ACTION" })
  @JoinColumn({ name: "id_menu" })
  menu: MenusEntity;
}
