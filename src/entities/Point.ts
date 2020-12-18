import { Field, ObjectType } from "type-graphql";
import {  Check, Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { User } from "./User";
import { Comment } from "./Comment";


// many to many relationship between posts and users
// users -> votes <- posts
@ObjectType()
@Entity({ name: 'points' })
@Check(`"val" > -2 AND "val" < 2`)
export class Point { 
  // () => Int
  @Field()
  @Column({ type: "int" })
  val: number;
  
  // @Field(() => User)
  // @ManyToOne(() => User, (user) => user.points)
  // user: User;
  
  // @Field(() => Post)
  @ManyToOne(() => Comment, (comment) => comment.points)
  comment: Comment;
  
  @PrimaryColumn()
  userId!: string;

  @PrimaryColumn()
  commentId!: string;
}