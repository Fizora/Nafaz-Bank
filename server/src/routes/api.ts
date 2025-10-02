import AuthController from "@server/controllers/auth.controller";
import EmployeeController from "@server/controllers/employee.controller";
import { adminMiddleware } from "@server/middleware/adminMiddleware";
import { authMiddleware } from "@server/middleware/authMiddleware";
import { Hono } from "hono";

const api = new Hono();

// Auth Routes
api.post("/register", AuthController.AuthRegister);
api.post("/login", AuthController.AuthLogin);
api.get("/me", authMiddleware, AuthController.AuthMe);
api.get("/logout", AuthController.AuthLogout);

// Karyawan Routes
api.get(
  "/employe",
  authMiddleware,
  adminMiddleware,
  EmployeeController.ListEmploye
);
api.get(
  "/employe/:id",
  authMiddleware,
  adminMiddleware,
  EmployeeController.GetEmployeById
);
api.post(
  "/employe",
  authMiddleware,
  adminMiddleware,
  EmployeeController.CreateEmploye
);
api.put(
  "/employe/:id",
  authMiddleware,
  adminMiddleware,
  EmployeeController.UpdateEmploye
);
api.delete(
  "employe/:id",
  authMiddleware,
  adminMiddleware,
  EmployeeController.DeleteEmploye
);

export default api;
