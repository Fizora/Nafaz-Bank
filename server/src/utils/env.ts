import env from "dotenv";

env.config();

export const environment = {
  SECRET_KEY: process.env.SECRET_KEY!,
};
