import AuthController from "@server/controllers/auth.controller";
import { authMiddleware } from "@server/middleware/authMiddleware";
import { Hono } from "hono";

const api = new Hono();

// Auth Routes
api.post("/register", AuthController.AuthRegister);
api.post("/login", AuthController.AuthLogin);
api.get("/me", authMiddleware, AuthController.AuthMe);
api.get("/logout", AuthController.AuthLogout);

export default api;
