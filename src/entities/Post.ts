import { ObjectType, Field } from "type-graphql";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { User } from "./User";
import { Vote } from "./Vote";
import { PostType } from "../types";
// import { Flair } from "./Flair";


// Options

// @Entity({
//     name: "users",
//     engine: "MyISAM",
//     schema: 'schema_with_best_tables',
//     synchronize: false,
//     orderBy: {
//         name: "ASC",
//         id: "DESC"
//     }
// })


@ObjectType()
@Entity({ name: 'posts' })
export class Post {
  @Field()
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Field()
  @Column()
  title!: string;

  @Field()
  @Column({ type: "text", nullable: true })
  text: string;

  @Field()
  @Column({ type: "text", nullable: true })
  html: string;
  
  @Field()
  @Column({ nullable: true })
  flair: string;

  @Field()
  @Column({ type: "enum", enum: PostType, default: PostType.TXT  })
  type!: PostType; // image | video | text | poll | link

  @Field()
  @Column({ nullable: true })
  mediaUrl?: string;

  @Field()
  @Column({ type: "json", nullable: true })
  linkPreview?: string;

  // @Field()
  // @Column()
  // hiddenPosts?: number[]; // I need to think how to design this behavior, user should not see these posts

  @Field()
  @Column({ type: "int", default: 0 })
  points!: number;

  @Field()
  @Column()
  ownerId: string;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.posts)
  owner: User;

  // relationship with Vote
  @OneToMany(() => Vote, (v) => v.post)
  votes: Vote[]

  // Post may have multiple tags
  // @ManyToMany(type => Post)
  // @JoinTable({
  //   name: "post_tags",
  //   joinColumn: {
  //       name: "post",
  //       referencedColumnName: "id"
  //   },
  //   inverseJoinColumn: {
  //       name: "flair",
  //       referencedColumnName: "id"
  //   }
  // })
  // flairs: Flair[]

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
