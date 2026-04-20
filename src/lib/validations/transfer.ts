import { z } from "zod";
import { luhnCheck } from "@/lib/luhn";
import { cuidSchema, stripSpaces } from "@/lib/validations/common";
const MIN_AMOUNT = 0.01;
const MAX_AMOUNT = 1_000_000;
export const executeTransferSchema = z
  .object({
    fromCardId: cuidSchema,
    destination: z.string().min(1, "Некоректний формат реквізиту"),
    amountStr: z.string().min(1, "Некоректна сума"),
  })
  .transform(({ fromCardId, destination, amountStr }) => {
    const cleanDestination = stripSpaces(destination).toUpperCase();
    const rawAmount = Number(amountStr.trim());
    const amount = Math.round(rawAmount * 100) / 100;
    const isCardNumber = /^\d{13,19}$/.test(cleanDestination);
    const isIban = /^UA\d{27}$/.test(cleanDestination);
    return {
      fromCardId,
      amount,
      cleanDestination,
      destinationKind: isCardNumber ? "card" : isIban ? "iban" : "unknown",
      isCardNumber,
      isIban,
    };
  })
  .superRefine((data, ctx) => {
    if (!Number.isFinite(data.amount) || data.amount <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Некоректна сума",
        path: ["amountStr"],
      });
      return;
    }
    if (data.amount < MIN_AMOUNT) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Мінімальна сума переказу — ${MIN_AMOUNT.toFixed(2)} грн`,
        path: ["amountStr"],
      });
      return;
    }
    if (data.amount > MAX_AMOUNT) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Максимальна сума одного переказу — ${MAX_AMOUNT.toLocaleString("uk-UA")} грн`,
        path: ["amountStr"],
      });
      return;
    }
    if (!data.isCardNumber && !data.isIban) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Некоректний формат реквізиту",
        path: ["destination"],
      });
      return;
    }
    if (data.isCardNumber && !luhnCheck(data.cleanDestination)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Некоректний номер картки",
        path: ["destination"],
      });
    }
  });
