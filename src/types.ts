import { EntityManager, Connection, IDatabaseDriver } from "@mikro-orm/core"
import { Request, Response } from 'express'

export type MyContext = {
  db: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>
  req: Request
  res: Response
}