import type { Card, Transaction } from "@/types";
export function resolveDisplayName(
  tx: Transaction,
  selectedCard?: Card | null,
): string {
  const isOwnOut = tx.name === "Переказ коштів на свою картку";
  const isOwnIn = tx.name === "Отримання коштів зі своєї картки";
  if (selectedCard || (!isOwnOut && !isOwnIn)) return tx.name;
  const last4 = tx.counterpartyCardNumber?.slice(-4) ?? "****";
  return isOwnOut ? `На свою картку *${last4}` : `Зі своєї картки *${last4}`;
}
