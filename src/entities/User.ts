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

  // @Field()
  // @Column()
  // role: string // default: member [can be admin to create subreddix]
  // in order to be able to create subreddix you need to gather enough points (karmas)
    
  // relationship with Post
  @OneToMany(() => Post, (post) => post.owner)
  posts: Post[];

  // relationship with Vote
  @OneToMany(() => Vote, (v) => v.post)
  votes: Vote[]

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