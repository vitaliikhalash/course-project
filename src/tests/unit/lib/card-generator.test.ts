import { describe, expect, it } from "vitest";
import {
  generateCardNumberForSystem,
  generateIban,
} from "@/lib/card-generator";
import { luhnCheck } from "@/lib/luhn";
describe("lib/cardGenerator", () => {
  it("generates Luhn-valid VISA card number", () => {
    const card = generateCardNumberForSystem("VISA");
    expect(card).toMatch(/^4\d{15}$/);
    expect(luhnCheck(card)).toBe(true);
  });
  it("generates Luhn-valid Mastercard card number in 51-55 range", () => {
    const card = generateCardNumberForSystem("MASTERCARD");
    expect(card).toMatch(/^5[1-5]\d{14}$/);
    expect(luhnCheck(card)).toBe(true);
  });
  it("generates UA iban with 27 digits after prefix", () => {
    const iban = generateIban();
    expect(iban).toMatch(/^UA\d{27}$/);
    expect(iban.length).toBe(29);
  });
});
