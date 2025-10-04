import type { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { getUserData } from "@server/utils/jwt";

export const authMiddleware = async (c: Context, next: Next) => {
  try {
    const token = getCookie(c, "jwt");

    if (!token) {
      return c.json({ message: "Unauthorized - No Token Provided" }, 401);
    }

    const user = getUserData(token);

    if (!user) {
      return c.json(
        { message: "Unauthorized - Invalid or Expired Token" },
        401
      );
    }

    c.set("user", user);

    await next();
  } catch (err) {
    console.error("AuthMiddleware Error:", err);
    return c.json({ message: "Unauthorized - Token verification failed" }, 401);
  }
};
