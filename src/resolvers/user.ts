import {
  Resolver,
  Mutation,
  Query,
  Ctx,
  Args,
  Arg,
  ObjectType,
  ArgsType,
  Field,
  Int,
} from "type-graphql";
import { getRepository, getCustomRepository } from "typeorm";
import { v4 } from "uuid";

import { User } from "../entities/User";
import { MyContext } from '../types';
import { COOKIE_NAME } from "../constants";
import { validateReg } from "../utils/validateReg";
import { FORGET_PASSWORD_PREFIX } from "../constants";

/**
 * ArgsType can be used also
 */
import { UserInput, FieldError } from '../types'
import { sendEmail } from "../utils/sendEmail";
import { UserRepository } from "../repositories/UserRepository";

@ObjectType()
class TokenResponse { 
  @Field(() => FieldError, { nullable: true })
  error?: FieldError
  
  @Field({nullable: true})
  success?: Boolean 
}

/**
 * 
 */
@ObjectType()
export class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: [FieldError] 

  @Field(() => User, { nullable: true })
  user?: User
}

/**
 * 
 */
@Resolver(User)
export class UserResolver {

  @Query(() => User, { nullable: true })
  async me(@Ctx() ctx: MyContext) {
    
    if (!ctx.req.session.userId) {
      return null;
    }
    
    const repo = getRepository(User);
    const user = await repo.findOne(ctx.req.session.userId, {relations: ["votes"]} )
    console.log(">>> ", user)
    return user
  }

  @Query(() => TokenResponse)
  async checkToken(
    @Arg("token") token: String,
    @Ctx() { redis }: MyContext
  ): Promise<TokenResponse>  {
    
    const key = FORGET_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);
    
    if (!userId) {
      return {
        error: {
          field: "token",
          message: "invalid token, expired or not valid",
        },
        success: false  
      };
    }

    return {
      success: true
    };
  }

  /**
   *
   * @param title
   * @param ctx
   */
  @Mutation(() => UserResponse)
  async register(
    @Arg("args") args: UserInput
  ): Promise<UserResponse> {
    const errors = validateReg(args);
    if (errors) return { errors };

    const userRepo = await getCustomRepository(UserRepository);
    let user: User | undefined;

    try {
      user = await userRepo.createOne(args)
    } catch (err) {
      console.error("err detail: ", err);
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
      user
    }
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
    const userRepo = getCustomRepository(UserRepository);

    const user = await userRepo.findByUsernameOrEmail(usernameOrEmail);

    const errors: FieldError = {
      field: "usernameOrEmail",
      message: "this username or email doesn't exist",
    };

    if (!user) {
      return {
        errors: [errors],
      };
    }
    const isCorrect = await User.verifyPassword(user.password, password);
    if (!isCorrect) {
      return {
        errors: [errors],
      };
    }
    console.log("user login ", user);//// -<<<
    // no need for ! mark after session, as we updated type def of Context.Request
    ctx.req.session.userId = user.id;
    ctx.req.session.save()
    console.log("ctx.req.session ", ctx.req.session)

    return {
      user
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
    const repo = getRepository(User);
    const user = await repo.findOne({ where: { email } });
    if (!user) {
      // the email is not in the db
      console.warn(`User with this email: ${email} not exist`)
      return true;
    }

    const token = v4();
    const timeout = 1000 * 60 * 60 * 24 * 3 // 3 days
    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id,
      "ex",
      timeout
    );
    
    const HOST = "http://localhost:4411";
    const PATH = "change-password";
    
    sendEmail(email, `<a href="${HOST}/${PATH}/${token}">reset password</a>`);

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
    @Ctx() { redis, req, res }: MyContext
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
    const userId = await redis.get(key);
    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "invalid token, expired or not valid",
          },
        ],
      };
    }
    const repo = getRepository(User);
    const user = await repo.findOne(userId);

    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "user no longer exists",
          },
        ],
      };
    }

    try {
      await redis.del(key);
    } catch (err) {
      console.error("REDIS del error: ", err)  
    }

    const password = await User.getHashedPassword(newPassword);
    await repo.update({ id: userId }, { password });

    // clean everything, logout
    
    req.session?.destroy((err) => {
      res.clearCookie(COOKIE_NAME);

      if (err) {
        console.log("err in logout ", err);
        // resolve(false);
        return {
            
        }
      }
    });

    return {
    }
  }
}

