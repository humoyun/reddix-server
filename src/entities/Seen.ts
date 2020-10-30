import { Field, ObjectType } from "type-graphql";
import { BaseEntity, CreateDateColumn, PrimaryColumn } from "typeorm";

@ObjectType()
export class Seen extends BaseEntity {  
  @Field()
  @PrimaryColumn("uuid")
  postId!: string
  
  @Field()
  @PrimaryColumn("uuid")
  userId!: string
  
  @Field()
  @CreateDateColumn()
  createdAt: Date
}