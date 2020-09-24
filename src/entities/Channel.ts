// import { BaseEntity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
// import { Field } from "type-graphql";
// import { Member } from "./Member";

// export class Channel extends BaseEntity { 
//   @Field()
//   @PrimaryGeneratedColumn()
//   id!: number;

//   @Field()
//   @Column()
//   name!: string; 

//   @Field()
//   @Column()
//   rule: string

//   @OneToMany(Member => (), (member) => member.creator)
//   members!: Member[]
// }