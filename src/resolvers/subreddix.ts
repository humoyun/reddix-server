import { MyContext, SubreddixType } from "../types";
import { Query, Resolver, Mutation, Arg, Ctx, Field, ObjectType, InputType, UseMiddleware } from "type-graphql";
import { Subreddix } from "../entities/Subreddix";
import { slugify } from "../utils/common";
import { getConnection, getCustomRepository, getRepository } from "typeorm";
import { User } from "../entities/User";
import { SubreddixRepository } from "../repositories/SubreddixRepository";
import { isAuth } from "../middlewares/isAuth";
import { type } from "os";

@ObjectType()
export class SubreddixResponse {
  @Field(() => [String], { nullable: true })
  errors?: string[] | null

  @Field(() => Subreddix, { nullable: true })
  data?: Subreddix | null
}

@InputType()
class SubreddixInput {
  @Field()
  name!: string;

  @Field()
  type!: SubreddixType;

  @Field()
  description!: string;

  @Field(() => [String])
  topics!: Array<string>;
}


@Resolver(Subreddix)
export class SubreddixResolver {

  // TODO: validation and permission guards
  @Mutation(() => SubreddixResponse)
  @UseMiddleware(isAuth)
  async createSubreddix(
    @Arg("input") input: SubreddixInput,
    @Ctx() ctx: MyContext
  ): Promise<SubreddixResponse> {
    const ownerId = ctx.req.session.userId

    const slug = slugify(input.name)

    const repo = getRepository(Subreddix)

    const subreddix = await repo.findOne({ slug }) as Subreddix
    if (subreddix) {
      console.log("subreddix ", subreddix)
      return {
        errors: [`subreddix ${subreddix.name} already exist`],
        data: undefined
      }
    }
    let result: any;

    // flairs and topics types has some issues with postgres types
    // cannot cast Array<string> or [string] in Subreddix Entity class
    // so as any was used
    const payload: Partial<Subreddix> = {
      name: input.name,
      type: input.type,
      description: input.description,
      topics: input.topics as any,
      flairs: [] as any,
      slug,
      ownerId
    }

    try {
      result = await repo.save(payload) as Subreddix

    } catch (err) {
      console.error(err)
    }
    // save({relations: ["owner"]})
    // save({relations: ["owner"]})

    // await getConnection()
    // .createQueryBuilder()
    // .insert()
    // .into(Subreddix)
    // .values([
    //     { name, slug, ownerId }, 
    //   ])
    // .execute();

    // handle potential issues
    if (!result) {
      return {
        errors: ['some issue'],
        data: undefined
      }
    }

    let convertedTopics = result?.topics;
    if (result && typeof result.topics === 'string') {
      convertedTopics = result?.topics.match(/[\w.-]+/g).map(String)
    }

    return {
      data: { ...result, topics: convertedTopics },
      errors: null
    }
  }

  /**
   * Get all subreddixs which the user joined
   * @param param0 
   */
  @Query(() => [Subreddix], { nullable: true })
  async getSubreddixs(): Promise<Subreddix[]> {
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

  /**
   * Get all subreddixs which the user joined
   * @param param0 
   */
  @Query(() => [Subreddix], { nullable: true })
  async getSubreddixByUser(@Ctx() { req }: MyContext): Promise<Subreddix[]> {
    let result: Array<Subreddix> = [];
    const repo = getRepository(Subreddix)

    try {
      result = await repo.createQueryBuilder("s").
        innerJoinAndSelect("s.subreddixes", "members", "WHERE owner_id = $1", [req.session.userId]).getMany()
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

  async delete() { }
}