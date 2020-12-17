import { Field, ObjectType } from "type-graphql";
import { Entity, PrimaryGeneratedColumn } from "typeorm";

/**
 * there are also multiple default reddix provided feeds which will be on the system from the beginning
 */

@ObjectType()
@Entity({ name: 'feeds' })
export class Feed { 
  @PrimaryGeneratedColumn()
  @Field()
  id: string;

  @Field()
  userId: string;

  @Field()
  subreddixs: string;
}