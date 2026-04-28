import { describe, expect, it } from "vitest";
import { updateProfileFormSchema } from "@/lib/validations/profile";
describe("validations/profile", () => {
  it("accepts null/empty optional fields", () => {
    const parsed = updateProfileFormSchema.safeParse({
      firstName: "",
      lastName: null,
      phoneNumber: "   ",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.firstName).toBeNull();
      expect(parsed.data.phoneNumber).toBeNull();
    }
  });
  it("rejects too long names", () => {
    const parsed = updateProfileFormSchema.safeParse({
      firstName: "a".repeat(61),
      lastName: "b".repeat(61),
      phoneNumber: null,
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["firstName"],
            message: "Ім'я задовге",
          }),
          expect.objectContaining({
            path: ["lastName"],
            message: "Прізвище задовге",
          }),
        ]),
      );
    }
  });
  it("rejects invalid phone format when provided", () => {
    const parsed = updateProfileFormSchema.safeParse({
      firstName: "John",
      lastName: "Doe",
      phoneNumber: "+0996389722",
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(
        parsed.error.issues.some(
          (i) => i.message === "Некоректний номер телефону",
        ),
      ).toBe(true);
    }
  });
  it("coerces non-string optional fields to null", () => {
    const parsed = updateProfileFormSchema.safeParse({
      firstName: 123,
      lastName: {},
      phoneNumber: false,
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).toEqual({
        firstName: null,
        lastName: null,
        phoneNumber: null,
      });
    }
  });
});
