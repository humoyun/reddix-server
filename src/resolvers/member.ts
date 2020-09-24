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
import { getConnection } from "typeorm";
import { v4 } from "uuid";
import argon2 from "argon2";

import { Member } from "../entities/Member";
import { MyContext } from '../types';
import { COOKIE_NAME } from "../constants";
import { validateReg } from "../utils/validateReg";
import { FORGET_PASSWORD_PREFIX } from "../constants";

/**
 * ArgsType can be used also
 */
import { UserInput } from '../types'
import { sendEmail } from "../utils/sendEmail";

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
  me(@Ctx() ctx: MyContext) {
    if (!ctx.req.session.memberId) {
      return null;
    }

    return Member.findOne(ctx.req.session.memberId);
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
    const errors = validateReg(args);
    if (errors) return { errors };

    const hashedPsw = await argon2.hash(args.password);

    let member;
    try {
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(Member)
        .values({
          username: args.username,
          email: args.email,
          password: hashedPsw,
        })
        .returning("*")
        .execute();
      member = result.raw[0];
      console.log("register persistAndFlush result ");
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
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() ctx: MyContext
  ): Promise<UserResponse> {
    let option;

    if (usernameOrEmail.includes("@")) {
      option = { email: usernameOrEmail };
    } else {
      option = { username: usernameOrEmail };
    }

    const member = await Member.findOne(
      usernameOrEmail.includes("@")
        ? { where: { email: usernameOrEmail } }
        : { where: { username: usernameOrEmail } }
    );

    const errors: FieldError = {
      field: "usernameOrEmail",
      message: "this username or emaiil doesn't exist",
    };

    if (!member) {
      return {
        errors: [errors],
      };
    }
    const isCorrect = await argon2.verify(member.password, password);
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

  /**
   * 
   * @param ctx 
   */
  @Mutation(() => Boolean)
  async logout(@Ctx() ctx: MyContext) {
    return new Promise((resolve) =>
      ctx.req.session?.destroy((err) => {
        ctx.res.clearCookie(COOKIE_NAME);
        if (err) {
          console.log("err in logout ", err);
          resolve(false);
          return;
        }

        resolve(true);
      })
    );
  }

  /**
   *
   * @param email
   * @param param1
   */
  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { redis }: MyContext
  ) {
    const member = await Member.findOne({ where: { email } });
    if (!member) {
      // the email is not in the db
      return true;
    }

    const token = v4();
    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      member.id,
      "ex",
      1000 * 60 * 60 * 24 * 3
    ); // 3 days

    sendEmail(
      email,
      `<a href="http://localhost:4411/change-password/${token}">reset password</a>`
    );

    return true;
  }

  /**
   *
   * @param token
   * @param newPassword
   * @param ctx
   */
  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { redis, req }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length <= 2) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "length must be greater than 2",
          },
        ],
      };
    }

    const key = FORGET_PASSWORD_PREFIX + token;
    const memberId = await redis.get(key);
    if (!memberId) {
      return {
        errors: [
          {
            field: "token",
            message: "invalid token, expired or not valid",
          },
        ],
      };
    }

    const memberIdNum = parseInt(memberId);
    const member = await Member.findOne(memberIdNum);

    if (!member) {
      return {
        errors: [
          {
            field: "token",
            message: "user no longer exists",
          },
        ],
      };
    }
    const password = await argon2.hash(newPassword);
    await Member.update({ id: memberIdNum }, { password });

    await redis.del(key);
    // log in user after change password
    req.session.memberId = member.id;

    return { member };
  }
}

