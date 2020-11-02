import { BaseEntity, PrimaryGeneratedColumn, Column, ManyToMany, ManyToOne, CreateDateColumn, Entity } from "typeorm";
import { Field, ObjectType } from "type-graphql";
import { User } from "./User";

/**
 * r/reddix is the default subreddit (community) driven by author
 * 
 * r/AMA (Ask Me Anything)
 * r/ 
 */
@ObjectType()
@Entity({ name: 'subreddixes' })
export class Channel extends BaseEntity { 
  @Field()
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Field()
  @Column({ unique: true })
  name!: string; 

  @Field()
  @Column("string", { array: true })
  rules: string[];
  
  @Field()
  @Column({ array: true})
  flairs: string[];

  @Field()
  @Column({ comment: "used for indicating who is the owner of this subreddix", nullable: false })
  ownerId!: string;
  // ---------------------------------------------

  @ManyToOne(() => User, user => user.mySubreddixes)
  owner: User;

  /** DO NOT CONFUSE WITH ABOVE RELATIONSHIP
   * ---------------------------------------------  
   * This is for subreddix membership relationship 
   */
  @ManyToMany(() => User, user => user.subreddixes)
  members: User[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}