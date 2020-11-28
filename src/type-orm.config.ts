import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { IS_PROD } from "./constants";
import { Post } from "./entities/Post";
import { Vote } from "./entities/Vote";
import { User } from "./entities/User";
import path from "path";

export default DB_CONFIG = {
  dev: {
    // migrations: {
    //   path: path.join(__dirname, './migrations'), // path to the folder with migrations
    //   pattern: /^[\w-]+\d+\.[tj]s$/, // regex pattern for the migration files
    // },
    type: "postgres",
    database: "reddix",
    username: "postgres",
    password: "postgres",
    synchronize: !IS_PROD,
    logging: !IS_PROD,
    migrations: [path.join(__dirname, "/migrations/dev/*")],
    entities: [User, Post, Vote, Subreddix],
    namingStrategy: new SnakeNamingStrategy()
  },
  
  prod: {
    url: "postgres://rhtvshgmmrhbpd:566420ab69e91df0853b538bae44eee46207d54e231d067bb0af1595b1b49c5b@ec2-18-210-90-1.compute-1.amazonaws.com:5432/d6o45ofn89g2sv",
    host: "ec2-18-210-90-1.compute-1.amazonaws.com",
    type: "postgres",
    database: "reddix",
    username: "rhtvshgmmrhbpd",
    password: "566420ab69e91df0853b538bae44eee46207d54e231d067bb0af1595b1b49c5b",
    logging: !IS_PROD,
    synchronize: !IS_PROD,
    migrations: [path.join(__dirname, "/migrations/prod/*")],
    entities: [User, Post, Vote]
  }
}