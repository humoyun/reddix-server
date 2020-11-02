import { ObjectType, Field } from "type-graphql";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { User } from "./User";
import { Vote } from "./Vote";
import { Flair } from "./Flair";


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


enum PostType {
  IMG = "image",
  VID = "video",
  TXT = "text"
  LNK = "link"
  PLL = "poll"
}

@ObjectType()
@Entity({ name: 'posts' })
export class Post extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn("uuid")
  id!: number;

  @Field()
  @Column()
  title!: string;

  @Field()
  @Column()
  text!: string;

  @Field()
  @Column({  })
  html: string;
  
  @Field()
  @Column()
  flair: string;

  @Field()
  @Column({ type: "enum", enum: PostType, default: PostType.TXT  })
  type!: PostType; // image | video | text | poll | link

  // @Field()
  // @Column()
  // mediaUrl?: string;

  // @Field()
  // @Column()
  // link?: string;

  // @Field()
  // @Column()
  // hiddenPosts?: number[]; // I need to think how to design this behavior, user should not see these posts

  @Field()
  @Column({ type: "int", default: 0 })
  points!: number;

  @Field()
  @Column()
  ownerId: number;

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
