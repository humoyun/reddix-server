import { Resolver, Query, Ctx, Arg, Int  } from "type-graphql";
import { Comment } from "../entities/Comment";
import { MyContext } from '../types'

@Resolver()
export class CommentResolver {
  @Query(() => [Comment])
  async comments(@Ctx() ctx: MyContext) {
    return await ctx.db.find(Comment, {});
  }
}