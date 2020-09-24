// required to make the type reflection work
import "reflect-metadata";

import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import express from 'express';
import dotenv from 'dotenv'

import Redis from "ioredis";
import session from 'express-session';
import cors from 'cors'

import typeORMConfig from './type-orm.config';
import { PostResolver } from './resolvers/post';
import { MemberResolver } from './resolvers/member';

import connectRedis from 'connect-redis';
import { IS_PROD, COOKIE_NAME } from './constants';
import { sendEmail } from "./utils/sendEmail";
import { Member } from "./entities/Member";
import { Post } from "./entities/Post";
import { createConnection } from 'typeorm'



dotenv.config();

const main = async () => {
  // sendEmail("humoyun@3i.ai", "Hellow from Server")
  const PORT = 4400;
  
  const orm = await createConnection({
    type: "postgres",
    database: "reddir",
    username: "postgres",
    password: "postgres",
    logging: true,
    synchronize: true,
    entities: [Member, Post]
  });
  
  // await Member.delete({})
  // await Post.delete({});
  
  const app = express();
  const RedisStore = connectRedis(session)
  const redis = new Redis();

  app.use(cors({
    origin: "http://localhost:4411",
    credentials: true
  }));

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        ttl: 86400 * 7, // one week
      }),
      cookie: {
        maxAge: 1000 * 3600 * 24 * 30, // one month
        httpOnly: true, // client cannot access this cookie
        secure: IS_PROD, // if true works only in https
        sameSite: true, // csrf
      },
      saveUninitialized: false, //
      secret: process.env.SECRET_KEY as string,
      resave: false,
    })
  );  

  const apollo = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, MemberResolver],
      validate: false
    }),
    context: ({req, res}) => ({ redis, req, res })
  })

  // defaulsts to cors: { origin: "*" }
  apollo.applyMiddleware({ app, cors: false });

  app.listen(PORT, ()=> {
    console.log(`Server started at port: ${PORT}`)
  })  
}

/**
 * 
 */
main().catch(err => {
  console.error(err)
})