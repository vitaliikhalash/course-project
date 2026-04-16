"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { getCardProductId } from "@/lib/card-product-lookup";
import { prisma } from "@/lib/prisma";
import { parseCardId, requestCardSchema } from "@/lib/validations/card";
import { getFirstZodErrorMessage } from "@/lib/validations/common";
import type { CardType, CardTier, PaymentSystem } from "@/types";
export async function requestCard(input: {
  name: string;
  type: CardType;
  paymentSystem: PaymentSystem;
  tier: CardTier;
}): Promise<
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    }
> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: "Потрібен вхід у систему",
    };
  }
  const parsed = requestCardSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: getFirstZodErrorMessage(parsed.error, "Некоректні дані заявки"),
    };
  }
  const validInput = parsed.data;
  try {
    const productId = await getCardProductId(
      validInput.type,
      validInput.tier,
      validInput.paymentSystem,
    );
    await prisma.card.create({
      data: {
        userId: session.user.id,
        name: validInput.name,
        productId,
        currencyCode: "UAH",
        status: "PENDING",
      },
    });
    revalidatePath("/wallet");
    return {
      success: true,
    };
  } catch {
    return {
      success: false,
      error: "Не вдалося подати заявку",
    };
  }
}
export async function requestUnfreezeCard(cardId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  const validCardId = parseCardId(cardId);
  if (!validCardId) {
    return;
  }
  const card = await prisma.card.findFirst({
    where: {
      id: validCardId,
      userId: session.user.id,
    },
    select: {
      id: true,
      status: true,
    },
  });
  if (!card || card.status !== "FROZEN") {
    return;
  }
  await prisma.card.update({
    where: {
      id: validCardId,
    },
    data: {
      unfreezeRequestedAt: new Date(),
    },
  });
  revalidatePath("/wallet");
  revalidatePath("/admin");
}
