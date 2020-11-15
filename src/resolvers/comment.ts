import { Resolver, Query, Ctx, Arg, Int  } from "type-graphql";
import { Comment } from "../entities/Comment";
import { MyContext } from '../types'

/**
 * Use closure table for hierarchical data as it is optimal for it
 */
@Resolver()
export class CommentResolver {
  @Query(() => [Comment])
  async comments(@Ctx() ctx: MyContext) {
    return []
  }
}