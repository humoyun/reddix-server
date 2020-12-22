import { Field, ObjectType } from "type-graphql";
import {
  Check, Column,
  CreateDateColumn, Entity,
  ManyToOne, PrimaryColumn,
  UpdateDateColumn
} from "typeorm";
import { User } from "./User";
import { Subreddix } from "./Subreddix";


// many to many relationship between posts and users
// users -> votes <- subreddixes
@ObjectType()
@Entity({ name: 'user_x_subreddix' })
export class Membership {
  @Field()
  @Column()
  role: string; // admin | owner | moderator | member | guest?
  
  // @Field(() => User)
  @ManyToOne(() => User, (user) => user.subreddixes)
  user: User;
  
  // @Field(() => Subreddix)
  @ManyToOne(() => Subreddix, (subreddix) => subreddix.members)
  subreddix: Subreddix;
  
  @PrimaryColumn()
  userId!: string;

  @PrimaryColumn()
  subreddixId!: string;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;
}