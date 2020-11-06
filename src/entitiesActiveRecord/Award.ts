import { BaseEntity, PrimaryGeneratedColumn, Column, CreateDateColumn, Entity } from "typeorm";
import { Field } from "type-graphql";

@Entity({ name: "awards" })
export class Award extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  name!: string;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;
}