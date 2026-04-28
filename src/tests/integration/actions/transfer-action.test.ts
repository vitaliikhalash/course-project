import { beforeEach, describe, expect, it, vi } from "vitest";
import { fixtures } from "@/tests/setup/fixtures";
import { authMock } from "@/tests/setup/mocks/auth";
import { revalidatePathMock } from "@/tests/setup/mocks/navigation";
const mocks = vi.hoisted(() => ({
  prisma: {
    $transaction: vi.fn(),
  },
  logAuditEventMock: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: mocks.prisma,
}));
vi.mock("@/auth", () => ({
  auth: authMock,
}));
vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));
vi.mock("@/lib/audit", () => ({
  logAuditEvent: mocks.logAuditEventMock,
}));
import { executeTransfer } from "@/lib/actions/transfer";
describe("actions/transfer.executeTransfer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.logAuditEventMock.mockResolvedValue(undefined);
  });
  it("returns Unauthorized without session", async () => {
    authMock.mockResolvedValue(null);
    const result = await executeTransfer("x", "4242424242424242", "10");
    expect(result).toEqual({
      success: false,
      error: "Unauthorized",
    });
  });
  it("returns schema error for invalid amount", async () => {
    authMock.mockResolvedValue({
      user: {
        id: fixtures.user.id,
      },
    });
    const result = await executeTransfer(
      "cmofrjyxo0003jyp8scd7iy7t",
      "4242424242424242",
      "0",
    );
    expect(result).toEqual({
      success: false,
      error: "Некоректна сума",
    });
  });
  it("executes successful transfer path and revalidates", async () => {
    authMock.mockResolvedValue({
      user: {
        id: fixtures.user.id,
      },
    });
    const findFirst = vi
      .fn()
      .mockResolvedValueOnce(fixtures.cards.activeRecipient)
      .mockResolvedValueOnce(fixtures.cards.activeSender);
    const updateMany = vi.fn().mockResolvedValue({
      count: 1,
    });
    const update = vi.fn().mockResolvedValue({});
    const transactionCreate = vi.fn().mockResolvedValue({});
    mocks.prisma.$transaction.mockImplementation(async (cb: unknown) => {
      const tx = {
        card: {
          findFirst,
          updateMany,
          update,
        },
        transaction: {
          create: transactionCreate,
        },
      };
      return (cb as (arg: typeof tx) => Promise<unknown>)(tx);
    });
    const result = await executeTransfer(
      fixtures.cards.activeSender.id,
      fixtures.cards.activeRecipient.cardNumber,
      "10",
    );
    expect(result).toEqual({
      success: true,
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/");
    expect(revalidatePathMock).toHaveBeenCalledWith("/wallet");
    expect(revalidatePathMock).toHaveBeenCalledWith("/transfers");
    expect(mocks.logAuditEventMock).toHaveBeenCalled();
    expect(updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          balance: {
            decrement: 10,
          },
        },
      }),
    );
    expect(update).toHaveBeenCalledWith({
      where: {
        id: fixtures.cards.activeRecipient.id,
      },
      data: {
        balance: {
          increment: 10,
        },
      },
    });
    expect(transactionCreate).toHaveBeenCalledTimes(2);
    const [debitCall, creditCall] = transactionCreate.mock.calls;
    expect(debitCall[0].data.amount.toString()).toBe("-10");
    expect(creditCall[0].data.amount.toString()).toBe("10");
  });
  it("returns known message for insufficient funds", async () => {
    authMock.mockResolvedValue({
      user: {
        id: fixtures.user.id,
      },
    });
    mocks.prisma.$transaction.mockImplementation(async (cb: unknown) => {
      const tx = {
        card: {
          findFirst: vi
            .fn()
            .mockResolvedValueOnce(fixtures.cards.activeRecipient)
            .mockResolvedValueOnce(fixtures.cards.activeSender),
          updateMany: vi.fn().mockResolvedValue({
            count: 0,
          }),
          update: vi.fn().mockResolvedValue({}),
        },
        transaction: {
          create: vi.fn().mockResolvedValue({}),
        },
      };
      return (cb as (arg: typeof tx) => Promise<unknown>)(tx);
    });
    const result = await executeTransfer(
      fixtures.cards.activeSender.id,
      fixtures.cards.activeRecipient.cardNumber,
      "999999",
    );
    expect(result).toEqual({
      success: false,
      error: "Недостатньо коштів",
    });
  });
  it("maps unknown transaction errors to generic transfer error", async () => {
    authMock.mockResolvedValue({
      user: {
        id: fixtures.user.id,
      },
    });
    mocks.prisma.$transaction.mockRejectedValue(new Error("DB timeout"));
    const result = await executeTransfer(
      fixtures.cards.activeSender.id,
      fixtures.cards.activeRecipient.cardNumber,
      "10",
    );
    expect(result).toEqual({
      success: false,
      error: "Помилка переказу",
    });
  });
  it("returns known message when recipient card is missing", async () => {
    authMock.mockResolvedValue({
      user: {
        id: fixtures.user.id,
      },
    });
    mocks.prisma.$transaction.mockImplementation(async (cb: unknown) => {
      const tx = {
        card: {
          findFirst: vi.fn().mockResolvedValueOnce(null),
          updateMany: vi.fn(),
          update: vi.fn(),
        },
        transaction: {
          create: vi.fn(),
        },
      };
      return (cb as (arg: typeof tx) => Promise<unknown>)(tx);
    });
    const result = await executeTransfer(
      fixtures.cards.activeSender.id,
      fixtures.cards.activeRecipient.cardNumber,
      "10",
    );
    expect(result).toEqual({
      success: false,
      error: "Картку отримувача не знайдено в системі",
    });
  });
  it("returns known message when trying self-transfer", async () => {
    authMock.mockResolvedValue({
      user: {
        id: fixtures.user.id,
      },
    });
    mocks.prisma.$transaction.mockImplementation(async (cb: unknown) => {
      const tx = {
        card: {
          findFirst: vi
            .fn()
            .mockResolvedValueOnce({
              ...fixtures.cards.activeSender,
            })
            .mockResolvedValueOnce(fixtures.cards.activeSender),
          updateMany: vi.fn(),
          update: vi.fn(),
        },
        transaction: {
          create: vi.fn(),
        },
      };
      return (cb as (arg: typeof tx) => Promise<unknown>)(tx);
    });
    const result = await executeTransfer(
      fixtures.cards.activeSender.id,
      fixtures.cards.activeSender.cardNumber,
      "10",
    );
    expect(result).toEqual({
      success: false,
      error: "Не можна переказати кошти на ту саму картку",
    });
  });
  it("returns known message when sender card is not owned by session user", async () => {
    authMock.mockResolvedValue({
      user: {
        id: fixtures.user.id,
      },
    });
    mocks.prisma.$transaction.mockImplementation(async (cb: unknown) => {
      const tx = {
        card: {
          findFirst: vi
            .fn()
            .mockResolvedValueOnce(fixtures.cards.activeRecipient)
            .mockResolvedValueOnce(null),
          updateMany: vi.fn(),
          update: vi.fn(),
        },
        transaction: {
          create: vi.fn(),
        },
      };
      return (cb as (arg: typeof tx) => Promise<unknown>)(tx);
    });
    const result = await executeTransfer(
      "cmnonowned0003jyp8scd7iy7t",
      fixtures.cards.activeRecipient.cardNumber,
      "10",
    );
    expect(result).toEqual({
      success: false,
      error: "Картку відправника не знайдено",
    });
  });
});
