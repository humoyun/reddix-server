import { EntityManager, Connection, IDatabaseDriver } from "@mikro-orm/core"
import { Request, Response } from 'express'

export type MyContext = {
  db: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>
  req: Request & { session?: Express.Session }
  res: Response
}

export type NotAuthorizedError = {
  code: Number
  msg: String
}