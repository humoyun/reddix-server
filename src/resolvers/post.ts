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
      tmp = `${tmp.slice(0, index)}${tmp[index].toUpperCase()}${tmp.slice(index + 1)}`
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

  @Field(() => PostType)
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



@ObjectType()
class VoteResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: [FieldError]

  @Field(() => Boolean, { nullable: true })
  success?: boolean
}



/**
 * 
 */
@Resolver(Post)
export class PostResolver {
  // return only part of content
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text && root.text.slice(0, 100)
  }

  // use with Dataloader otherwise you will have a N + 1 problem
  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(@Root() post: Post, @Ctx() { voteLoader, req }: MyContext) {
    if (!req.session.userId) {
      return null
    }

    const vote = await voteLoader.load({ postId: post.id, userId: req.session.userId })

    return vote ? vote.val : null
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
      ${cursor ? "WHERE p.created_at < $2" : ""}
      ORDER BY p.created_at DESC
      LIMIT $1
    `, parameters)
    } catch (err) {
      console.error(err)
    }
    // We need to format post properties as they are in snake_case, 
    // we should convert them into camelCase for GraphQL 

    const formatted = posts.map((post: Post) => formatter(post))

    return {
      posts: formatted.slice(0, maxLimit - 1),
      hasMore: formatted.length === maxLimit
    }
  }

  /* `() => Int` it can be omitted un this case, but just for demonstration */
  @Query(() => Post, { nullable: true })
  async post(@Arg("id", () => String) id: string): Promise<Post | undefined> {

    const post = await getConnection().getRepository(Post).findOne(id, { relations: ["owner"] })

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
    // post title is old not updated one,  so I am hacking little  bit, should find better way
    return { ...post, ...update };
  }

  /**
   *
   * @param id 
   */
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(@Arg("id") id: string, @Ctx() { req }: MyContext): Promise<boolean> {
    const repo = getRepository(Post)
    try {
      await repo.delete({ id, ownerId: req?.session.userId });

      // TODO: second way, I need to check which is more efficient
      // await getConnection().
      //   createQueryBuilder()
      //     .delete()
      //     .from(Post)
      //     .where("id = :id AND owner_id = :oid", { id, oid: ctx?.req.session.userId })
      //     .execute()
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
  // TODO: add rate limiting support
  @Mutation(() => VoteResponse)
  @UseMiddleware(isAuth)
  async vote(
    @Arg('postId', () => String) postId: number,
    @Arg('val', () => Int) val: number,
    @Ctx() { req }: MyContext
  ) {
    const userId = req.session.userId
    const postRepo = getRepository(Post);
    const post = await postRepo.findOne(postId);

    if (post && post.ownerId === userId) {
      return {
        errors: [{
          field: 'user',
          message: 'cannot vote one\'s vote'
        }],
        success: false
      }
    }

    const queryRunner = getConnection().createQueryRunner()
    await queryRunner.connect()

    let results;

    try {
      results = await queryRunner.query('SELECT * FROM votes WHERE post_id = $1 AND user_id = $2;', [postId, userId]);
    } catch (err) {
      if (err.message.includes('uuid:'))
        return {
          errors: [
            {
              field: 'uuid',
              message: err.message
            }
          ],
          success: false
        }
    }
    console.log("********** results ", results)
    if (results.length > 0) {
      const [vote] = results;
      const updateVal = vote.val + val
      await queryRunner.startTransaction()
      console.log("--------------------")

      try {
        await queryRunner.query(
          'UPDATE votes SET val = $1 WHERE post_id = $2 AND user_id = $3;',
          [updateVal, postId, userId]
        );

        // otherwise it will keep updating points by one every time, because realVal is always 1 if val = 0

        await queryRunner.query(
          'UPDATE posts SET points = points + $1 WHERE id = $2;',
          [val, postId]
        );

        console.log("--------------------")

        await queryRunner.commitTransaction();
        console.log("--------------------")
      } catch (err) {
        await queryRunner.rollbackTransaction();
        console.log("-------------------- err", err)
        return {
          errors: [{
            field: 'val',
            message: err.message
          }],
          success: false
        }
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
        // since we have errors let's rollback changes we made
        await queryRunner.rollbackTransaction();
        return {
          errors: [],
          success: false
        };
      } finally {
        // you need to release query runner which is manually created:
        await queryRunner.release();
      }
    }

    return {
      errors: null,
      success: true
    }
  }

}