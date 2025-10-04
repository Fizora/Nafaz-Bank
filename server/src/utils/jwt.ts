import jwt from "jsonwebtoken";
import { environment } from "./env";
import type { Context } from "hono";

const SECRET_KEY = environment.SECRET_KEY;

export interface IUserToken {
  id: string;
  role: string;
}

export const generateToken = (c: Context, user: IUserToken): string => {
  const token = jwt.sign(user, SECRET_KEY, { expiresIn: "1h" });

  c.header(
    "Set-Cookie",
    `jwt=${token}; HttpOnly; Path=/; Max-Age=3600; SameSite=Strict; Secure`
  );

  return token;
};

export const getUserData = (token: string): IUserToken | null => {
  try {
    return jwt.verify(token, SECRET_KEY) as IUserToken;
  } catch {
    return null;
  }
};
