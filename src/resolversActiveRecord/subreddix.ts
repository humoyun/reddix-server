import { MyContext } from "../types";
import { Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { Subreddix } from "../entities/Subreddix";
import { slugify } from "../utils/common";
import { getConnection } from "typeorm";
import { User } from "../entities/User";

@ObjectType()
class SubreddixJoinResponse { 
  @Field(() => [String], { nullable: true })
  errors?: string[]

  @Field({ nullable: true })
  success: boolean
}
  
@Resolver(Subreddix)
export class SubRedddixResolver { 
  
  @Mutation(() => Subreddix)
  async createSubreddix(
    @Arg("name") name: string,
    @Ctx() ctx: MyContext
  ): Promise<Subreddix> { 
    const ownerId = ctx.req.session.userId
    
    const slug = slugify(name)
    const resp = await Subreddix.create({
      name,
      slug,
      ownerId,
      flairs: [],
      rules: []
    }).save({relations: ["owner"]})

    return resp
  }

  /**
   * Get all subreddixs which the user joined
   * @param param0 
   */
  @Query(() => [Subreddix], {nullable: true })
  async getSubreddixs(@Ctx() { req }: MyContext): Promise<[Subreddix]> {
    let result: Array<Subreddix>;
    
    try {
      // result = await Subreddix.find()
      await getConnection().
        getRepository(User).
        createQueryBuilder("u").
        innerJoinAndSelect("u.subreddixes", "subreddixs", "", [])
    } catch (err) {
      console.error(err)
    }

    return result
  }

  @Query(() => Subreddix)
  async getSubreddix(
    @Arg("slug") slug: string,
  ): Promise<Subreddix> { 
    // const queryBuilder = getConnection().
    //   getRepository(Subreddix).
    //   createQueryBuilder('subr'). // alias for post
    //   innerJoinAndSelect(
    //     "subr.owner",
    //     "u", // alias
    //     "subr.  u.id = subr.owner_id" // ' "" ' we have to double quotes because naming restrinctions of postgres, 
    //   ).
    //   orderBy('sr."created_at"', "DESC"). // should be single quoted becuase of postgres syntax
    //   limit(maxLimit).get; // when take was used with orderBy there was `Cannot read property 'databaseName' of undefined` error

    const resp = await Subreddix.find({ where: { slug }, relations: ["owner"] })
    console.log("RESP ", resp)
    return resp[0]
  }

  async update() {

  }

  @Mutation(() => SubreddixJoinResponse)
  async joinSubreddix(
    @Arg("join") join: boolean,
    @Arg("slug") slug: string,
    @Ctx() { req }: MyContext): Promise<SubreddixJoinResponse> { 
    try {
      const [subreddix] = await Subreddix.find({ slug, relations: ["members"] })
      const user = await User.findOne(req.session.userId)
      
      const isMember = subreddix.members.find(m => m.id === user.id)
      
      if (isMember && join)
        return {
          errors: ["You are already joined this subreddix"],
          success: false
        }

      if (join) { 
        subreddix.members = [user]
      } else {
        subreddix.members = subreddix.members.filter(member => member.id !== user.id)
      }

      subreddix.save();
    } catch (err) {
      console.error(err)
      return {
        errors: ["Server unhandled issue"],
        success: false
      }
    }
    
    return {
      errors: null,
      success: true
    };
  }

  async delete() {}
}