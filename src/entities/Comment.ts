import { Entity, PrimaryKey } from "@mikro-orm/core";
import { ObjectType, Field } from "type-graphql";

@ObjectType
@Entity
export class Comment {
  @Field(() => Int)
  @PrimaryKey()
  id!: number;
}