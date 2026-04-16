import { generateLuhnCardNumberWithPrefix } from "@/lib/luhn";
import type { PaymentSystem } from "@/types";
const MC_PREFIXES = ["51", "52", "53", "54", "55"] as const;
export function generateCardNumberForSystem(system: PaymentSystem): string {
  if (system === "VISA") {
    return generateLuhnCardNumberWithPrefix("4");
  }
  const prefix = MC_PREFIXES[Math.floor(Math.random() * MC_PREFIXES.length)];
  return generateLuhnCardNumberWithPrefix(prefix);
}
export function generateIban(): string {
  const digits = Array.from(
    {
      length: 27,
    },
    () => Math.floor(Math.random() * 10),
  ).join("");
  return `UA${digits}`;
}
