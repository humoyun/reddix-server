import { PrimaryGeneratedColumn, Column, CreateDateColumn, Entity } from "typeorm";
import { Field } from "type-graphql";

@Entity({ name: "awards" })
export class Award {
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