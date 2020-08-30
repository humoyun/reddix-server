import { MikroORM } from '@mikro-orm/core';
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import express from 'express'

import mikroORMConfig from './mikro-orm.config'
import { PostResolver } from './resolvers/post'
import { MemberResolver } from './resolvers/member'

const main = async () => {
  const PORT = 4400;
  
  const orm = await MikroORM.init(mikroORMConfig)
  // await orm.getMigrator().up()
  
  const app = express();
  const apollo = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, MemberResolver],
      validate: false
    }),
    context: () => ({ db: orm.em })
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