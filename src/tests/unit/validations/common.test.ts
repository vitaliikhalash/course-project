import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  cuidSchema,
  getFirstZodErrorMessage,
  isUkrainianPhone,
  ukrainianPhoneSchema,
} from "@/lib/validations/common";
describe("validations/common", () => {
  describe("cuidSchema", () => {
    it("accepts valid cuid", () => {
      expect(() => cuidSchema.parse("cmofrjyxo0003jyp8scd7iy7t")).not.toThrow();
    });
    it("rejects invalid cuid", () => {
      const parsed = cuidSchema.safeParse("not-a-cuid");
      expect(parsed.success).toBe(false);
    });
  });
  describe("isUkrainianPhone", () => {
    it("accepts canonical formats", () => {
      expect(isUkrainianPhone("+380996389722")).toBe(true);
      expect(isUkrainianPhone("380996389722")).toBe(true);
      expect(isUkrainianPhone("0996389722")).toBe(true);
    });
    it("accepts formatted numbers", () => {
      expect(isUkrainianPhone("+38 (099) 638-97-22")).toBe(true);
    });
    it("rejects malformed prefix/noise", () => {
      expect(isUkrainianPhone("+0996389722")).toBe(false);
      expect(isUkrainianPhone("-380996389722")).toBe(false);
      expect(isUkrainianPhone("k380+123485678---;")).toBe(false);
    });
  });
  describe("ukrainianPhoneSchema", () => {
    it("returns localized validation error", () => {
      const parsed = ukrainianPhoneSchema.safeParse("abc");
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        expect(parsed.error.issues[0]?.message).toBe(
          "Некоректний номер телефону",
        );
      }
    });
  });
  describe("getFirstZodErrorMessage", () => {
    it("extracts first message", () => {
      const schema = z.object({
        value: z.string().min(2, "Помилка"),
      });
      const parsed = schema.safeParse({
        value: "",
      });
      if (!parsed.success) {
        expect(getFirstZodErrorMessage(parsed.error, "Fallback")).toBe(
          "Помилка",
        );
      }
    });
  });
});
