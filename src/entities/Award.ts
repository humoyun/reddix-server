import { BaseEntity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";
import { Field } from "type-graphql";

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