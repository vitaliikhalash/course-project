export type CardStatus = "PENDING" | "ACTIVE" | "REJECTED" | "FROZEN";
export type CardType = "DIGITAL" | "UNIVERSAL";
export type PaymentSystem = "VISA" | "MASTERCARD";
export type CardTier = "STANDARD" | "GOLD";
export interface Card {
  id: string;
  name: string;
  type: CardType;
  paymentSystem: PaymentSystem;
  tier: CardTier;
  cardNumber: string | null;
  iban: string | null;
  balance: number;
  currency: string;
  status: CardStatus;
  unfreezeRequestedAt: string | null;
}
export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED";
export interface Transaction {
  id: string;
  name: string;
  amount: string;
  time: string;
  timeOnly: string;
  dateKey: string;
  fromCardId: string;
  toCardId: string | null;
  status: TransactionStatus;
  isOutgoing: boolean;
  balanceAfter: number | null;
  counterpartyCardNumber: string | null;
  counterpartyIban: string | null;
}
export type TransferTarget = "own" | "external";
export interface SerializedCard {
  id: string;
  userId: string;
  name: string;
  type: CardType;
  paymentSystem: PaymentSystem;
  tier: CardTier;
  cardNumber: string | null;
  iban: string | null;
  balance: string;
  currency: string;
  status: CardStatus;
  createdAt: string;
  unfreezeRequestedAt: string | null;
}
export interface SerializedTransaction {
  id: string;
  userId: string;
  name: string;
  amount: string;
  currency: string;
  time: string;
  fromCardId: string;
  toCardId: string | null;
  toExternal: string | null;
  status: TransactionStatus;
  isOutgoing: boolean;
  balanceAfter: number | null;
  counterpartyCardNumber: string | null;
  counterpartyIban: string | null;
}
export const toCard = (s: SerializedCard): Card => ({
  id: s.id,
  name: s.name,
  type: s.type,
  paymentSystem: s.paymentSystem,
  tier: s.tier,
  cardNumber: s.cardNumber,
  iban: s.iban,
  balance: parseFloat(s.balance),
  currency: s.currency,
  status: s.status,
  unfreezeRequestedAt: s.unfreezeRequestedAt,
});
export const toTransaction = (s: SerializedTransaction): Transaction => {
  const date = new Date(s.time);
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const dateKey = `${y}-${mo}-${d}`;
  const timeOnly = date.toLocaleTimeString("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const absAmount = Math.abs(parseFloat(s.amount));
  return {
    id: s.id,
    name: s.name,
    amount: `${s.isOutgoing ? "−" : "+"}${absAmount.toFixed(2)} ${s.currency}`,
    time: date.toLocaleString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    timeOnly,
    dateKey,
    fromCardId: s.fromCardId,
    toCardId: s.toCardId,
    status: s.status,
    isOutgoing: s.isOutgoing,
    balanceAfter: s.balanceAfter,
    counterpartyCardNumber: s.counterpartyCardNumber,
    counterpartyIban: s.counterpartyIban,
  };
};
