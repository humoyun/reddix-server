import { Request, Response } from 'express'
import { InputType, ObjectType, Field } from "type-graphql";
import { Redis } from 'ioredis';
import Express from 'express-session'

export type MyContext = {
  redis: Redis
  req: Request & { session?: Express.Session & { userId: string } }
  res: Response
}

export type NotAuthorizedError = {
  code: Number
  msg: String
}

@InputType()
export class UserInput {
  @Field()
  username!: string;

  @Field()
  email!: string;

  @Field()
  password!: string;
}


@ObjectType()
export class FieldError {
  @Field()
  field: string

  @Field()
  message: string
}

export enum PostType {
  IMG = "image",
  VID = "video",
  TXT = "text",
  LNK = "link",
  PLL = "poll"
}

export type None = null | undefined