import type { Context, Next } from "hono";
import { getUserData } from "@server/utils/jwt";

export const authMiddleware = async (c: Context, next: Next) => {
  const authorization = c.req.header("Authorization");

  if (!authorization) {
    return c.json({ message: "Unauthorized" }, 403);
  }

  const [prefix, token] = authorization.split(" ");
  if (!(prefix === "Bearer" && token)) {
    return c.json({ message: "Unauthorized" }, 403);
  }

  const user = getUserData(token);

  if (!user) {
    return c.json({ message: "Invalid Token" }, 403);
  }

  c.set("user", user);

  await next();
};
