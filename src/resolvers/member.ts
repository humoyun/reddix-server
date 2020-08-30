import { Resolver, Mutation, Ctx, Arg, InputType, Field, ObjectType } from "type-graphql";
import { Member } from "../entities/Member";
import { MyContext } from '../types'
import argon2 from 'argon2'

/**
 * 
 */
@InputType()
class UserInput {
  @Field()
  username!: string

  @Field()
  email!: string

  @Field()
  password!: string
}

/**
 * 
 */
@ObjectType()
class FieldError {
  @Field()
  field: string

  @Field()
  message: string
}

/**
 * 
 */
@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: [FieldError] 

  @Field(() => Member, { nullable: true })
  member?: Member
}

/**
 * 
 */
@Resolver()
export class MemberResolver {
  /**
   * 
   * @param title 
   * @param ctx
   */
  @Mutation(() => UserResponse)
  async register(
      @Arg("args") args: UserInput,
      @Ctx() ctx: MyContext
    ): Promise<UserResponse> {

    if(!args.username || args.username.length < 2) {
      return {
        errors: [{
          field: "username",
          message: "length should be greater than 2",
        }]
      }
    }

    if(!args.password || args.password.length < 4) {
      return {
        errors: [{
          field: "password",
          message: "length should be greater than 4",
        }]
      }
    }

    const hashedPsw = await argon2.hash(args.password)
    const member = ctx.db.create(Member, { 
      username: args.username, 
      email: args.email, 
      password: hashedPsw 
    })

    try {
      await ctx.db.persistAndFlush(member)
    } catch (err) {
      console.log("member : ", member)
      console.error("err detail: ", err.detail)
      console.error("typeof err.code: ", typeof err.code)
      // UniqueConstraintViolationException => detail: 'Key (username)=(...) already exists.',
      if (Number(err.code) === 23505) {
        return {
          errors: [{
            field: "username",
            message: "this username already exist"
          }]
        }
      }
    }

    ctx.req.session!.memberId = member.id;

    return {member}
  }

  /**
   * 
   * @param id 
   * @param title 
   * @param ctx 
   */
  @Mutation(() => UserResponse)
  async login(
      @Arg("args") args: UserInput,
      @Ctx() ctx: MyContext
    ): Promise<UserResponse> {
    const member = await ctx.db.findOne(Member, {username: args.username})

    const errors: FieldError = {
      field: "username",
      message: "this username doesn't exist"
    }
    
    if (!member ) {
      return {
        errors: [errors]
      }
    }
    const isCorrect = await argon2.verify(member.password, args.password );
    if (!isCorrect) {
      return {
        errors: [errors]
      }
    }

    return {
      member
    }
  }
}