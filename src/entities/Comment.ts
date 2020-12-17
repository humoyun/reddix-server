import { ObjectType, Field, Int } from "type-graphql";
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@Entity({ name: "comments" })
export class Comment {
  @Field(() => Int)
  @PrimaryGeneratedColumn("increment")
  id!: int;

  @Field()
  @Column()
  parentId!: number;

  @Field()
  @Column({ type: "uuid" })
  ownerId!: string;

  @Field()
  @Column({ type: "uuid" })
  postId!: string;

  @Field()
  @Column({ type: "text", nullable: false })
  text: string
}