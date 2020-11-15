import {EntityRepository, getConnection, Repository} from "typeorm";
import { Comment } from "../entities/Comment";

@EntityRepository(Comment)
export class CommentRepository extends Repository<Comment> {

}