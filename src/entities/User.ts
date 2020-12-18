
import argon2 from "argon2";
import { ObjectType, Field } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { IsEmail } from 'class-validator'
import { Post } from "./Post";
import { Comment } from './Comment';
import { Subreddix } from "./Subreddix";
import { Vote } from "./Vote";

@ObjectType()
@Entity({ name: "users" })
export class User {
  @Field()
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Field()
  @Column({ unique: true })
  username!: string;

  @Field()
  @Column({ unique: true })
  email!: string;

  @Field()
  @Column({ default: false })
  verified: boolean;

  @Column()
  password!: string;

  // @Column({ array: true, default: {} })
  // feeds!: string;

  // @Field()
  // @Column()
  // role: string // default: member [can be admin to create subreddix]
  // in order to be able to create subreddix you need to gather enough points (karmas)
    
  // relationship with Post
  @OneToMany(() => Post, (post) => post.owner)
  posts: Post[];  

  // relationship with Comment
  @OneToMany(() => Comment, (comment) => comment.owner)
  comments: Comment[];

  // relationship with Vote
  @Field(()=> [Vote])
  @OneToMany(() => Vote, (v) => v.user)
  votes: Vote[]

  // relationship with Point
  // @Field(()=> [Comment])
  // @OneToMany(() => Comment, (c) => c.user)
  // points: Point[]

  /**
   * --------------------------------------------
   * This is for Subreddixes ownership relationship
   * do not confuse ownSubreddixes with subreddixes (which is for membership)
   */
  @OneToMany(() => Subreddix, subreddix => subreddix.owner)
  mySubreddixes: Subreddix[];
  /**
   * ---------------------------------------------
   * This is for subreddix membership relationship 
   * bi-directional relationship
   */ 
  @ManyToMany(() => Subreddix, subreddix => subreddix.members)
  @JoinTable({
    name: "user_subreddixes",
    joinColumn: {
      name: "user_id",
      referencedColumnName: "id"
    },
    inverseJoinColumn: {
      name: "subreddix_id",
      referencedColumnName: "id"
    },
  })
  subreddixes: Subreddix[];
  // ---------------------------------------------

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field()
  @Column({ default: false })
  isActive: boolean;

  @Field()
  @Column({ default: false })
  isVerified: boolean;

  static async verifyPassword(real: string, toCheck: string): Promise<boolean | undefined>  { 
    let bool: boolean | undefined;
    try {
      bool = await argon2.verify(real, toCheck)
    } catch (err) {
      console.error(err)
    }

    return bool;
  }

  static async getHashedPassword(plainPassword: string): Promise<string | undefined> {
    let hashedPassword: string | undefined;

    try {
      hashedPassword = await argon2.hash(plainPassword);
    } catch (err) {
      console.error(err)
    }
    
    return hashedPassword
  }
}