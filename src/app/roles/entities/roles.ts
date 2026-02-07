import {
  JoinColumn,
  OneToMany,
  ManyToOne,
  Column,
  Entity,
} from "typeorm";

import { UserEntity } from "@app/users/entities/user";
import { SCHEMA_PRIMARY } from "@core/constants";
import { BaseTable } from "@core/database/base";
import { PermisosEntity } from "./permisos";

@Entity({ name: "roles", schema: SCHEMA_PRIMARY })
export class RolesEntity extends BaseTable {
  @Column({ type: "varchar", nullable: false })
  name: string;

  @Column({ type: "bool", nullable: true, default: true })
  enable: boolean;

  @OneToMany(() => PermisosEntity, (permiso) => permiso.rol, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  permissions: PermisosEntity[];

  @ManyToOne(() => UserEntity, { createForeignKeyConstraints: false, onDelete: "NO ACTION", onUpdate: "NO ACTION" })
  @JoinColumn({ name: "update_by"})
  update_user: UserEntity;
}
