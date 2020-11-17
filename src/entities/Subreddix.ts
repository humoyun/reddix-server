import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  ManyToOne,
  Column,
  Entity,
} from "typeorm";
import { Field, ObjectType } from "type-graphql";
import { User } from "./User";

/**
 * r/reddix is the default subreddix (community) driven by author
 * 
 * r/AMA (Ask Me Anything)
 * r/ 
 */
@ObjectType()
@Entity({ name: 'subreddixs' })
export class Subreddix { 
  @Field()
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Field()
  @Column({ unique: true })
  name!: string; 
  
  @Field()
  @Column({ unique: true })
  slug!: string;

  @Field(() => [String])
  @Column("jsonb", { array: true, default: {} })
  rules: string;
  
  @Field(() => [String])
  @Column({ array: true, default: {} })
  flairs?: string;

  @Field()
  @Column({ comment: "used for indicating who is the owner of this subreddix", nullable: false })
  ownerId!: string;
  // ---------------------------------------------

  @Field(() => User)
  @ManyToOne(() => User, user => user.mySubreddixes, { cascade: false })
  owner: User;

  /** DO NOT CONFUSE WITH ABOVE RELATIONSHIP
   * ---------------------------------------------  
   * This is for subreddix membership relationship 
   */
  @Field(() => [User])
  @ManyToMany(() => User, user => user.subreddixes)
  members: User[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}