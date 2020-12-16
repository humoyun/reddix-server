import { MyContext, SubreddixType } from "../types";
import { Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver, UseMiddleware } from "type-graphql";
import { Subreddix } from "../entities/Subreddix";
import { slugify } from "../utils/common";
import { getConnection, getCustomRepository, getRepository } from "typeorm";
import { User } from "../entities/User";
import { SubreddixRepository } from "../repositories/SubreddixRepository";
import { isAuth } from "../middlewares/isAuth";

@ObjectType()
export class SubreddixResponse { 
  @Field(() => [String], { nullable: true })
  errors?: string[]

  @Field(() => Subreddix, { nullable: true })
  data?: Subreddix
}
  
@Resolver(Subreddix)
export class SubreddixResolver {
  
  @Mutation(() => SubreddixResponse)
  @UseMiddleware(isAuth) 
  async createSubreddix(
    @Arg("name") name: string,
    @Arg("type") type: SubreddixType,
    @Arg("description") description: string,
    @Arg("topics", () => [String]) topics: Array<string>,
    @Ctx() ctx: MyContext
  ): Promise<SubreddixResponse> { 
    const ownerId = ctx.req.session.userId
    
    const slug = slugify(name)
    const repo = getRepository(Subreddix)

    const subreddix = await repo.findOne({ slug })
    if (subreddix) {
      console.log("subreddix ", subreddix)
      return {
        errors: [`subreddix ${subreddix.name} already exist`],
        data: undefined
      }
    }

    const uRepo = getRepository(User)
    const user = await uRepo.findOne({id: ownerId})
    console.log("createSubreddix:", user)

    const resp = await repo.save({
      name,
      type,
      description,
      topics,
      slug,
      owner: user
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

    if (!resp) { 
      return {
        errors: ['some issue'],
        data: null
      }
    }
    
    const convertedTopics = resp.topics.match(/[\w.-]+/g).map(String)
    return {
      data: {...resp, topics: convertedTopics}
    }
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

  @Query(() => Subreddix, { nullable: true })
  async getSubreddix(
    @Arg("slug") slug: string,
  ): Promise<Subreddix> { 
    const repo = getCustomRepository(SubreddixRepository) 
    const resp = await repo.findOne(
      { where: { slug }, relations: ["owner", "members"] }
    ) as Subreddix

    return resp
  }

  async update() {

  }

  @Mutation(() => SubreddixResponse)
  async joinSubreddix(
    @Arg("join") join: boolean,
    @Arg("slug") slug: string,
    @Ctx() { req }: MyContext): Promise<SubreddixResponse> { 
    let subreddix;
    try {
      const uRepo = getRepository(User)
      const srRepo = getRepository(Subreddix)
      
      subreddix = await srRepo.findOne({ slug }, { relations: ["members"] });
      const user = await uRepo.findOne(req.session.userId)
      if (!user) {
        return {
          errors: ["user not exist"],
        }
      }
      console.log("joinSubreddix")
      console.log("user", user)
      console.log("subreddix", subreddix)
      const isMember = subreddix?.members.find(m => m.id === user?.id)
      
      if (isMember && join)
        return {
          errors: ["You are already joined this subreddix"],
        }

      const query = getConnection().createQueryBuilder().relation(Subreddix, "members").of(subreddix)
      if (join) { 
        // subreddix!.members = [user]
        query.add(user)
      } else {
        query.remove(user)
        // subreddix!.members = subreddix!.members.filter(member => member.id !== user!.id)
      }
      
    } catch (err) {
      console.error(err)
      return {
        errors: ["Server unhandled issue"],
      }
    }
    
    return {
      errors: [],
      data: subreddix
    };
  }

  async delete() {}
}