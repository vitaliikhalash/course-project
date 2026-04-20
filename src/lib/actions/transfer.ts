"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { Prisma } from "@/generated/prisma";
import { logAuditEvent } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { getFirstZodErrorMessage } from "@/lib/validations/common";
import { executeTransferSchema } from "@/lib/validations/transfer";
export async function executeTransfer(
  fromCardId: string,
  destination: string,
  amountStr: string,
) {
  const session = await auth();
  if (!session?.user?.id)
    return {
      success: false,
      error: "Unauthorized",
    };
  const parsed = executeTransferSchema.safeParse({
    fromCardId,
    destination,
    amountStr,
  });
  if (!parsed.success) {
    return {
      success: false,
      error: getFirstZodErrorMessage(parsed.error, "Помилка переказу"),
    };
  }
  const { amount, cleanDestination, destinationKind } = parsed.data;
  const amountDec = new Prisma.Decimal(amount);
  const recipientWhere =
    destinationKind === "card"
      ? {
          cardNumber: cleanDestination,
        }
      : {
          iban: cleanDestination,
        };
  let recipientCardId = "";
  let recipientUserId = "";
  let isOwnCard = false;
  try {
    await prisma.$transaction(
      async (tx) => {
        const recipientCard = await tx.card.findFirst({
          where: recipientWhere,
        });
        if (!recipientCard) {
          throw new Error("Картку отримувача не знайдено в системі");
        }
        if (recipientCard.status === "FROZEN") {
          throw new Error(
            "Неможливо надіслати кошти: картка отримувача заблокована",
          );
        }
        if (recipientCard.status !== "ACTIVE") {
          throw new Error(
            "Неможливо надіслати кошти: картка отримувача не є активною",
          );
        }
        const senderCard = await tx.card.findFirst({
          where: {
            id: fromCardId,
            userId: session.user.id,
          },
        });
        if (!senderCard) {
          throw new Error("Картку відправника не знайдено");
        }
        if (senderCard.status === "FROZEN") {
          throw new Error("Картка відправника тимчасово призупинена");
        }
        if (senderCard.status !== "ACTIVE") {
          throw new Error("Картка відправника не є активною");
        }
        if (senderCard.id === recipientCard.id) {
          throw new Error("Не можна переказати кошти на ту саму картку");
        }
        const debited = await tx.card.updateMany({
          where: {
            id: fromCardId,
            userId: session.user.id,
            status: "ACTIVE",
            balance: {
              gte: amountDec,
            },
          },
          data: {
            balance: {
              decrement: amount,
            },
          },
        });
        if (debited.count !== 1) {
          throw new Error("Недостатньо коштів");
        }
        await tx.card.update({
          where: {
            id: recipientCard.id,
          },
          data: {
            balance: {
              increment: amount,
            },
          },
        });
        recipientCardId = recipientCard.id;
        recipientUserId = recipientCard.userId;
        isOwnCard = recipientCard.userId === session.user.id;
        const now = new Date();
        const debitAmount = amountDec.negated();
        const creditAmount = amountDec;
        await tx.transaction.create({
          data: {
            userId: session.user.id,
            amount: debitAmount,
            fromCardId: fromCardId,
            toCardId: recipientCard.id,
            currencyCode: "UAH",
            name: isOwnCard
              ? "Переказ коштів на свою картку"
              : "Переказ коштів",
            category: "Перекази",
            status: "COMPLETED",
            time: now,
          },
        });
        await tx.transaction.create({
          data: {
            userId: recipientCard.userId,
            amount: creditAmount,
            fromCardId: fromCardId,
            toCardId: recipientCard.id,
            currencyCode: "UAH",
            name: isOwnCard
              ? "Отримання коштів зі своєї картки"
              : "Отримання коштів",
            category: "Перекази",
            status: "COMPLETED",
            time: now,
          },
        });
      },
      {
        maxWait: 5_000,
        timeout: 10_000,
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
    void logAuditEvent("transfer", session.user.id, {
      fromCardId,
      toCardId: recipientCardId,
      toUserId: recipientUserId,
      amount,
      destinationKind,
      destination: cleanDestination,
      isOwnCard,
    }).catch(() => undefined);
    revalidatePath("/");
    revalidatePath("/wallet");
    revalidatePath("/transfers");
    return {
      success: true,
    };
  } catch (error: unknown) {
    const KNOWN_MESSAGES = new Set([
      "Картку отримувача не знайдено в системі",
      "Картку відправника не знайдено",
      "Картка відправника тимчасово призупинена",
      "Картка відправника не є активною",
      "Неможливо надіслати кошти: картка отримувача заблокована",
      "Неможливо надіслати кошти: картка отримувача не є активною",
      "Не можна переказати кошти на ту саму картку",
      "Недостатньо коштів",
    ]);
    const rawMsg = error instanceof Error ? error.message : "";
    const errorMessage = KNOWN_MESSAGES.has(rawMsg)
      ? rawMsg
      : "Помилка переказу";
    return {
      success: false,
      error: errorMessage,
    };
  }
}
