import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Check, Column, Entity, ManyToMany, ManyToOne, PrimaryColumn } from "typeorm";
import { User } from "./User";
import { Post } from "./Post";


// many to many relationshiup between posts and users
// users -> votes <- posts
@ObjectType()
@Entity({ name: 'votes' })
@Check(`"val" > -2 AND "val" < 2`)
export class Vote { 
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

  @Field()
  @PrimaryColumn()
  postId!: string;
}