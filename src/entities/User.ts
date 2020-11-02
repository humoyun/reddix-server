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
} from "typeorm";
import { IsEmail } from 'class-validator'
import { Post } from "./Post";
import { Subreddix } from "./Subreddix";
import { Vote } from "./Vote";

@ObjectType()
@Entity({ name: "users" })
export class User extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn("uuid")
  id!: number;

  @Field()
  @Column({ unique: true })
  username!: string;

  @Field()
  @IsEmail()
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
      name: "users",
      referencedColumnName: ""
    },
    inverseJoinColumn: {
      name: "subreddix",
      referencedColumnName: ""
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

  static findByName(username: string) {
    return (
      this.createQueryBuilder("user")
        .where("user.username = :username", { username })
        // .andWhere("user.lastName = :lastName", { lastName })
        .getMany()
    );
  }

  static async verifyPassword(real, toCheck): boolean { 
    let bool: boolean;
    try {
      bool = await argon2.verify(real, toCheck)
    } catch (err) {
      console.error(err)
    }

    return bool
  }

  static async getHashedPassword(plainPsword: string): string {
    let hashedPsw: string;
    try {
      hashedPsw = await argon2.hash(plainPsword);
    } catch (err) {
      console.error(err)
    }
    
    return hashedPsw
  }
}