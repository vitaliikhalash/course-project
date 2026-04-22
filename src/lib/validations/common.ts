import { z } from "zod";
export const cuidSchema = z.string().cuid("Некоректний ідентифікатор");
export const trimmedString = z.string().trim();
export const stripSpaces = (value: string): string => value.replace(/\s/g, "");
export const requiredNameSchema = (tooLongMessage: string) =>
  trimmedString.min(1, "Заповніть усі поля").max(60, tooLongMessage);
function normalizeUaPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("380") && digits.length === 12) return digits;
  if (digits.startsWith("0") && digits.length === 10) return `38${digits}`;
  return digits;
}
export function isUkrainianPhone(value: string): boolean {
  const trimmed = value.trim();
  if (!/^(?:\+?\d)[\d\s\-()]*$/.test(trimmed)) {
    return false;
  }
  const digitsOnly = trimmed.replace(/\D/g, "");
  if (trimmed.startsWith("+")) {
    if (!digitsOnly.startsWith("380") || digitsOnly.length !== 12) {
      return false;
    }
  }
  const normalized = normalizeUaPhone(value);
  return /^380\d{9}$/.test(normalized);
}
export const ukrainianPhoneSchema = trimmedString.refine(
  isUkrainianPhone,
  "Некоректний номер телефону",
);
export const requiredUkrainianPhoneSchema = trimmedString
  .min(1, "Заповніть усі поля")
  .refine(isUkrainianPhone, "Некоректний номер телефону");
export const optionalTrimmedString = z.preprocess((value) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}, z.string().nullable());
export const optionalNameSchema = (tooLongMessage: string) =>
  optionalTrimmedString.refine(
    (v) => v == null || v.length <= 60,
    tooLongMessage,
  );
export const optionalUkrainianPhoneSchema = optionalTrimmedString.refine(
  (v) => v == null || isUkrainianPhone(v),
  "Некоректний номер телефону",
);
export function getFirstZodErrorMessage(
  error: z.ZodError,
  fallback: string,
): string {
  const first = error.issues[0];
  return first?.message ?? fallback;
}
