import { ObjectType, Field } from "type-graphql";
import { Entity, BaseEntity, Column, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@Entity()
export class Comment extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Field()
  @Column()
  parent_id!: string;

  @Field()
  @Column({ type: "uuid" })
  owner_id: string; 

  @Field()
  @Column({ type: "text", nullable: false })
  text: string
}