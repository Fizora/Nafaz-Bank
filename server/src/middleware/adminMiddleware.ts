import type { Context, Next } from "hono";

export const adminMiddleware = async (c: Context, next: Next) => {
  const user = c.get("user") as { role: string };

  if (!user || user.role !== "admin") {
    return c.json(
      {
        status: false,
        pesan: "Forbidden",
      },
      403
    );
  }

  await next();
};
