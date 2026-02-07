import { SCHEMA_PRIMARY } from "@core/constants";
import { Column, Entity } from "typeorm";

@Entity({ schema: SCHEMA_PRIMARY, name: "user_status" })
export class UserStatusEntity {
  @Column({ type: "varchar", primary: true })
  value: string;

  @Column({ type: "text", nullable: true })
  description: string | null;

  @Column({ type: "text", nullable: false, default: "primary" })
  severity: string;

  @Column({ type: "bool", default: false })
  delete: boolean;
}
