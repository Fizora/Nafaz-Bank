import type { Context } from "hono";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt";
import * as Yup from "yup";

const prisma = new PrismaClient();

const registerSchema = Yup.object({
  username: Yup.string().required("Username wajib diisi"),
  email: Yup.string().email("Email tidak valid").required("Email wajib diisi"),
  password: Yup.string()
    .required("Password wajib diisi")
    .min(6, "Minimal 6 karakter")
    .matches(/[A-Z]/, "Harus ada huruf kapital")
    .matches(/[0-9]/, "Harus ada angka"),
  confirmPassword: Yup.string()
    .required()
    .oneOf([Yup.ref("password"), ""], "Password Harus Sama"),
  role: Yup.string().oneOf(["user", "admin"]).default("user"),
  phoneNumber: Yup.string().nullable(),
  address: Yup.string().nullable(),
  dateOfBirth: Yup.date().nullable(),
});

const loginSchema = Yup.object({
  identifier: Yup.string().required("Username atau email wajib diisi"),
  password: Yup.string().required("Password wajib diisi"),
});

const AuthController = {
  async AuthRegister(c: Context) {
    try {
      const body = await c.req.json();

      await registerSchema.validate(body, { abortEarly: false });

      const {
        username,
        email,
        password,
        role,
        phoneNumber,
        address,
        dateOfBirth,
      } = body;

      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email }, { username }] },
      });

      if (existingUser) {
        return c.json({ pesan: "User sudah terdaftar" }, 400);
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          role: role || "user",
          phoneNumber,
          address,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        },
      });

      return c.json({ pesan: "Register berhasil", data: user }, 201);
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        return c.json(
          {
            pesan: "Validasi gagal",
            errors: err.errors,
          },
          400
        );
      }
      if (err instanceof Error) {
        return c.json({ pesan: err.message }, 400);
      }
      return c.json({ pesan: "Terjadi kesalahan tak terduga" }, 500);
    }
  },

  async AuthLogin(c: Context) {
    try {
      const body = await c.req.json();

      await loginSchema.validate(body, { abortEarly: false });

      const { identifier, password } = body;

      const user = await prisma.user.findFirst({
        where: {
          OR: [{ email: identifier }, { username: identifier }],
        },
      });

      if (!user) return c.json({ pesan: "User tidak ditemukan" }, 400);

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return c.json({ pesan: "Password salah" }, 400);
      }

      const token = generateToken({ id: user.id, role: user.role });

      return c.json({ pesan: "Login berhasil", token });
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        return c.json(
          {
            pesan: "Validasi gagal",
            errors: err.errors,
          },
          400
        );
      }
      if (err instanceof Error) {
        return c.json({ pesan: err.message }, 400);
      }
      return c.json({ pesan: "Terjadi kesalahan tak terduga" }, 500);
    }
  },

  async AuthMe(c: Context) {
    const userJwt = c.get("user") as { id: string; role: string };

    const user = await prisma.user.findUnique({
      where: { id: userJwt.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        profilePicture: true,
        phoneNumber: true,
        address: true,
        dateOfBirth: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      return c.json({ pesan: "User tidak ditemukan" }, 404);
    }

    return c.json({ pesan: "Berhasil Mendapatkan User", data: user });
  },

  async AuthLogout(c: Context) {
    return c.json({ pesan: "Logout berhasil" });
  },
};

export default AuthController;
