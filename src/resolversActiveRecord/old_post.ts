// import {
//   Resolver,
//   Query,
//   Mutation,
//   Ctx,
//   Arg,
//   Int,
//   UseMiddleware,
//   InputType,
//   Field,
//   FieldResolver,
//   Root,
//   ObjectType,
// } from "type-graphql";
// import { Vote } from "../entities/Vote";
// import { Post } from "../entities/Post";
// import { MyContext } from '../types'
// import { isAuth } from "../middlewares/isAuth";

// import { FieldError } from '../types'
// import { getConnection, getRepository } from "typeorm";
// import { limits } from "argon2";
// import { PostType } from "../types";


// const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// @InputType()
// class PostInput {
//   @Field()
//   title: string;
    
//   @Field(() => PostType)
//   type!: string;

//   @Field()
//   text: string;
// }

// @ObjectType()
// class PostResponse {
//   @Field(() => [FieldError], { nullable: true })
//   errors?: [FieldError]

//   @Field(() => Post, { nullable: true })
//   post?: Post
// }

// @ObjectType()
// class PaginatedPosts { 
//   @Field(() => [Post])
//   posts: Post[]

//   @Field()
//   hasMore: boolean
// }

// @Resolver(Post)
// export class PostResolver {
//   // return only part of content
//   @FieldResolver(() => String)
//   textSnippet(@Root() root: Post) {
//     return root.text && root.text.slice(0, 100)
//   }

//   @Query(() => PaginatedPosts)
//   async posts(
//     @Arg("limit", () => Int) limit: number,
//     @Arg("cursor", () => String, { nullable: true }) cursor: string | null
//   ): Promise<PaginatedPosts> {
//     const MAX_LIMIT = 50;
//     // + 1 is for checking if there is more records exist
//     const maxLimit = Math.min(limit, MAX_LIMIT) + 1

//     console.log("----------------------------")
    
//     const queryBuilder = getConnection().
//       getRepository(Post).
//       createQueryBuilder('p').
//       innerJoinAndSelect(
//         "p.owner",
//         "u", // alias
//         "u.id = p.owner_id" // ' "" ' we have to double quotes because naming restrictions of postgres, 
//       ).
//       orderBy('p."created_at"', "DESC"). // should be single quoted because of postgres syntax
//       limit(maxLimit); // when take was used with orderBy there was `Cannot read property 'databaseName' of undefined` error
    
//     if (cursor) {
//       queryBuilder.where("p.created_at < :cursor", {cursor: new Date(parseInt(cursor))})
//     }
    
//     let posts: Post[];
//     try {
//       posts = await queryBuilder.getMany() as Post[]; 
//     } catch (err) {
//       console.error(err)
//     }
//     console.log("----------------------------")

//     return {
//       posts: posts?.slice(0, maxLimit - 1),
//       hasMore: posts?.length === maxLimit
//     }
//   }

//   /* `() => Int` it can be omitted un this case, but just for demonstration */
//   @Query(() => Post, { nullable: true })
//   async post(@Arg("id", () => Int) id: number): Promise<Post | undefined> {

//     const repo = getConnection().getRepository(Post)
//     const post = await repo.findOne(id, { relations: [""] })

//     return post;
//   } 

//   /**
//    *
//    * @param title
//    * @param ctx
//    */
//   @Mutation(() => Post)
//   @UseMiddleware(isAuth) 
//   async createPost(
//     @Arg("input") input: PostInput,
//     @Ctx() ctx: MyContext
//   ): Promise<Post> {
//     // if (!input.title) {
//     //   return []
//     // }
//     const payload: Partial<Post>  = {
//       type: input.type,
//       title: input.title,
//       ownerId: ctx.req.session?.userId
//     }
//     const repo = getRepository(Post)

//     if (input.type === PostType.LNK) {
//       payload.linkPreview = JSON.stringify({
//         title: "link_title",
//         desc: "link_desc",
//         imageUrl: "link_img_url",
//         url: "link_url",
//       })
//     } else if (input.type === PostType.IMG) {
//       payload.mediaUrl = "some_media_url"
//     } else if (input.type === PostType.PLL) {
//       console.log("createPost", PostType.PLL)
//     } else {

//     }
//     // need to check type based on this will create different post
//     // media post (image&video), link extraction post, text post, rich text editor
    
//     const resp = await repo.save(payload)

//     return resp
//   }

//   /**
//    *
//    * @param id
//    * @param title
//    */
//   @Mutation(() => Post, { nullable: true })
//   @UseMiddleware(isAuth) 
//   async updatePost(
//     @Arg("id") id: number,
//     @Arg("title") title: string,
//     @Arg("text", { nullable: true }) text: string
//   ): Promise<Post | null> {
//     const repo = getRepository(Post)
//     const post = await repo.findOne(id);

//     if (!post) {
//       return null;
//     }
//     let update = {};
//     if (title) {
//       update.title = title;
//     }
//     if (text) {
//       update.text = text;
//     }
//     if (Object.keys(update).length > 0)
//       await repo.update({ id }, { ...update });
//     // post title is old not udpated one,  so I am hacking little  bit, should find better way
//     return { ...post, ...update };
//   }

//   @Mutation(() => Boolean)
//   @UseMiddleware(isAuth) 
//   async deletePost(@Arg("id") id: number): Promise<boolean> {
//     try {
//       await Post.delete(id);
//     } catch (err) {
//       console.error(err);
//       return false;
//     }
 
//     return true;
//   }

//   /**
//    * ---------------------- VOTING ------------------------
//    * The query runner used by EntityManager. Used only in transactional instances of EntityManager.
//    */
//   @Mutation(() => Boolean)
//   @UseMiddleware(isAuth)
//   async vote(
//     @Arg('postId', () => Int) postId: number,
//     @Arg('val', () => Int) val: number,
//     @Ctx() {req}: MyContext
//   ) { 
//     const userId = req.session.userId
//     const queryRunner = await getConnection().createQueryRunner()  
//     await queryRunner.connect()
//     await queryRunner.startTransaction()
//     try {
      
//       await queryRunner.query(
//         'INSERT INTO vote (user_id, post_id, val) VALUES ($1, $2, $3);',
//         [userId, postId, val]
//       );
//       await queryRunner.query(
//         'UPDATE post SET points = points + $1 WHERE id = $2;',
//         [val, postId]
//       );
      
//       await queryRunner.commitTransaction();

//     } catch (err) {
//       console.error(err)
//       // since we have errors let's rollback changes we made
//       await queryRunner.rollbackTransaction();
//       return false;
//     } finally {
//       // you need to release query runner which is manually created:
//       await queryRunner.release();
//     }

//     return true
//   }

//   @Mutation(() => Boolean)
//   @UseMiddleware(isAuth)
//   async updateVote(
//     @Arg('postId', () => Int) postId: number,
//     @Arg('val', () => Int) val: number,
//     @Ctx() { req }: MyContext 
//   ) { 
//     const userId = req.session.userId
//     try {
//       // await getConnection()
//       //   .createQueryBuilder()
//       //   .update(Vote)
//       //   .set({ val })
//       //   .where("post_id = :pid AND userId = :mid", { pid: postId, mid: userId })
//       //   .execute();

//       // validate just to make sure 
//       const updatedVal = val===0 ? 0 : (val>0?1:-1);
//       await Vote.update({ post_id: postId, user_id: userId }, { val: updatedVal })
//     } catch (err) {
//       console.error(err)
//     }

//     return true;
//   }
  
// }