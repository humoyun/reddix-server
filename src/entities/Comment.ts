import { ObjectType, Field, Int } from "type-graphql";
import { 
  ManyToOne,
  Entity,
  Column,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn
} from "typeorm";
import { User } from "./User";
import { Post } from './Post';

/**
 * for now I go with simple commenting system, where there is hierarchy of comments,
 * but users can reply to other comments, for example, when they click `reply` button 
 * which is located on the bottom of comment component (UI) , new comment window will
 * opened with mentions symbol followed by person who wanted to reply: @user23
 * 
 * or one wants to comment using rich editor component they can also use @ mentions symbol,
 * when they type @ into rich textbox list of users who already commented will appear 
 */

@ObjectType()
@Entity({ name: 'comments' })
export class Comment {
  @Field(() => Int)
  @PrimaryGeneratedColumn("increment")
  id!: int;
  
  @Index()
  @Field()
  @Column({ type: "text", nullable: false })
  text!: string;

  @Field(() => Int)
  @Column({ default: 0 })
  points!: number;
  
  @Field({ nullable: true })
  pointStatus?: number;

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

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
