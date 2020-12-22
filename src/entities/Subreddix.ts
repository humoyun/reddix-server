import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  ManyToOne,
  Column,
  Entity
} from "typeorm";
import { Field, ObjectType } from "type-graphql";
import { User } from "./User";
import { SubreddixType } from "../types";
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
  @Column({ comment: "This is how new members come to understand your community", default: '' })
  description!: string;

  @Field()
  @Column({ unique: true })
  slug!: string;

  /**
   * We need to make Access Control mechanism to control permissions on subreddix 
   * 
   * Public: { anyone can see and participate in your community }
   * Restricted: { anyone can see, join, or vote in your community, but you control who posts and comments }
   * Private: { only people you approve can see and participate in your community }
   */
  @Field()
  @Column({ type: 'enum', enum: SubreddixType, default: SubreddixType.PUB })
  type!: SubreddixType;

  @Field(() => [String])
  @Column({ array: true, default: {}, comment: 'This will help relevant users find your community' })
  topics!: string;

  @Field(() => [String])
  @Column("jsonb", { array: true, default: {} })
  rules?: string;

  @Field(() => [String])
  @Column({ array: true, default: {} })
  flairs?: string;

  @Field()
  @Column({ nullable: false, comment: "used for indicating who is the owner of this subreddix" })
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