import { IS_PROD } from "./constants";
import { Post } from "./entities/Post";
import { Vote } from "./entities/Vote";
import { User } from "./entities/User";
import path from "path";

export default {
  // migrations: {
  //   path: path.join(__dirname, './migrations'), // path to the folder with migrations
  //   pattern: /^[\w-]+\d+\.[tj]s$/, // regex pattern for the migration files
  // },
  type: "postgres",
  database: "reddir",
  username: "postgres",
  password: "postgres",
  logging: true,
  synchronize: !IS_PROD,
  migrations: [path.join(__dirname, "/migrations/*")],
  entities: [User, Post, Vote]
  // debug: !IS_PROD
  
}
