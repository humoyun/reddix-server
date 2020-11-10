import { Resolver, Query, Ctx, Arg, Int  } from "type-graphql";
import { Comment } from "../entities/Comment";
import { MyContext } from '../types'

/**
 * Use closure table for hierarchical data as it is optimnal for it
 */
@Resolver()
export class CommentResolver {
  @Query(() => [Comment])
  async comments(@Ctx() ctx: MyContext) {
    return await ctx.db.find(Comment, {});
  }
}