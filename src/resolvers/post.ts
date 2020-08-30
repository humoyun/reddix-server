import { Resolver, Query, Mutation, Ctx, Arg, Int  } from "type-graphql";
import { Post } from "../entities/Post";
import { MyContext } from '../types'

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  async posts(
      @Ctx() ctx: MyContext
    ) {

    return await ctx.db.find(Post, {})
  }

  @Query(() => Post, { nullable: true })
  async post(
      /* `() => Int` it can be omitted un this case, but just for demonstration */
      @Arg("id", () => Int) id: number,
      @Ctx() ctx: MyContext
    ): Promise<Post | null> {

    return await ctx.db.findOne(Post, {id})
  }

  /**
   * 
   * @param title 
   * @param ctx 
   */
  @Mutation(() => Post)
  async createPost(
      @Arg("title") title: string,
      @Ctx() ctx: MyContext
    ): Promise<Post> {
    const post = ctx.db.create(Post, { title })
    await ctx.db.persistAndFlush(post)

    return post
  }

  /**
   * 
   * @param id 
   * @param title 
   * @param ctx 
   */
  @Mutation(() => Post, { nullable: true })
  async updatePost(
      @Arg("id") id: number,
      @Arg("title") title: string,
      @Ctx() ctx: MyContext
    ): Promise<Post | null> {
    const post = await ctx.db.findOne(Post, {id})

    if (!post) {
      return null
    }
    if (title) {
      post.title = title;
      await ctx.db.persistAndFlush(post)     
    }

    return post
  }


  @Mutation(() => Boolean)
  async deletePost(
      @Arg("id") id: number,
      @Ctx() ctx: MyContext
    ): Promise<boolean> {
      try {
        ctx.db.nativeDelete(Post, { id })    
      } catch (err) {
        console.error(err)
      }
    
    return true
  }
}