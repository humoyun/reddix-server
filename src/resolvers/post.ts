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
  ObjectType,
} from "type-graphql";
import { Post } from "../entities/Post";
import { MyContext } from '../types'
import { isAuth } from "../middlewares/isAuth";

import { FieldError } from '../types'
import { getConnection } from "typeorm";
import { limits } from "argon2";
import { Vote } from "../entities/Vote";

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
  

@ObjectType()
class PaginatedPosts { 
  @Field(() => [Post])
  posts: Post[]

  @Field()
  hasMore: boolean
}

@Resolver(Post)
export class PostResolver {
  // return only part of content
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text && root.text.slice(0, 100)
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedPosts> {
    const MAX_LIMIT = 50;
    // + 1 is for 
    const maxLimit = Math.min(limit, MAX_LIMIT) + 1
    
    // getConnection().query(`
    
    // select p.* from post p
    // ${cursor ? `` : ""}
    // `)
    console.log("----------------------------")
    
    const qb = getConnection().
      getRepository(Post).
      createQueryBuilder('p'). // alias for post
      innerJoinAndSelect(
        "p.creator",
        "u", // alias
        'u.id = p."creatorId"' // ' "" ' we have to double quotes because naming restrinctions of postgres, change from camerlCase to underbar then no need for double quotes
      ).
      orderBy('p."createdAt"', "DESC"). // should be single quoted becuase of postgres syntax
      limit(maxLimit); // when take was used with orderBy there was `Cannot read property 'databaseName' of undefined` error
    
    if (cursor) {
      qb.where('p."createdAt" < :cursor', {cursor: new Date(parseInt(cursor))})
    }

    
    const posts = await qb.getMany();
    console.log("----------------------------")

    return {
      posts: posts.slice(0, maxLimit - 1),
      hasMore: posts.length === maxLimit
    }
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
  @UseMiddleware(isAuth) 
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
  @UseMiddleware(isAuth) 
  async deletePost(@Arg("id") id: number): Promise<boolean> {
    try {
      await Post.delete(id);
    } catch (err) {
      console.error(err);
      return false;
    }
 
    return true;
  }

  /**
   * ---------------------- VOTING 
   */
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg('postId', () => Int) postId: number,
    @Ctx() {req}: MyContext
  ) { 
    const memberId = req.session
    await Vote.insert({
      memberId, 
      postId,
      val
    })

    await getConnection().
      query(`UPDATE post p SET p.points = p.points + $1 WHERE p.id = $2`, [val, postId]);

    return true
  }
}