import { IS_PROD } from "./constants";
import { Post } from "./entities/Post";
import { Member } from "./entities/Member";
import { MikroORM } from '@mikro-orm/core';
import path from "path";

export default {
  migrations: {
    path: path.join(__dirname, './migrations'), // path to the folder with migrations
    pattern: /^[\w-]+\d+\.[tj]s$/, // regex pattern for the migration files
  },
  entities: [Post, Member],
  dbName: 'reddir',
  type: "postgresql",
  debug: !IS_PROD,
  
} as Parameters<typeof MikroORM.init>[0]

