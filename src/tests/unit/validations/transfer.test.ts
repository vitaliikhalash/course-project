import { describe, expect, it } from "vitest";
import { executeTransferSchema } from "@/lib/validations/transfer";
describe("validations/transfer", () => {
  const validCardId = "cmofrjyxo0003jyp8scd7iy7t";
  it("accepts valid card destination payload", () => {
    const parsed = executeTransferSchema.safeParse({
      fromCardId: validCardId,
      destination: "4242424242424242",
      amountStr: "100.55",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.destinationKind).toBe("card");
      expect(parsed.data.amount).toBe(100.55);
    }
  });
  it("accepts valid iban destination payload", () => {
    const parsed = executeTransferSchema.safeParse({
      fromCardId: validCardId,
      destination: "UA123456789012345678901234567",
      amountStr: "500",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.destinationKind).toBe("iban");
      expect(parsed.data.cleanDestination).toBe("UA123456789012345678901234567");
    }
  });
  it("normalizes iban input with spaces and lowercase", () => {
    const parsed = executeTransferSchema.safeParse({
      fromCardId: validCardId,
      destination: " ua12 3456 7890 1234 5678 9012 34567 ",
      amountStr: "10",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.destinationKind).toBe("iban");
      expect(parsed.data.cleanDestination).toBe("UA123456789012345678901234567");
    }
  });
  it("rejects invalid amount boundaries", () => {
    expect(
      executeTransferSchema.safeParse({
        fromCardId: validCardId,
        destination: "4242424242424242",
        amountStr: "0",
      }).success,
    ).toBe(false);
    expect(
      executeTransferSchema.safeParse({
        fromCardId: validCardId,
        destination: "4242424242424242",
        amountStr: "1000001",
      }).success,
    ).toBe(false);
    expect(
      executeTransferSchema.safeParse({
        fromCardId: validCardId,
        destination: "4242424242424242",
        amountStr: "0.01",
      }).success,
    ).toBe(true);
  });
  it("rejects invalid destination format", () => {
    const parsed = executeTransferSchema.safeParse({
      fromCardId: validCardId,
      destination: "invalid-dest",
      amountStr: "10",
    });
    expect(parsed.success).toBe(false);
  });
  it("rejects invalid luhn card number", () => {
    const parsed = executeTransferSchema.safeParse({
      fromCardId: validCardId,
      destination: "4242424242424241",
      amountStr: "10",
    });
    expect(parsed.success).toBe(false);
  });
});
