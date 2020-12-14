import dotenv from 'dotenv'

dotenv.config();

export const IS_PROD = process.env.environment === "production"
export const FORGET_PASSWORD_PREFIX = "forget-password:";
export const VERIFY_ACCOUNT_PREFIX = "verify-account:";
export const COOKIE_NAME = "sid"
export const RATE_LIMIT_KEY = 'rate-limit';

export const DB_CONFIG = {
  url: process.env.db_url,
  host: process.env.db_host,
  username: process.env.db_username,
  password: process.env.db_password
}

export const ORIGIN = {
  DEV: process.env.origin_dev,
  PROD: process.env.origin_prod
}