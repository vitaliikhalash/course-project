import { describe, expect, it } from "vitest";
import {
  maskCardFull,
  maskCardShort,
  maskIban,
  maskIbanLong,
} from "@/lib/card-mask";
describe("lib/cardMask", () => {
  it("returns placeholder for null card and iban", () => {
    expect(maskCardShort(null)).toBe("—");
    expect(maskCardFull(null)).toBe("—");
    expect(maskIban(null)).toBe("—");
    expect(maskIbanLong(null)).toBe("—");
  });
  it("masks card values correctly", () => {
    expect(maskCardShort("4242 4242 4242 4242")).toBe("•••• 4242");
    expect(maskCardFull("4242424242424242")).toBe("4242 **** **** 4242");
  });
  it("masks iban values correctly", () => {
    expect(maskIban("UA1234567890")).toBe("UA12 •••• 7890");
    expect(maskIbanLong("UA123456789012345678901234567")).toBe(
      "UA12 •••• 1234567",
    );
  });
});
