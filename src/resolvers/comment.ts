import { Resolver, Query, Ctx, Arg, Int  } from "type-graphql";
import { Post } from "../entities/Post";
import { MyContext } from '../types'

@Resolver()
export class CommentResolver {
  @Query(() => [Post])
  async posts(
      @Ctx() ctx: MyContext
    ) {

    return await ctx.db.find(Post, {})
  }
}