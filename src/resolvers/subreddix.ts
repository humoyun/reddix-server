import { MyContext } from "../types";
import { Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { Subreddix } from "../entities/Subreddix";
import { slugify } from "../utils/common";
import { getConnection, getCustomRepository, getRepository } from "typeorm";
import { User } from "../entities/User";
import { SubreddixRepository } from "../repositories/SubreddixRepository";

@ObjectType()
class SubreddixJoinResponse { 
  @Field(() => [String], { nullable: true })
  errors?: string[]

  @Field({ nullable: true })
  success: boolean
}
  
@Resolver(Subreddix)
export class SubreddixResolver {
  
  @Mutation(() => Subreddix)
  async createSubreddix(
    @Arg("name") name: string,
    @Ctx() ctx: MyContext
  ): Promise<Subreddix> { 
    const ownerId = ctx.req.session.userId
    
    const slug = slugify(name)
    const repo = getRepository(Subreddix)
    const resp = repo.create({
      name,
      slug,
      ownerId,
    }) // save({relations: ["owner"]})
 // save({relations: ["owner"]})

    // await getConnection()
    // .createQueryBuilder()
    // .insert()
    // .into(Subreddix)
    // .values([
    //     { name, slug, ownerId }, 
    //   ])
    // .execute();


    return resp
  }

  /**
   * Get all subreddixs which the user joined
   * @param param0 
   */
  @Query(() => [Subreddix], { nullable: true })
  async getSubreddixs(@Ctx() { req }: MyContext): Promise<Subreddix[]> {
    let result: Array<Subreddix> = [];
    const repo = getRepository(Subreddix)
    try {
      result = await repo.createQueryBuilder("s").
        innerJoinAndSelect("s.subreddixes", "members", "", []).getMany()
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
    const repo = SubreddixRepository
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
      const uRepo = getRepository(User)
      const srRepo = getRepository(Subreddix)

      const subreddix = await srRepo.findOne({ slug }); // , { relations: ["members"] })
      const user = await uRepo.findOne(req.session.userId)

      console.log("joinSubreddix")
      console.log("user", user)
      console.log("subreddix", subreddix)
      const isMember = subreddix?.members.find(m => m.id === user?.id)
      
      if (isMember && join)
        return {
          errors: ["You are already joined this subreddix"],
          success: false
        }

      if (join) { 
        subreddix!.members = [user]
      } else {
        subreddix!.members = subreddix!.members.filter(member => member.id !== user!.id)
      }

      // srRepo.save();
    } catch (err) {
      console.error(err)
      return {
        errors: ["Server unhandled issue"],
        success: false
      }
    }
    
    return {
      success: true
    };
  }

  async delete() {}
}