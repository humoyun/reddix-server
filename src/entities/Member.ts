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
import { Channel } from "./Channel";
import { Vote } from "./Vote";

@ObjectType()
@Entity()
export class Member extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ unique: true })
  username!: string;

  @Field()
  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @OneToMany(() => Post, (post) => post.creator)
  posts: Post[];

  @OneToMany(() => Vote, (v) => v.post)
  votes: Vote[]

  // @ManyToMany(() => Channel, (channel) => channel.members)
    
  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;

  static findByName(username: string) {
    return (
      this.createQueryBuilder("user")
        .where("user.username = :username", { username })
        // .andWhere("user.lastName = :lastName", { lastName })
        .getMany()
    );
  }
}