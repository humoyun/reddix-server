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
import { Vote } from "../entities/Vote";
import { Post } from "../entities/Post";
import { MyContext, PostType, FieldError } from '../types'
import { isAuth } from "../middlewares/isAuth";

import { getConnection, getRepository } from "typeorm";


const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

interface CustomType {
  [key: string]: any;
}

function isDateObject(date: any) {
  return Object.prototype.toString.call(date) === '[object Date]'
} 

function isObject(obj: any) {
  return (typeof obj === "object" && obj !== null) || typeof obj === "function";
}

const formatter = (data: CustomType): object | undefined => {
  if (!data) return;

  const result = { ...data }

  Object.keys(data).forEach((key: string) => {
    let tmp;

    if (isObject(data[key]) && !isDateObject(data[key])) {
      result[key] = formatter(data[key]);
    } else if (key.includes("_")) {
      tmp = key;
      const index = tmp.indexOf("_");
      tmp = tmp.replace("_", "")
      tmp = `${tmp.slice(0, index)}${tmp[index].toUpperCase()}${tmp.slice(index+1)}`
      result[tmp] = data[key];
      delete result[key]
    } else {
      result[key] = data[key];
    }
  });

  return result;
}


@InputType()
class PostInput {
  @Field()
  title: string;
    
  @Field(type => PostType)
  type!: PostType;

  @Field()
  text?: string;
}


@ObjectType()
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
    // + 1 is for checking if there is more records exist
    const maxLimit = Math.min(limit, MAX_LIMIT) + 1
    const parameters: any[] = [maxLimit]
    if (cursor) {
      parameters.push(new Date(parseInt(cursor)))
    }
    let posts;

    // there is some issue `orderBy` with `innerJoinAndSelect`, so I used raw SQL

    // limit(maxLimit); // when take was used with orderBy there was `Cannot read property 'databaseName' of undefined` error
    // const queryBuilder = getConnection().
    //   getRepository(Post).
    //   createQueryBuilder('p'). // alias for post
    //   innerJoinAndSelect(
    //     "p.owner",
    //     "u", // alias
    //     "u.id = p.owner_id").
    //   take(maxLimit).
    //   orderBy('p.created_at', "DESC")
    
    // if (cursor) {
    //   queryBuilder.where("p.created_at < :cursor", {cursor: new Date(parseInt(cursor))})
    // }
    
    // # need to join votes also in order to get 
    try {
      posts = await getConnection().query(`
      SELECT p.id,
      p.title, 
      p.text,
      p.flair, 
      p.type, 
      p.points, 
      p.created_at,
      json_build_object(
        'id', u.id,
        'username', u.username,
        'email', u.email,
        'created_at', u.created_at
      ) AS owner
      FROM posts p
      INNER JOIN users u ON u.id = p.owner_id
      ${cursor ? "WHERE p.created_at < $2" : "" }
      ORDER BY p.created_at DESC
      LIMIT $1
    `, parameters)
    } catch (err) {
      console.error(err)
    }
    console.log(posts)
    // We need to format post properties as they are in snake_case, 
    // we should convert them into camelCase for GraphQL 
    
    const formatted = posts.map((post: Post) => formatter(post))
    console.log("posts ", posts);

    return {
      posts: formatted.slice(0, maxLimit - 1),
      hasMore: formatted.length === maxLimit
    }
  }

  /* `() => Int` it can be omitted un this case, but just for demonstration */
  @Query(() => Post, { nullable: true })
  async post(@Arg("id", () => Int) id: number): Promise<Post | undefined> {

    const post = await getConnection().getRepository(Post).findOne(id, { relations: ["votes"] })

    return post
  } 

  /**
   *
   * @param title
   * @param ctx
   */
  @Mutation(() => PostResponse)
  @UseMiddleware(isAuth) 
  async createPost(
    @Arg("input") input: PostInput,
    @Ctx() ctx: MyContext
  ): Promise<PostResponse> {
    if (!input.title) {
      return {
        errors: [
          { field: "Post.title", message: "cannot be empty" }
        ]
      }
    }
    // need to check type based on this will create different post
    // media post (image&video), link extraction post, text post, rich text editor

    const payload: Partial<Post> = {
      type: input.type,
      title: input.title,
      ownerId: ctx.req.session?.userId
    }
    const repo = getRepository(Post)

    if (input.type === PostType.LNK) {
      payload.linkPreview = JSON.stringify({
        title: "link_title",
        desc: "link_desc",
        imageUrl: "link_img_url",
        url: "link_url",
      })
    } else if (input.type === PostType.IMG) {
      payload.mediaUrl = "some_media_url"
    } else if (input.type === PostType.PLL) {
      console.log("createPost", PostType.PLL)
    } else if (input.type === PostType.TXT) {
      if (!input.text) {
        return {
          errors: [
            { field: "Post.text", message: "cannot be empty" }
          ]
        }
      }
      payload.text = input.text;
    }
    
    const resp = await repo.save(payload) as Post

    return {
      post: resp
    }
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
    const repo = getRepository(Post);
    let post = await repo.findOne(id);

    if (!post) {
      return null;
    }
    let update = {} as Post;
    if (title) {
      update.title = title;
    }
    if (text) {
      update.text = text;
    }
    if (Object.keys(update).length > 0) {
      await repo.update(id, { ...update });
    }
    // post title is old not udpated one,  so I am hacking little  bit, should find better way
    return { ...post, ...update };
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth) 
  async deletePost(@Arg("id") id: number): Promise<boolean> {
    const repo = getRepository(Post)
    try {
      await repo.delete(id);
    } catch (err) {
      console.error(err);
      return false;
    }
 
    return true;
  }

  /**
   * ---------------------- VOTING ------------------------
   * The query runner used by EntityManager. Used only in transactional instances of EntityManager.
   */
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg('postId', () => String) postId: number,
    @Arg('val', () => Int) val: number,
    @Ctx() {req}: MyContext
  ) { 
    const userId = req.session.userId
    const queryRunner = getConnection().createQueryRunner() 
    await queryRunner.connect()

    const vote = await queryRunner.query('SELECT * FROM votes WHERE post_id = $1 AND user_id = $2;', [postId, userId]);

    console.log("vote => ", vote)
    if (vote) {
      await queryRunner.startTransaction()
      
      try {
        await queryRunner.query(
          'UPDATE votes SET val = $1 WHERE post_id = $2 AND user_id = $3;',
          [val, postId, userId]
        );
        await queryRunner.query(
          'UPDATE posts SET points = points + $1 WHERE id = $2;',
          [val, postId]
        );

        await queryRunner.commitTransaction();
      } catch (err) {
        console.error(err)
        await queryRunner.rollbackTransaction();
      } finally {
        // you need to release query runner which is manually created:
        await queryRunner.release();
      }

    } else { 

      await queryRunner.startTransaction()

      // # one cannot vote his own post
      // # one cannot vote more than one unit
      // # 
      
      try {
        
        await queryRunner.query(
          'INSERT INTO votes (user_id, post_id, val) VALUES ($1, $2, $3);',
          [userId, postId, val]
        );
        await queryRunner.query(
          'UPDATE posts SET points = points + $1 WHERE id = $2;',
          [val, postId]
        );
        
        await queryRunner.commitTransaction();

      } catch (err) {
        console.error(err)
        // since we have errors let's rollback changes we made
        await queryRunner.rollbackTransaction();
        return false;
      } finally {
        // you need to release query runner which is manually created:
        await queryRunner.release();
      }
    }

    return true
  }

  updateVote() { 
    
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async updateVote(
    @Arg('postId', () => Int) postId: number,
    @Arg('val', () => Int) val: number,
    @Ctx() { req }: MyContext 
  ) { 
    // const repo = getRepository(Vote);
    const userId = req.session.userId;
    // validate just to make sure 
    const validVal: number = val===0 ? 0 : (val > 0 ? 1 : -1);
    try {
      await getConnection()
        .createQueryBuilder()
        .update(Vote)
        .set({ val: validVal })
        .where("post_id = :pid AND userId = :mid", { pid: postId, mid: userId })
        .execute();

      
      // await repo.update({ post_id: postId, user_id: userId }, { val: updatedVal })
      // await repo.query(
      //   "UPDATE votes SET val = $1 WHERE post_id = $2 AND user_id = $3;",
      //   [validVal, postId, userId]
      // );
    } catch (err) {
      console.error(err)
    }

    return true;
  }
  
}