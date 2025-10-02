import type { Context } from "hono";
import { prisma } from "@server/utils/prisma";
import bcrypt from "bcryptjs";
import * as Yup from "yup";

const userEmployeSchema = Yup.object({
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
  phoneNumber: Yup.string().nullable(),
  address: Yup.string().nullable(),
  dateOfBirth: Yup.date().nullable(),
});

const EmployeeController = {
  async ListEmploye(c: Context) {
    try {
      const data = await prisma.user.findMany({
        where: {
          role: "employee",
        },
        select: {
          id: true,
          username: true,
          email: true,
          address: true,
          dateOfBirth: true,
          phoneNumber: true,
          profilePicture: true,
        },
      });

      if (!data.length) {
        return c.json(
          {
            status: false,
            pesan: "Data tidak ditemukan",
            data: null,
          },
          404
        );
      }

      return c.json(
        {
          status: true,
          pesan: "Berhasil Mendapatkan Data Karyawan",
          data: data,
        },
        200
      );
    } catch (err) {
      if (err instanceof Error) {
        return c.json({ status: false, pesan: err.message }, 400);
      }
      return c.json(
        { status: false, pesan: "Terjadi kesalahan tak terduga" },
        500
      );
    }
  },

  async GetEmployeById(c: Context) {
    try {
      const id = c.req.param("id");

      const userEmploye = await prisma.user.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          username: true,
          address: true,
          dateOfBirth: true,
          email: true,
          phoneNumber: true,
          profilePicture: true,
        },
      });

      if (!userEmploye) {
        return c.json(
          {
            status: false,
            pesan: "Tidak Dapat Menemukan Data",
            data: null,
          },
          404
        );
      }

      return c.json({
        status: true,
        pesan: "Berhasil Mendapatkan Data",
        data: userEmploye,
      });
    } catch (err) {
      if (err instanceof Error) {
        return c.json({ status: false, pesan: err.message }, 400);
      }
      return c.json(
        { status: false, pesan: "Terjadi kesalahan tak terduga" },
        500
      );
    }
  },

  async CreateEmploye(c: Context) {
    try {
      const body = await c.req.json();

      await userEmployeSchema.validate(body, { abortEarly: false });

      const { username, email, password, phoneNumber, address, dateOfBirth } =
        body;

      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email }, { username }] },
      });

      if (existingUser) {
        return c.json({ status: false, pesan: "Karyawan Telah Terdaftar" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const role = "employee";

      const insertData = {
        username,
        email,
        password: hashedPassword,
        phoneNumber,
        address,
        role,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      };

      const userEmploye = await prisma.user.create({
        data: insertData,
      });

      return c.json(
        {
          status: true,
          pesan: "Data Berhasil Ditambah",
          data: userEmploye,
        },
        201
      );
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
        return c.json({ status: false, pesan: err.message }, 400);
      }
      return c.json(
        { status: false, pesan: "Terjadi kesalahan tak terduga" },
        500
      );
    }
  },

  async UpdateEmploye(c: Context) {
    try {
      const id = c.req.param("id");
      const body = await c.req.json();

      await userEmployeSchema.validate(body, { abortEarly: false });

      const { username, email, password, phoneNumber, address, dateOfBirth } =
        body;

      const userEmploye = await prisma.user.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          username: true,
          address: true,
          dateOfBirth: true,
          email: true,
          phoneNumber: true,
          password: true,
          profilePicture: true,
        },
      });

      if (!userEmploye) {
        return c.json(
          {
            status: false,
            pesan: "Id Tidak ditemukan",
            data: null,
          },
          404
        );
      }

      let hashedPassword = userEmploye.password;

      if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
      }

      const updateData = {
        username,
        email,
        password: hashedPassword,
        phoneNumber,
        address,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      };

      const updateUserEmploye = await prisma.user.update({
        where: { id },
        data: updateData,
      });

      return c.json({
        status: true,
        pesan: "Berhasil Update Data",
        data: updateUserEmploye,
      });
    } catch (err) {
      if (err instanceof Error) {
        return c.json({ status: false, pesan: err.message }, 400);
      }

      if (err instanceof Yup.ValidationError) {
        return c.json(
          {
            pesan: "Validasi gagal",
            errors: err.errors,
          },
          400
        );
      }

      return c.json(
        { status: false, pesan: "Terjadi kesalahan tak terduga" },
        500
      );
    }
  },

  async DeleteEmploye(c: Context) {
    try {
      const id = c.req.param("id");

      const userEmploye = await prisma.user.findUnique({
        where: {
          id,
        },
      });

      if (!userEmploye) {
        return c.json(
          {
            status: false,
            pesan: "Id Tidak ditemukan",
            data: null,
          },
          404
        );
      }

      const deleteUserEmploye = await prisma.user.delete({
        where: { id },
      });

      return c.json({
        status: true,
        pesan: "Berhasil Menghapus Data",
        data: deleteUserEmploye,
      });
    } catch (err) {
      if (err instanceof Error) {
        return c.json({ status: false, pesan: err.message }, 400);
      }
      return c.json(
        { status: false, pesan: "Terjadi kesalahan tak terduga" },
        500
      );
    }
  },
};

export default EmployeeController;
