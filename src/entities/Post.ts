import { ObjectType, Field } from "type-graphql";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Member } from "./Member";
import { Vote } from "./Vote";

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
ß
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

  @Field(() => Member)
  @ManyToOne(() => Member, (member) => member.posts)
  creator: Member;

  @OneToMany(() => Vote, (v) => v.post)
  votes: Vote[]

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
