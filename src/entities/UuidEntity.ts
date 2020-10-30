import { Field } from "type-graphql";
import { PrimaryGeneratedColumn } from "typeorm";

interface UUID { 
  @Field()
  @PrimaryGeneratedColumnryGeneratedColumn("uuid")
  id!: number;
}