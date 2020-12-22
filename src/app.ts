// required to make the type reflection work
import "reflect-metadata";

import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { createConnection } from "typeorm";
import connectRedis from "connect-redis";
import session from 'express-session';
import express from 'express';
import Redis from "ioredis";

import cors from 'cors'

import { SubreddixResolver } from "./resolvers/subreddix";
import { UserResolver } from './resolvers/user';
import { PostResolver } from './resolvers/post';
import { CommentResolver } from "./resolvers/comment";
import typeORMConfig from './type-orm.config';

import { IS_PROD, COOKIE_NAME, ORIGIN } from './constants';
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

import { voteLoader } from './utils/voteLoader'
import { myAuthChecker } from "./middlewares/hasPermission";

console.log("*****************************************")
console.log("************ REDDIX started *************")
console.log(`********** is_prod: ${IS_PROD} **********`)
console.log("*****************************************")


const ONE_WEEK = 1000 * 3600 * 24 * 7;

const main = async () => {
  const PORT = 4400;

  /**
   * Generally, you must create connection only once in your application bootstrap, 
   * and close it after you completely finished working with the database. In practice, 
   * if you are building a backend for your site and your backend server 
   * always stays running - you never close a connection.
   */

  const options = IS_PROD ? typeORMConfig.prod : typeORMConfig.dev
  // const connection =
  await createConnection(options as PostgresConnectionOptions);

  // when you need to do migrations
  // await connection.runMigrations()

  const app = express();
  const RedisStore = connectRedis(session)
  const redis = new Redis();

  app.use(cors({
    origin: IS_PROD ? ORIGIN.PROD : ORIGIN.DEV,
    credentials: true
  }));

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        // ttl: 86400 * 7, // one week
        disableTouch: true
      }),
      cookie: {
        maxAge: ONE_WEEK, // one month
        httpOnly: true, // client cannot access this cookie
        secure: IS_PROD, // if true works only in https
        sameSite: "lax", // csrf
      },
      saveUninitialized: false, //
      secret: process.env.SECRET_KEY as string,
      resave: false,
    })
  );

  const apollo = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver, SubreddixResolver, CommentResolver],
      authChecker: myAuthChecker,
      validate: false
    }),
    context: ({ req, res }) => ({
      redis,
      req,
      res,
      voteLoader: voteLoader() // solves N-1 problem in graphql
    }),
    playground: {
      settings: {
        "editor.theme": "dark",
        "request.credentials": "include",
        "tracing.hideTracingResponse": false
      }
    }
  })

  // defaults to cors: { origin: "*" }
  apollo.applyMiddleware({
    app,
    cors: false
  });

  app.listen(PORT, () => {
    console.log(`Reddix Server started at port: ${PORT}`)
  })
}

/**
 * Main entry function
 */
main().catch(err => {
  console.error(err)
})