import { z } from "zod";
import { cuidSchema, trimmedString } from "@/lib/validations/common";
const cardTypeSchema = z.enum(["DIGITAL", "UNIVERSAL"], {
  error: "Некоректний тип картки",
});
const paymentSystemSchema = z.enum(["VISA", "MASTERCARD"], {
  error: "Некоректна платіжна система",
});
const cardTierSchema = z.enum(["STANDARD", "GOLD"], {
  error: "Некоректний рівень картки",
});
export const requestCardSchema = z.object({
  name: trimmedString
    .min(1, "Вкажіть назву картки")
    .max(80, "Назва картки задовга"),
  type: cardTypeSchema,
  paymentSystem: paymentSystemSchema,
  tier: cardTierSchema,
});
export const cardIdSchema = cuidSchema;
export function parseCardId(cardId: string): string | null {
  const parsedCardId = cardIdSchema.safeParse(cardId);
  return parsedCardId.success ? parsedCardId.data : null;
}
