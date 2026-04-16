import { prisma } from "@/lib/prisma";
import type { CardTier, CardType, PaymentSystem } from "@/types";
export async function getCardProductId(
  type: CardType,
  tier: CardTier,
  paymentSystem: PaymentSystem,
): Promise<string> {
  const product = await prisma.cardProduct.findUnique({
    where: {
      type_tier_paymentSystem: {
        type,
        tier,
        paymentSystem,
      },
    },
  });
  if (!product) {
    throw new Error(
      "cardProductLookup: no catalog row for type/tier/paymentSystem",
    );
  }
  return product.id;
}
