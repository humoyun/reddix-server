import { MikroORM } from '@mikro-orm/core';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import express from 'express';

import redis from 'redis';
import session from 'express-session';

import mikroORMConfig from './mikro-orm.config';
import { PostResolver } from './resolvers/post';
import { MemberResolver } from './resolvers/member';

import connectRedis from 'connect-redis';
import { IS_PROD } from './constants';

const main = async () => {
  const PORT = 4400;
  
  const orm = await MikroORM.init(mikroORMConfig)
  // await orm.getMigrator().up()
  
  const app = express();
  const RedisStore = connectRedis(session)
  const redisClient = redis.createClient()

  app.use(
    session({
      name: 'sid',
      store: new RedisStore({ 
        client: redisClient,
        ttl: 86400 * 7 // one week
      }),
      cookie: {
        maxAge: 1000 * 3600 * 24 * 30,  // one month 
        httpOnly: true, // client cannot access this cookie
        secure: IS_PROD, // if true works only in https
        sameSite: true // csrf
      },
      secret: process.env.SECRET_KEY as string,
      resave: false,
    })
  )  

  const apollo = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, MemberResolver],
      validate: false
    }),
    context: ({req, res}) => ({ db: orm.em, req, res })
  })

  apollo.applyMiddleware({ app })

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