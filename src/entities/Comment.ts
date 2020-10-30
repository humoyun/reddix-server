import { ObjectType, Field } from "type-graphql";
import { Entity, BaseEntity, Column, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@Entity()
export class Comment extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn("increment")
  id!: string;

  @Field()
  @Column()
  parentId!: int;

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