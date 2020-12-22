import { Field, ObjectType } from "type-graphql";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

/**
 * user feeds is good way to customize what users see in their feeds
 * there are also multiple default reddix provided feeds which will be on the system from the beginning
 */

@ObjectType()
@Entity({ name: 'feeds' })
export class Feed { 
  @PrimaryGeneratedColumn()
  @Field()
  @Column()
  id: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  userId: string;

  @Field()
  @Column()
  subreddixes: string;
}