import { EntityRepository, getConnection, Repository } from "typeorm";
import { User } from "../entities/User";
import { UserInput } from '../types'

@EntityRepository(User)
export class UserRepository extends Repository<User> {

  async findByUsernameOrEmail(arg: string) {
    const condition = arg.includes("@")
      ? { where: { email: arg } }
      : { where: { username: arg } }
    
    const user = await this.findOne(condition)
    return user;
  }

  async create(args: UserInput): Promise<User> {
    let user;
    const hashedPsw = await User.getHashedPassword(args.password);

    try {
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          username: args.username,
          email: args.email,
          password: hashedPsw,
        })
        .returning("*")
        .execute();
      
      user = result.raw[0];
      console.log("register persistAndFlush result ");
    } catch (err) {
      throw err
    }

    return user
  }
}