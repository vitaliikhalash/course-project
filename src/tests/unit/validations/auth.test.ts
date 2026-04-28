import { describe, expect, it } from "vitest";
import {
  credentialsSchema,
  registerUserFormSchema,
} from "@/lib/validations/auth";
describe("validations/auth", () => {
  it("accepts valid registration payload", () => {
    const parsed = registerUserFormSchema.safeParse({
      firstName: "John",
      lastName: "Doe",
      phoneNumber: "+380996389722",
      email: "john.doe@gmail.com",
      password: "secret123",
    });
    expect(parsed.success).toBe(true);
  });
  it("rejects missing registration fields", () => {
    const parsed = registerUserFormSchema.safeParse({
      firstName: "",
      lastName: "Doe",
      phoneNumber: "",
      email: "",
      password: "",
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0]?.message).toBe("Заповніть усі поля");
    }
  });
  it("rejects invalid email and phone", () => {
    const parsed = registerUserFormSchema.safeParse({
      firstName: "John",
      lastName: "Doe",
      phoneNumber: "+0996389722",
      email: "wrong-mail",
      password: "secret123",
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["phoneNumber"],
            message: "Некоректний номер телефону",
          }),
          expect.objectContaining({
            path: ["email"],
            message: "Некоректний email",
          }),
        ]),
      );
    }
  });
  it("rejects registration first name longer than 60 chars", () => {
    const parsed = registerUserFormSchema.safeParse({
      firstName: "a".repeat(61),
      lastName: "Doe",
      phoneNumber: "+380996389722",
      email: "john.doe@gmail.com",
      password: "secret123",
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0]).toMatchObject({
        path: ["firstName"],
        message: "Ім'я задовге",
      });
    }
  });
  it("accepts valid credentials", () => {
    expect(
      credentialsSchema.safeParse({
        email: "admin@minibank.test",
        password: "123456",
      }).success,
    ).toBe(true);
  });
  it("rejects invalid credentials input", () => {
    const parsed = credentialsSchema.safeParse({
      email: "   ",
      password: "",
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["email"],
            message: "Вкажіть email",
          }),
          expect.objectContaining({
            path: ["password"],
            message: "Вкажіть пароль",
          }),
        ]),
      );
    }
  });
});
