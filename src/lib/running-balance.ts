export interface TxForBalance {
  id: string;
  isOutgoing: boolean;
  fromCardId: string;
  toCardId: string | null;
  amount: string;
}
export function computeRunningBalances(
  transactions: TxForBalance[],
  cardBalances: Map<string, number>,
): Map<string, number> {
  const running = new Map(cardBalances);
  const result = new Map<string, number>();
  for (const tx of transactions) {
    const cardId = tx.isOutgoing ? tx.fromCardId : tx.toCardId;
    if (!cardId || !running.has(cardId)) continue;
    const amount = Math.abs(parseFloat(tx.amount));
    const balanceAfter = running.get(cardId)!;
    result.set(tx.id, Math.round(balanceAfter * 100) / 100);
    if (tx.isOutgoing) {
      running.set(cardId, balanceAfter + amount);
    } else {
      running.set(cardId, balanceAfter - amount);
    }
  }
  return result;
}
