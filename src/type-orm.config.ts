import path from "path";

import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { IS_PROD, DB_CONFIG } from "./constants";
import { Post } from "./entities/Post";
import { Comment } from "./entities/Comment";
import { Vote } from "./entities/Vote";
import { Subreddix } from "./entities/Subreddix";
import { User } from "./entities/User";

export default {
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
    entities: [User, Post, Vote, Subreddix, Comment],
    namingStrategy: new SnakeNamingStrategy()
  },
  
  prod: {
    url: DB_CONFIG.url,
    host: DB_CONFIG.host,
    type: "postgres",
    database: "reddix",
    username: DB_CONFIG.username,
    password: DB_CONFIG.password,
    logging: !IS_PROD,
    synchronize: !IS_PROD,
    migrations: [path.join(__dirname, "/migrations/prod/*")],
    entities: [User, Post, Vote, Subreddix]
  }
}
