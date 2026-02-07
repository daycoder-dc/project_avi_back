import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { PersonGenderEntity } from "./person_gender";
import { SCHEMA_PRIMARY } from "@core/constants";
import { BaseTable } from "@core/database/base";

@Entity({ schema: SCHEMA_PRIMARY, name: "person" })
export class PersonEntity extends BaseTable {
  @Column({ type: "varchar" })
  first_name: string;

  @Column({ type: "varchar" })
  last_name: string;

  @Column({ type: "text", nullable: true })
  id_gender: string | null;

  @Column({ type: "varchar" })
  email: string;

  @ManyToOne(() => PersonGenderEntity, { onDelete: "SET NULL", onUpdate: "CASCADE" })
  @JoinColumn({ name: "id_gender" })
  gender: PersonGenderEntity | null;
}
