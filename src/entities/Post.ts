import { ObjectType, Field, Int } from "type-graphql";
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
import { Comment } from './Comment';
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

  @Field({ nullable: true })
  @Column({ type: "text", nullable: true })
  text: string;

  @Field({ nullable: true })
  @Column({ type: "text", nullable: true })
  html: string;
  
  @Field({ nullable: true })
  @Column({ nullable: true })
  flair?: string;

  @Field()
  @Column({ type: "enum", enum: PostType, default: PostType.TXT  })
  type!: PostType; // image | video | text | poll | link

  @Field({ nullable: true })
  @Column({ nullable: true })
  mediaUrl?: string;

  @Field({ nullable: true })
  @Column({ type: "json", nullable: true })
  linkPreview?: string;

  // TODO: I need to either select all posts which user voted 
  // before getAllPosts request, and handle showing vote status on client side
  // or I need to fetch related votes when I fetch posts from DB in posts resolver method

  // on front-end I need to revalidate the cache also when votes changes

  // we need this field to show vote status ???
  // but it will not be reflected on posts table 
  @Field(() => Int, { nullable: true })
  voteStatus: number | null;

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

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];  

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
