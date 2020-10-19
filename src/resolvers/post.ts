import {
  Resolver,
  Query,
  Mutation,
  Ctx,
  Arg,
  Int,
  UseMiddleware,
  InputType,
  Field,
  FieldResolver,
  Root,
} from "type-graphql";
import { Post } from "../entities/Post";
import { MyContext } from '../types'
import { isAuth } from "../middlewares/isAuth";

import { FieldError } from '../types'
import { getConnection } from "typeorm";
import { limits } from "argon2";

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

@InputType()
export class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@InputType()
class PostResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: [FieldError]

  @Field(() => Post, { nullable: true })
  post?: Post
}
  
@Resolver(Post)
export class PostResolver {
  // return only part of content
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text && root.text.slice(0, 50)
  }

  @Query(() => [Post])
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
  ): Promise<Post[]> {
    const MAX_LIMIT = 50;
    const maxLimit = Math.min(limit, MAX_LIMIT) 
    const qb = getConnection().
      getRepository(Post).
      createQueryBuilder('post').
      orderBy('"createdAt"', "DESC"). // should be single quoted becuase of postgres syntax
      take(maxLimit);
    if (cursor) {
      qb.where('"createdAt" < :cursor', {cursor: new Date(parseInt(cursor))})
    }
    
    return qb.getMany();
  }

  /* `() => Int` it can be omitted un this case, but just for demonstration */
  @Query(() => Post, { nullable: true })
  async post(@Arg("id", () => Int) id: number): Promise<Post | null> {
    return Post.find(id);
  }

  /**
   *
   * @param title
   * @param ctx
   */
  @Mutation(() => Post)
  @UseMiddleware(isAuth) 
  async createPost(
    @Arg("input") input: PostInput,
    @Ctx() ctx: MyContext
  ): Promise<Post> {
    // if (!input.title) {
    //   return []
    // }

    return Post.create({
      ...input,
      creatorId: ctx.req.session.memberId,
    }).save();
  }

  /**
   *
   * @param id
   * @param title
   */
  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id") id: number,
    @Arg("title") title: string,
    @Arg("text", { nullable: true }) text: string
  ): Promise<Post | null> {
    let post = await Post.findOne(id);

    if (!post) {
      return null;
    }
    let update = {};
    if (title) {
      update.title = title;
    }
    if (text) {
      update.text = text;
    }
    if (Object.keys(update).length > 0)
      await Post.update({ id }, { ...update });
    // post title is old not udpated one,  so I am hacking little  bit, should find better way
    return { ...post, ...update };
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg("id") id: number): Promise<boolean> {
    try {
      await Post.delete(id);
    } catch (err) {
      console.error(err);
      return false;
    }

    return true;
  }
}