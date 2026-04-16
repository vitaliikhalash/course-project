import { stripSpaces } from "@/lib/validations/common";
const PENDING_PLACEHOLDER = "—";
export const maskCardShort = (cardNumber: string | null): string => {
  if (!cardNumber) return PENDING_PLACEHOLDER;
  const cleaned = stripSpaces(cardNumber);
  if (cleaned.length < 4) return cardNumber;
  return `•••• ${cleaned.slice(-4)}`;
};
export const maskCardFull = (cardNumber: string | null): string => {
  if (!cardNumber) return PENDING_PLACEHOLDER;
  const cleaned = stripSpaces(cardNumber);
  if (cleaned.length < 8) return cardNumber;
  return `${cleaned.slice(0, 4)} **** **** ${cleaned.slice(-4)}`;
};
export const maskIban = (iban: string | null): string => {
  if (!iban) return PENDING_PLACEHOLDER;
  const cleaned = stripSpaces(iban);
  if (cleaned.length < 8) return iban;
  return `${cleaned.slice(0, 4)} •••• ${cleaned.slice(-4)}`;
};
export const maskIbanLong = (iban: string | null): string => {
  if (!iban) return PENDING_PLACEHOLDER;
  const cleaned = stripSpaces(iban);
  if (cleaned.length < 8) return iban;
  return `${cleaned.slice(0, 4)} •••• ${cleaned.slice(-7)}`;
};
