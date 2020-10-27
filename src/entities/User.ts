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
import { Post } from "./Post";
import { Subreddir } from "./Subreddir";
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
  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  // relationship with Post
  @OneToMany(() => Post, (post) => post.owner)
  posts: Post[];

  // relationship with Vote
  @OneToMany(() => Vote, (v) => v.post)
  votes: Vote[]

  /**
   * --------------------------------------------
   * This is for Subreddir ownership relationship
   */
  @OneToMany(() => Subreddir, Subreddir => subreddir.owner)
  mySubreddirs: Subreddir[];
  // --------------------------------------------

  /** DO NOT CONFUSE WITH ABOVE RELATIONSHIP
   * ---------------------------------------------
   * This is for subreddir membership relationship 
   * bi-rirectional relationship
   */ 
  @ManyToMany(() => Subreddir, sbrdr => sbrdr.members)
  subreddirs: Subreddir[];
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
}