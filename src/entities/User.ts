import argon2 from "argon2";
import { ObjectType, Field } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  BaseEntity,
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

  // @Column({ array: true, default: {} })
  // feeds!: string;

  // @Field()
  // @Column()
  // role: string // default: member [can be admin to create subreddix]
  // in order to be able to create subreddix you need to gather enough points (karmas)
    
  // relationship with Post
  @OneToMany(() => Post, (post) => post.owner)
  posts: Post[];

  // relationship with Vote
  @Field(()=> [Vote])
  @OneToMany(() => Vote, (v) => v.user)
  votes: Vote[]

  /**
   * --------------------------------------------
   * This is for Subreddir ownership relationship
   * do not confuse ownSubreddirs with subreddirs (which is for membership)
   */
  @OneToMany(() => Subreddix, subreddix => subreddix.owner)
  mySubreddixes: Subreddix[];
  /**
   * ---------------------------------------------
   * This is for subreddix membership relationship 
   * bi-rirectional relationship
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

  static async getHashedPassword(plainPsword: string): Promise<string | undefined> {
    let hashedPsw: string | undefined;
    try {
      hashedPsw = await argon2.hash(plainPsword);
    } catch (err) {
      console.error(err)
    }
    
    return hashedPsw
  }
}