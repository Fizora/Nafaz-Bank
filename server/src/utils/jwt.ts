import jwt from "jsonwebtoken";
import { environment } from "./env";

const SECRET_KEY = environment.SECRET_KEY;

export interface IUserToken {
  id: string;
  role: string;
}

export const generateToken = (user: IUserToken): string => {
  return jwt.sign(user, SECRET_KEY, { expiresIn: "1h" });
};

export const getUserData = (token: string): IUserToken | null => {
  try {
    return jwt.verify(token, SECRET_KEY) as IUserToken;
  } catch {
    return null;
  }
};
