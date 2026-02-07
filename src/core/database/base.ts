import { Column, PrimaryGeneratedColumn } from "typeorm";

export class BaseTable {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "bool", default: false })
  delete: boolean;

  @Column({ type: "text", nullable: true })
  update_by: string |  null;

  @Column({ type: "text", nullable: true })
  create_by: string | null;

  @Column({ type: "timestamptz", nullable: true, default: () => "CURRENT_TIMESTAMP" })
  create_at: string | null;

  @Column({ type: "timestamptz", nullable: true })
  update_at: string | null;
}
