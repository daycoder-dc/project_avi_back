import { SCHEMA_PRIMARY } from "@core/constants";
import { Column, Entity } from "typeorm";

@Entity({ schema: SCHEMA_PRIMARY, name: "person_gender" })
export class PersonGenderEntity {
  @Column({ type: "varchar", primary: true })
  value: string;

  @Column({ type: "text", nullable: true })
  description: string | null;

  @Column({ type: "bool", default: false })
  delete: boolean;
}
