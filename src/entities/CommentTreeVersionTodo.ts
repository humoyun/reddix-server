import { ObjectType, Field } from "type-graphql";
import { 
  ManyToOne,
  Entity, Column, PrimaryGeneratedColumn, 
  Tree, 
  TreeChildren, 
  TreeLevelColumn, 
  TreeParent } from "typeorm";
import { User } from "./User";
import { Post } from './Post';

@ObjectType()
@Tree("closure-table")
@Entity({ name: 'comments' })
export class Comment {
  @Field()
  @PrimaryGeneratedColumn("increment")
  id!: string;

  @Field()
  @Column({ type: "text", nullable: false })
  content!: string;

  @Field()
  @Column({ type: "text", default: 0 })
  points!: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.comments)
  owner: User;

  @Field()
  @Column({ type: "uuid" })
  ownerId!: string;

  @Field(() => Post)
  @ManyToOne(() => Post, (post) => post.comments)
  post: Post;

  @Field()
  @Column({ type: "uuid" })
  postId!: string;

  @TreeChildren()
  children: Comment[];

  @TreeParent()
  parent: Comment;

  @TreeLevelColumn()
  level: number;
}