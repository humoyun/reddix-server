import { Resolver, Query, Ctx, Arg, Int, Mutation, UseMiddleware, Field, ObjectType  } from "type-graphql";
import { Comment } from "../entities/Comment";
import { FieldError, MyContext } from '../types'
import { isAuth } from "../middlewares/isAuth";
import { getRepository } from "typeorm";
/**
 * Use closure table for hierarchical data as it is optimal for it
 */

@ObjectType()
class CommentResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: [FieldError]

  @Field(() => Comment, { nullable: true })
  comment?: Comment
}


@ObjectType()
class PaginatedComments { 
  @Field(() => [Comment])
  comments: Comment[]

  @Field()
  hasMore: boolean
}

@Resolver()
export class CommentResolver {
  

  @Query(() => PaginatedComments)
  async getCommentsByUser(@Ctx() { req }: MyContext): Promise<PaginatedComments> { 
    const commentRepo = getRepository(Comment)
    let result;
    
    try {
      result = await commentRepo.find({ ownerId: req.session.userid })
    } catch (err) {
      console.error(err)  
    }
    
    console.log("result ", result);
    const comments = result?.map(com => ({ ...com, pointStatus: null }))
    console.log("PaginatedComments ", comments);

    return {
      comments: comments ? comments : [],
      hasMore: false
    }
  }

  @Query(() => PaginatedComments)
  async getCommentsByPost(@Arg('postId') postId: string,
    @Ctx() { req }: MyContext): Promise<PaginatedComments> { 
    const commentRepo = getRepository(Comment)
    let result;
    
    try {
      result = await commentRepo.find({ postId })
    } catch (err) {
      console.error(err)  
    }
    
    console.log("result ", result);
    const comments = result?.map(com => ({ ...com, pointStatus: null }))
    console.log("PaginatedComments ", comments);
    return {
      comments: comments ? comments : [],
      hasMore: false
    }
  }
  

  @Mutation(() => CommentResponse)
  @UseMiddleware(isAuth)
  async createComment(
    @Arg('postId') postId: string,
    @Arg('text') text: string,
    @Ctx() { req }: MyContext): Promise<CommentResponse> {
    
    const payload = {
      text,
      postId,
      ownerId: req.session.userId
    }

    const commentRepo = getRepository(Comment)
    let result;
    try {
      result = await commentRepo.save(payload)
      console.log("createComment : ", result)
      
    } catch (err) {
      console.error("createComment : ", err)
    }

    return {
      errors: null,
      comment: {
        ...result,
        pointStatus: null
      }
    }
  }
}