import {
  JoinColumn,
  ManyToOne,
  OneToOne,
  Column,
  Entity,
} from "typeorm";

import { RolesEntity } from "@app/roles/entities/roles";
import { UserStatusEntity } from "./user_status";
import { SCHEMA_PRIMARY } from "@core/constants";
import { BaseTable } from "@core/database/base";
import { PersonEntity } from "./person";

@Entity({ schema: SCHEMA_PRIMARY, name: "user" })
export class UserEntity extends BaseTable {
  @Column({ type: "text" , nullable: true, default: "ACTIVE" })
  id_status: string;

  @Column({ type: "text" })
  id_person: string;

  @Column({ type: "text", nullable: true })
  id_rol: string | null;

  @Column({ type: "varchar", unique: true })
  username: string;

  @Column({ type: "text", select: false })
  password: string;

  @Column({ type: "bool", nullable: true, default: true })
  is_enable: boolean;

  @Column({ type: "bool", default: false })
  is_admin: boolean;

  @Column({ type: "bool", default: false })
  is_system: boolean;

  @Column({ type: "int", default: 0 })
  login_failed_attempts: number;

  @Column({ type: "timestamptz", nullable: true })
  login_locked_until: string | null;

  @Column({ type: "bool", default: true })
  login_first_time: boolean;

  @Column({ type: "varchar", nullable: true })
  recovery_code: string | null;

  @Column({ type: "timestamptz", nullable: true })
  recovery_timestamp: string | null;

  @Column({ type: "int", default: 0 })
  recovery_filed_attempts: number;

  @Column({ type: "timestamptz", nullable: true })
  recovery_locked_until: string | null;

  @Column({ type: "bool", default: false })
  recovery_allowed: boolean;

  @OneToOne(() => PersonEntity, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "id_person" })
  person: PersonEntity;

  @ManyToOne(() => UserStatusEntity, { onDelete: "NO ACTION", onUpdate: "NO ACTION" })
  @JoinColumn({ name: "id_status" })
  status: UserStatusEntity | null;

  @ManyToOne(() => RolesEntity, { onDelete: "NO ACTION", onUpdate: "NO ACTION" })
  @JoinColumn({ name: "id_rol" })
  rol: RolesEntity | null;

  @ManyToOne(() => UserEntity, { createForeignKeyConstraints: false })
  @JoinColumn({ name: "update_by" })
  update_user: UserEntity | null;
}
