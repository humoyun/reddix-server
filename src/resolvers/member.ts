import {
  Resolver,
  Mutation,
  Query,
  Ctx,
  Args,
  Arg,
  ObjectType,
  InputType,
  ArgsType,
  Field,
  Int,
} from "type-graphql";
import { Member } from "../entities/Member";
import { MyContext } from '../types'
import argon2 from 'argon2'
import { EntityManager } from '@mikro-orm/postgresql'
import { COOKIE_NAME } from "../constants";

/**
 * ArgsType can be used also
 */
@InputType()
class UserInput {
  @Field()
  username!: string

  @Field()
  password!: string
}


/**
 * ArgsType usually used for QUERIES
 */

// @ArgsType()
// class ArgsTypeName {
//   @Field((type) => Int, { nullable: true, defaultValue: 0 })
//   arg1?: number;

//   @Field((type) => Int, { nullable: true })
//   arg2?: number;

//   @Field({ nullable: true })
//   arg3?: string;


  // helpers - index calculations
  // get startIndex(): number {
  //   return this.arg1;
  // }
  // get endSome(): number {
  //   return this.arg1 + this.arg2;
  // }

// }


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
  @Query(() => Member, { nullable: true })
  async me(
    // @Args() { arg1, arg2, arg3 }: ArgsTypeName,
    @Ctx() ctx: MyContext
  ) {
    if (!ctx.req.session.memberId) {
      return null;
    }

    const member = await ctx.db.findOne(Member, {
      id: ctx.req.session.memberId,
    });

    return member;
  }

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
    if (!args.username || args.username.length < 4) {
      return {
        errors: [
          {
            field: "username",
            message: "length should be greater than 4",
          },
        ],
      };
    }

    if (!args.password || args.password.length < 4) {
      return {
        errors: [
          {
            field: "password",
            message: "length should be greater than 4",
          },
        ],
      };
    }

    const hashedPsw = await argon2.hash(args.password);
    // const member = ctx.db.create(Member, {
    //   username: args.username,
    //   password: hashedPsw,
    // });
    let member;
    try {
      const resp = await (ctx.db as EntityManager)
        .createQueryBuilder(Member)
        .getKnexQuery()
        .insert({
          username: args.username,
          password: hashedPsw,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning("*");
      [member] = resp;

      console.log("register persistAndFlush result ", resp);
    } catch (err) {
      console.error("err detail: ", err.detail);
      // UniqueConstraintViolationException => 
      // detail: 'Key (username)=(...) already exists.',
      if (err.detail.includes("already exist")) {
        return {
          errors: [
            {
              field: "username",
              message: "this username already exists",
            },
          ],
        };
      }
    }

    return {
      member,
    };
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
    const member = await ctx.db.findOne(Member, { username: args.username });

    const errors: FieldError = {
      field: "username",
      message: "this username doesn't exist",
    };

    if (!member) {
      return {
        errors: [errors],
      };
    }
    const isCorrect = await argon2.verify(member.password, args.password);
    if (!isCorrect) {
      return {
        errors: [errors],
      };
    }

    // no need for ! mark after session, as we updated type def of Context.Request
    ctx.req.session.memberId = member.id;

    return {
      member,
    };
  }

  @Mutation(() => Boolean)
  async logout(
    @Ctx() ctx: MyContext) {
    return new Promise(resolve => ctx.req.session?.destroy(err => {
      ctx.res.clearCookie(COOKIE_NAME);
      if (err) {
        console.log("err in logout ", err)
        resolve(false)
        return
      }

      resolve(true)
    }));
  }
}