import { BaseEntity, PrimaryGeneratedColumn, Column, ManyToMany, ManyToOne } from "typeorm";
import { Field } from "type-graphql";
import { User } from "./User";

/**
 * r/reddir is the default subreddit (community) driven by author
 * 
 * r/AMA (Ask Me Anything)
 * r/ 
 */
export class Channel extends BaseEntity { 
  @Field()
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Field()
  @Column({ unique: true })
  name!: string; 

  @Field()
  @Column({ array: true })
  rules: string[];

  /**
   * --------------------------------------------
   * This is for Subreddir ownership relationship
   * do not confuse ownSubreddirs with subreddirs (which is for membership)
   */
  @Field(() => User)
  @ManyToOne(() => User, user => user.mySubreddirs)
  owner: User;
  
  @Field()
  @Column()
  ownerId: string;
  // ---------------------------------------------

  /** DO NOT CONFUSE WITH ABOVE RELATIONSHIP
   * ---------------------------------------------  
   * This is for subreddir membership relationship 
   */
  @ManyToMany(() => User)
  @JoinTable()
  members: User[];
}