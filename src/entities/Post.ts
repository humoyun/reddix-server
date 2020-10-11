import { ObjectType, Field } from "type-graphql";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
} from "typeorm";
import { Member } from "./Member";

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  title!: string;

  @Field()
  @Column()
  text!: string;

  // @Field()
  // @Column()
  // type!: string; // image | video | text | poll | link

  // @Field()
  // @Column()
  // mediaUrl?: string;

  // @Field()
  // @Column()
  // link?: string;

  // @Field()
  // @Column()
  // hiddenPosts?: number[]; // I need to think how to design this behavior, user should not see these posts

  @Field()
  @Column({ type: "int", default: 0 })
  points!: number;

  @Field()
  @Column()
  creatorId: number;

  @ManyToOne(() => Member, (member) => member.posts)
  creator: Member;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
