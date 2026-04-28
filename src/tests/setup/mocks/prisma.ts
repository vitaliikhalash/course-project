import { vi } from "vitest";
export function createPrismaMock() {
  const tx = {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      findUniqueOrThrow: vi.fn(),
    },
    userProfile: {
      findUnique: vi.fn(),
      create: vi.fn(),
      upsert: vi.fn(),
    },
    card: {
      findUnique: vi.fn(),
      findUniqueOrThrow: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    cardProduct: {
      findUnique: vi.fn(),
    },
    transaction: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    systemAuditLog: {
      create: vi.fn(),
    },
  };
  const prisma = {
    ...tx,
    $transaction: vi.fn(async (arg: unknown) => {
      if (typeof arg === "function") {
        return (arg as (transactionClient: typeof tx) => Promise<unknown>)(tx);
      }
      return arg;
    }),
  };
  return {
    prisma,
    tx,
  };
}
export type PrismaMock = ReturnType<typeof createPrismaMock>["prisma"];
