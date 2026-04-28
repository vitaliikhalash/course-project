import { describe, expect, it } from "vitest";
import { cardIdSchema, requestCardSchema } from "@/lib/validations/card";
describe("validations/card", () => {
  it("accepts valid card request payload", () => {
    const parsed = requestCardSchema.safeParse({
      name: "Картка Універсальна",
      type: "UNIVERSAL",
      paymentSystem: "VISA",
      tier: "STANDARD",
    });
    expect(parsed.success).toBe(true);
  });
  it("rejects empty and oversized card name", () => {
    expect(
      requestCardSchema.safeParse({
        name: "",
        type: "UNIVERSAL",
        paymentSystem: "VISA",
        tier: "STANDARD",
      }).success,
    ).toBe(false);
    expect(
      requestCardSchema.safeParse({
        name: "a".repeat(81),
        type: "UNIVERSAL",
        paymentSystem: "VISA",
        tier: "STANDARD",
      }).success,
    ).toBe(false);
  });
  it("rejects invalid enums", () => {
    const parsed = requestCardSchema.safeParse({
      name: "Card",
      type: "SOMETHING",
      paymentSystem: "MIR",
      tier: "PLATINUM",
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["type"],
            message: "Некоректний тип картки",
          }),
          expect.objectContaining({
            path: ["paymentSystem"],
            message: "Некоректна платіжна система",
          }),
          expect.objectContaining({
            path: ["tier"],
            message: "Некоректний рівень картки",
          }),
        ]),
      );
    }
  });
  it("rejects whitespace-only name after trim", () => {
    const parsed = requestCardSchema.safeParse({
      name: "   ",
      type: "UNIVERSAL",
      paymentSystem: "VISA",
      tier: "STANDARD",
    });
    expect(parsed.success).toBe(false);
  });
  it("cardId schema validates cuid only", () => {
    expect(cardIdSchema.safeParse("cmofrjyxo0003jyp8scd7iy7t").success).toBe(
      true,
    );
    expect(cardIdSchema.safeParse("123").success).toBe(false);
  });
});
