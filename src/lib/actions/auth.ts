"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerUserFormSchema } from "@/lib/validations/auth";
import { getFirstZodErrorMessage } from "@/lib/validations/common";
export async function registerUser(formData: FormData) {
  const parsed = registerUserFormSchema.safeParse({
    firstName: (formData.get("firstName") as string | null) ?? "",
    lastName: (formData.get("lastName") as string | null) ?? "",
    phoneNumber: (formData.get("phoneNumber") as string | null) ?? "",
    email: (formData.get("email") as string | null) ?? "",
    password: (formData.get("password") as string | null) ?? "",
  });
  if (!parsed.success) {
    return {
      success: false,
      error: getFirstZodErrorMessage(parsed.error, "Заповніть усі поля"),
    };
  }
  const { firstName, lastName, phoneNumber, email, password } = parsed.data;
  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (existingUser) {
      return {
        success: false,
        error: "Користувач з таким email вже існує",
      };
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        userProfile: {
          create: {
            firstName,
            lastName,
            phoneNumber,
          },
        },
      },
    });
    return {
      success: true,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: message,
    };
  }
}
