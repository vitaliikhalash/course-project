import type { Card, CardProduct, Currency } from "@/generated/prisma";
import type {
  CardStatus,
  CardTier,
  CardType,
  PaymentSystem,
  SerializedCard,
} from "@/types";
type CardWithProductCurrency = Card & {
  product: CardProduct;
  currency: Currency;
};
export function mapPrismaCardToSerialized(
  card: CardWithProductCurrency,
): SerializedCard {
  return {
    id: card.id,
    userId: card.userId,
    name: card.name,
    type: card.product.type as CardType,
    paymentSystem: card.product.paymentSystem as PaymentSystem,
    tier: card.product.tier as CardTier,
    cardNumber: card.cardNumber,
    iban: card.iban,
    balance: card.balance.toString(),
    currency: card.currencyCode,
    status: card.status as CardStatus,
    createdAt: card.createdAt.toISOString(),
    unfreezeRequestedAt: card.unfreezeRequestedAt
      ? card.unfreezeRequestedAt.toISOString()
      : null,
  };
}
export const cardWithProductSelect = {
  product: true,
  currency: true,
} as const;
