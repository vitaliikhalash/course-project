import HomeClient from "./home-client";
import { auth } from "@/auth";
import {
  cardWithProductSelect,
  mapPrismaCardToSerialized,
} from "@/lib/map-prisma-card-to-serialized";
import { prisma } from "@/lib/prisma";
import { computeRunningBalances } from "@/lib/running-balance";
import {
  SerializedCard,
  SerializedTransaction,
  TransactionStatus,
} from "@/types";
export default async function HomePage() {
  const session = await auth();
  let cards: SerializedCard[] = [];
  let transactions: SerializedTransaction[] = [];
  if (session?.user?.id) {
    const dbCards = await prisma.card.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: cardWithProductSelect,
    });
    cards = dbCards.map(mapPrismaCardToSerialized);
    const dbTransactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        time: "desc",
      },
      take: 10,
    });
    const cardBalanceMap = new Map(
      dbCards.map((c) => [c.id, Number(c.balance)]),
    );
    const cpIds = new Set(
      dbTransactions.flatMap((t) => {
        const isOut = !t.name.startsWith("Отримання");
        const cpId = isOut ? t.toCardId : t.fromCardId;
        return cpId ? [cpId] : [];
      }),
    );
    const cpCards = cpIds.size
      ? await prisma.card.findMany({
          where: {
            id: {
              in: Array.from(cpIds),
            },
          },
          select: {
            id: true,
            cardNumber: true,
            iban: true,
          },
        })
      : [];
    const cpCardMap = new Map(cpCards.map((c) => [c.id, c]));
    const balanceAfterMap = computeRunningBalances(
      dbTransactions.map((t) => ({
        id: t.id,
        isOutgoing: !t.name.startsWith("Отримання"),
        fromCardId: t.fromCardId,
        toCardId: t.toCardId,
        amount: t.amount.toString(),
      })),
      cardBalanceMap,
    );
    transactions = dbTransactions.map((t) => {
      const isOut = !t.name.startsWith("Отримання");
      const cpId = isOut ? t.toCardId : t.fromCardId;
      const cp = cpId ? cpCardMap.get(cpId) : undefined;
      return {
        id: t.id,
        userId: t.userId,
        name: t.name,
        amount: t.amount.toString(),
        currency: t.currencyCode,
        time: t.time.toISOString(),
        fromCardId: t.fromCardId,
        toCardId: t.toCardId,
        toExternal: t.toExternal,
        status: t.status as TransactionStatus,
        isOutgoing: isOut,
        balanceAfter: balanceAfterMap.get(t.id) ?? null,
        counterpartyCardNumber: cp?.cardNumber ?? null,
        counterpartyIban: cp?.iban ?? null,
      };
    });
  }
  return <HomeClient initialCards={cards} initialTransactions={transactions} />;
}
