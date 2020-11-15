import {EntityRepository, Repository} from "typeorm";
import { Subreddix } from "../entities/Subreddix";

@EntityRepository(Subreddix)
export class SubreddixRepository extends Repository<Subreddix> {

}