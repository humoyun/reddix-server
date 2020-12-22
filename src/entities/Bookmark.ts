import { Field, ObjectType } from "type-graphql";
import { Column, Entity, PrimaryColumn } from "typeorm";
import { User } from "./User";
import { Post } from "./Post";

enum BookmarkType {
  post,
  comment
}

// many to many relationship between posts and users
// users -> votes <- posts
@ObjectType()
@Entity({ name: 'bookmarks' })
// @Check()
export class Bookmark {

  // post or comment can be saved
  @Field()
  @Column({ type: "string" })
  id: String;

  @Field(() => BookmarkType)
  @Column({ type: 'string' })
  type: BookmarkType;

  @PrimaryColumn()
  userId!: string;

  @PrimaryColumn()
  objectId!: string;
}