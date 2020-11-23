import { Field, ObjectType } from "type-graphql";
import { CreateDateColumn, PrimaryColumn } from "typeorm";

@ObjectType()
export class Seen {  
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