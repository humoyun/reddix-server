import {EntityRepository, getConnection, Repository} from "typeorm";
import { Post } from "../entities/Post";

@EntityRepository(Post)
export class UserRepository extends Repository<Post> {

}