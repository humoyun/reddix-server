import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, ManyToMany, ManyToOne, PrimaryColumn } from "typeorm";
import { Member } from "./Member";
import { Post } from "./Post";


// many to many relationshiup between posts and users
// users -> votes <- posts
@ObjectType()
@Entity()
export class Vote extends BaseEntity { 
  // @Field()
  @Column({ type: "int" })
  val: number;
    
  // @Field(() => Member)
  @ManyToOne(() => Member, (member) => member.votes)
  member: Member;
  
  // @Field(() => Post)
  @ManyToOne(() => Post, (post) => post.votes)
  post: Post;
  
  @PrimaryColumn()
  memberId!: number;

  @PrimaryColumn()
  postId!: number;
}