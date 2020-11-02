// community tag

import { type } from "os";
import { Field } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Post } from "./Post";

@Entity()
export class Flair extends BaseEntity { 
  @Field()
  @PrimaryGeneratedColumn()
  id: number

  @Field()
  @Column({ type: "varchar", length: 50, unique: true })
  name!: string

  @Field(() => String)
  @CreateDateColumn()
  created_at: Date
}