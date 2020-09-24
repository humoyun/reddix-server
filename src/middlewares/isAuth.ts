import { MiddlewareFn } from "type-graphql";
import { MyContext } from "src/types";

export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
  console.log("isauth:context ", context.req.session);
  if (!context.req.session.memberId) { 
    throw new Error("not authenticated")
  }

  return next()
}