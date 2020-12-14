import { MiddlewareFn } from "type-graphql";
import { MyContext } from "src/types";
import { RATE_LIMIT_KEY } from '../constants'

const ONE_DAY = 60 * 60 * 24;

type RateLimitFunc = (limit?: number) => MiddlewareFn<MyContext>

/**
 * Awesome way to do rate limiting without using Number of requests
 * TODO: take a look at: https://www.yelp.com/developers/graphql/guides/rate_limiting 
 */

export const rateLimit: RateLimitFunc = (limit: 50) => async ({ context: { req, redis }, info }, next) => { 
  const key = `${RATE_LIMIT_KEY}:${info.fieldName}:${req.ip}` // session.userId can be used for logged in users

  const currentCount = await redis.incr(key);
  if (currentCount > limit) {
    throw new Error("rate limit exceeded")
  } else { 
    redis.expire(key, ONE_DAY)
  }

  return next();
} 
