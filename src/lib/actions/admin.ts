"use server";

import { revalidatePath } from "next/cache";
import type { Session } from "next-auth";
import { auth } from "@/auth";
import { Prisma } from "@/generated/prisma";
import {
  generateCardNumberForSystem,
  generateIban,
} from "@/lib/card-generator";
import { prisma } from "@/lib/prisma";
import {
  setCardStatusInputSchema,
  setUserRoleInputSchema,
} from "@/lib/validations/admin";
import { parseCardId } from "@/lib/validations/card";
function assertCardModerator(
  session: Session | null,
): asserts session is Session {
  if (
    !session?.user?.id ||
    (session.user.role !== "ADMIN" && session.user.role !== "OWNER")
  ) {
    throw new Error("Forbidden");
  }
}
function isCardIdentifierConflict(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }
  const maybeKnown = error as {
    code?: string;
    meta?: {
      target?: unknown;
    };
  };
  if (maybeKnown.code !== "P2002") {
    return false;
  }
  const target = maybeKnown.meta?.target;
  if (Array.isArray(target)) {
    return target.some((field) => field === "cardNumber" || field === "iban");
  }
  if (typeof target === "string") {
    return target.includes("cardNumber") || target.includes("iban");
  }
  return false;
}
export async function setUserRole(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "OWNER") {
    throw new Error("Unauthorized");
  }
  const parsed = setUserRoleInputSchema.safeParse({
    targetUserId: formData.get("targetUserId"),
    newRole: formData.get("newRole"),
  });
  if (!parsed.success) {
    return;
  }
  if (parsed.data.targetUserId === session.user.id) {
    throw new Error("Unauthorized");
  }
  await prisma.user.update({
    where: {
      id: parsed.data.targetUserId,
    },
    data: {
      role: parsed.data.newRole,
    },
  });
  revalidatePath("/admin");
}
export async function approveCard(cardId: string): Promise<void> {
  const session = await auth();
  assertCardModerator(session);
  const validCardId = parseCardId(cardId);
  if (!validCardId) {
    return;
  }
  const pending = await prisma.card.findUniqueOrThrow({
    where: {
      id: validCardId,
    },
    include: {
      product: true,
    },
  });
  if (pending.status !== "PENDING") {
    return;
  }
  const maxRetries = 5;
  for (let attempt = 0; attempt < maxRetries; attempt += 1) {
    const cardNumber = generateCardNumberForSystem(
      pending.product.paymentSystem,
    );
    const iban = generateIban();
    try {
      await prisma.$transaction([
        prisma.card.update({
          where: {
            id: validCardId,
          },
          data: {
            cardNumber,
            iban,
            status: "ACTIVE",
          },
        }),
        prisma.systemAuditLog.create({
          data: {
            action: "APPROVE_CARD",
            entityType: "Card",
            entityId: validCardId,
            userId: session.user.id,
            details: {
              newStatus: "ACTIVE",
            } as Prisma.InputJsonValue,
          },
        }),
      ]);
      revalidatePath("/admin");
      revalidatePath("/wallet");
      return;
    } catch (error) {
      if (isCardIdentifierConflict(error)) {
        if (attempt === maxRetries - 1) {
          throw new Error(
            "Failed to generate unique identifiers after multiple attempts",
          );
        }
        continue;
      }
      throw error;
    }
  }
  throw new Error(
    "Failed to generate unique identifiers after multiple attempts",
  );
}
export async function rejectCard(cardId: string): Promise<void> {
  const session = await auth();
  assertCardModerator(session);
  const validCardId = parseCardId(cardId);
  if (!validCardId) {
    return;
  }
  const card = await prisma.card.findUniqueOrThrow({
    where: {
      id: validCardId,
    },
    select: {
      status: true,
    },
  });
  if (card.status !== "PENDING") {
    return;
  }
  await prisma.$transaction([
    prisma.card.update({
      where: {
        id: validCardId,
      },
      data: {
        status: "REJECTED",
      },
    }),
    prisma.systemAuditLog.create({
      data: {
        action: "REJECT_CARD",
        entityType: "Card",
        entityId: validCardId,
        userId: session.user.id,
        details: {
          newStatus: "REJECTED",
        } as Prisma.InputJsonValue,
      },
    }),
  ]);
  revalidatePath("/admin");
  revalidatePath("/wallet");
}
export async function unfreezeCard(cardId: string): Promise<void> {
  const session = await auth();
  assertCardModerator(session);
  const validCardId = parseCardId(cardId);
  if (!validCardId) {
    return;
  }
  const card = await prisma.card.findUniqueOrThrow({
    where: {
      id: validCardId,
    },
    select: {
      status: true,
    },
  });
  if (card.status !== "FROZEN") {
    return;
  }
  await prisma.$transaction([
    prisma.card.update({
      where: {
        id: validCardId,
      },
      data: {
        status: "ACTIVE",
        unfreezeRequestedAt: null,
      },
    }),
    prisma.systemAuditLog.create({
      data: {
        action: "UNFREEZE_CARD",
        entityType: "Card",
        entityId: validCardId,
        userId: session.user.id,
        details: {
          newStatus: "ACTIVE",
        } as Prisma.InputJsonValue,
      },
    }),
  ]);
  revalidatePath("/admin");
  revalidatePath("/wallet");
  revalidatePath("/transfers");
}
export async function cancelUnfreezeRequest(cardId: string): Promise<void> {
  const session = await auth();
  assertCardModerator(session);
  const validCardId = parseCardId(cardId);
  if (!validCardId) {
    return;
  }
  const card = await prisma.card.findUniqueOrThrow({
    where: {
      id: validCardId,
    },
    select: {
      status: true,
      unfreezeRequestedAt: true,
    },
  });
  if (card.status !== "FROZEN" || !card.unfreezeRequestedAt) {
    return;
  }
  await prisma.$transaction([
    prisma.card.update({
      where: {
        id: validCardId,
      },
      data: {
        unfreezeRequestedAt: null,
      },
    }),
    prisma.systemAuditLog.create({
      data: {
        action: "CANCEL_UNFREEZE_REQUEST",
        entityType: "Card",
        entityId: validCardId,
        userId: session.user.id,
        details: {
          cleared: true,
        } as Prisma.InputJsonValue,
      },
    }),
  ]);
  revalidatePath("/admin");
  revalidatePath("/wallet");
}
export async function freezeCard(cardId: string): Promise<void> {
  const session = await auth();
  assertCardModerator(session);
  const validCardId = parseCardId(cardId);
  if (!validCardId) {
    return;
  }
  const card = await prisma.card.findUnique({
    where: {
      id: validCardId,
    },
    select: {
      status: true,
    },
  });
  if (!card || card.status !== "ACTIVE") {
    return;
  }
  await prisma.$transaction([
    prisma.card.update({
      where: {
        id: validCardId,
      },
      data: {
        status: "FROZEN",
        unfreezeRequestedAt: null,
      },
    }),
    prisma.systemAuditLog.create({
      data: {
        action: "FREEZE_CARD",
        entityType: "Card",
        entityId: validCardId,
        userId: session.user.id,
        details: {
          newStatus: "FROZEN",
        } as Prisma.InputJsonValue,
      },
    }),
  ]);
  revalidatePath("/admin");
  revalidatePath("/wallet");
  revalidatePath("/transfers");
}
async function holdPendingCardAsFrozen(cardId: string): Promise<void> {
  const session = await auth();
  assertCardModerator(session);
  const validCardId = parseCardId(cardId);
  if (!validCardId) {
    return;
  }
  const card = await prisma.card.findUnique({
    where: {
      id: validCardId,
    },
    select: {
      status: true,
    },
  });
  if (!card || card.status !== "PENDING") {
    return;
  }
  await prisma.$transaction([
    prisma.card.update({
      where: {
        id: validCardId,
      },
      data: {
        status: "FROZEN",
        unfreezeRequestedAt: null,
      },
    }),
    prisma.systemAuditLog.create({
      data: {
        action: "HOLD_PENDING_CARD",
        entityType: "Card",
        entityId: validCardId,
        userId: session.user.id,
        details: {
          newStatus: "FROZEN",
        } as Prisma.InputJsonValue,
      },
    }),
  ]);
  revalidatePath("/admin");
  revalidatePath("/wallet");
}
export async function setCardStatus(formData: FormData): Promise<void> {
  const session = await auth();
  assertCardModerator(session);
  const parsed = setCardStatusInputSchema.safeParse({
    cardId: formData.get("cardId"),
    newStatus: formData.get("newStatus"),
  });
  if (!parsed.success) {
    return;
  }
  const { cardId, newStatus } = parsed.data;
  const validCardId = parseCardId(cardId);
  if (!validCardId) {
    return;
  }
  const card = await prisma.card.findUnique({
    where: {
      id: validCardId,
    },
    select: {
      status: true,
    },
  });
  if (!card) {
    return;
  }
  if (card.status === newStatus) {
    return;
  }
  if (card.status === "PENDING" && newStatus === "ACTIVE") {
    await approveCard(cardId);
    return;
  }
  if (card.status === "PENDING" && newStatus === "REJECTED") {
    await rejectCard(cardId);
    return;
  }
  if (card.status === "PENDING" && newStatus === "FROZEN") {
    await holdPendingCardAsFrozen(cardId);
    return;
  }
  if (card.status === "ACTIVE" && newStatus === "FROZEN") {
    await freezeCard(cardId);
    return;
  }
  if (card.status === "FROZEN" && newStatus === "ACTIVE") {
    await unfreezeCard(cardId);
    return;
  }
}
