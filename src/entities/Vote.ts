import { Field, ObjectType } from "type-graphql";
import {  Check, Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { User } from "./User";
import { Post } from "./Post";


// many to many relationship between posts and users
// users -> votes <- posts
@ObjectType()
@Entity({ name: 'votes' })
@Check(`"val" > -2 AND "val" < 2`)
export class Vote { 
  // () => Int
  @Field()
  @Column({ type: "int" })
  val: number;
  
  // @Field(() => User)
  @ManyToOne(() => User, (user) => user.votes)
  user: User;
  
  // @Field(() => Post)
  @ManyToOne(() => Post, (post) => post.votes)
  post: Post;
  
  @PrimaryColumn()
  userId!: string;

  @PrimaryColumn()
  postId!: string;
}