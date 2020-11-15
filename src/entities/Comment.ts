import { ObjectType, Field } from "type-graphql";
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@Entity({ name: "comments" })
export class Comment {
  @Field()
  @PrimaryGeneratedColumn("increment")
  id!: string;

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