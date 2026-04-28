import { beforeEach, describe, expect, it, vi } from "vitest";
import { authMock } from "@/tests/setup/mocks/auth";
import { revalidatePathMock } from "@/tests/setup/mocks/navigation";
const mocks = vi.hoisted(() => ({
  prisma: {
    card: {
      findUniqueOrThrow: vi.fn(),
      update: vi.fn(),
    },
    user: {
      update: vi.fn(),
    },
    systemAuditLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
  generateCardNumberForSystemMock: vi.fn(),
  generateIbanMock: vi.fn(),
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
vi.mock("@/lib/card-generator", () => ({
  generateCardNumberForSystem: mocks.generateCardNumberForSystemMock,
  generateIban: mocks.generateIbanMock,
}));
import {
  approveCard,
  cancelUnfreezeRequest,
  rejectCard,
  setUserRole,
  unfreezeCard,
} from "@/lib/actions/admin";
describe("actions/admin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.generateCardNumberForSystemMock.mockReturnValue("4242424242424242");
    mocks.generateIbanMock.mockReturnValue("UA123456789012345678901234567");
  });
  it("throws Forbidden for non-admin", async () => {
    authMock.mockResolvedValue({
      user: {
        id: "u-1",
        role: "USER",
      },
    });
    await expect(approveCard("cmofrjyxo0003jyp8scd7iy7t")).rejects.toThrow(
      "Forbidden",
    );
  });
  it("throws Forbidden for rejectCard when session role is USER", async () => {
    authMock.mockResolvedValue({
      user: {
        id: "u-1",
        role: "USER",
      },
    });
    await expect(rejectCard("cmofrjyxo0003jyp8scd7iy7t")).rejects.toThrow(
      "Forbidden",
    );
  });
  it("throws Forbidden for unfreezeCard when session role is USER", async () => {
    authMock.mockResolvedValue({
      user: {
        id: "u-1",
        role: "USER",
      },
    });
    await expect(unfreezeCard("cmofrjyxo0003jyp8scd7iy7t")).rejects.toThrow(
      "Forbidden",
    );
  });
  it("throws Forbidden for cancelUnfreezeRequest when session role is USER", async () => {
    authMock.mockResolvedValue({
      user: {
        id: "u-1",
        role: "USER",
      },
    });
    await expect(
      cancelUnfreezeRequest("cmofrjyxo0003jyp8scd7iy7t"),
    ).rejects.toThrow("Forbidden");
  });
  it("approveCard no-ops for invalid cardId", async () => {
    authMock.mockResolvedValue({
      user: {
        id: "a-1",
        role: "ADMIN",
      },
    });
    await approveCard("bad-id");
    expect(mocks.prisma.card.findUniqueOrThrow).not.toHaveBeenCalled();
  });
  it("approveCard updates pending card and writes audit", async () => {
    authMock.mockResolvedValue({
      user: {
        id: "a-1",
        role: "ADMIN",
      },
    });
    mocks.prisma.card.findUniqueOrThrow.mockResolvedValue({
      id: "cmofrjyxo0003jyp8scd7iy7t",
      status: "PENDING",
      product: {
        paymentSystem: "VISA",
      },
    });
    mocks.prisma.$transaction.mockResolvedValue([]);
    await approveCard("cmofrjyxo0003jyp8scd7iy7t");
    expect(mocks.prisma.$transaction).toHaveBeenCalled();
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin");
    expect(revalidatePathMock).toHaveBeenCalledWith("/wallet");
  });
  it("approveCard retries on P2002 card identifier conflicts", async () => {
    authMock.mockResolvedValue({
      user: {
        id: "a-1",
        role: "ADMIN",
      },
    });
    mocks.prisma.card.findUniqueOrThrow.mockResolvedValue({
      id: "cmofrjyxo0003jyp8scd7iy7t",
      status: "PENDING",
      product: {
        paymentSystem: "VISA",
      },
    });
    mocks.prisma.$transaction
      .mockRejectedValueOnce({
        code: "P2002",
        meta: {
          target: ["cardNumber"],
        },
      })
      .mockResolvedValueOnce([]);
    await approveCard("cmofrjyxo0003jyp8scd7iy7t");
    expect(mocks.prisma.$transaction).toHaveBeenCalledTimes(2);
    expect(mocks.generateCardNumberForSystemMock).toHaveBeenCalledTimes(2);
    expect(mocks.generateIbanMock).toHaveBeenCalledTimes(2);
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin");
    expect(revalidatePathMock).toHaveBeenCalledWith("/wallet");
  });
  it("approveCard throws after max retries on P2002 conflicts", async () => {
    authMock.mockResolvedValue({
      user: {
        id: "a-1",
        role: "ADMIN",
      },
    });
    mocks.prisma.card.findUniqueOrThrow.mockResolvedValue({
      id: "cmofrjyxo0003jyp8scd7iy7t",
      status: "PENDING",
      product: {
        paymentSystem: "VISA",
      },
    });
    mocks.prisma.$transaction.mockRejectedValue({
      code: "P2002",
      meta: {
        target: ["iban"],
      },
    });
    await expect(approveCard("cmofrjyxo0003jyp8scd7iy7t")).rejects.toThrow(
      "Failed to generate unique identifiers after multiple attempts",
    );
    expect(mocks.prisma.$transaction).toHaveBeenCalledTimes(5);
    expect(mocks.generateCardNumberForSystemMock).toHaveBeenCalledTimes(5);
    expect(mocks.generateIbanMock).toHaveBeenCalledTimes(5);
  });
  it("rejectCard/unfreezeCard/cancelUnfreezeRequest are idempotent on wrong states", async () => {
    authMock.mockResolvedValue({
      user: {
        id: "a-1",
        role: "ADMIN",
      },
    });
    mocks.prisma.card.findUniqueOrThrow
      .mockResolvedValueOnce({
        status: "ACTIVE",
      })
      .mockResolvedValueOnce({
        status: "ACTIVE",
      })
      .mockResolvedValueOnce({
        status: "FROZEN",
        unfreezeRequestedAt: null,
      });
    await rejectCard("cmofrjyxo0003jyp8scd7iy7t");
    await unfreezeCard("cmofrjyxo0003jyp8scd7iy7t");
    await cancelUnfreezeRequest("cmofrjyxo0003jyp8scd7iy7t");
    expect(mocks.prisma.$transaction).not.toHaveBeenCalled();
  });
  it("setUserRole throws Unauthorized for ADMIN session", async () => {
    authMock.mockResolvedValue({
      user: {
        id: "a-1",
        role: "ADMIN",
      },
    });
    const fd = new FormData();
    fd.set("targetUserId", "cmofrjyxo0003jyp8scd7iy7t");
    fd.set("newRole", "USER");
    await expect(setUserRole(fd)).rejects.toThrow("Unauthorized");
    expect(mocks.prisma.user.update).not.toHaveBeenCalled();
  });
  it("setUserRole throws Unauthorized for USER session", async () => {
    authMock.mockResolvedValue({
      user: {
        id: "u-1",
        role: "USER",
      },
    });
    const fd = new FormData();
    fd.set("targetUserId", "cmofrjyxo0003jyp8scd7iy7t");
    fd.set("newRole", "ADMIN");
    await expect(setUserRole(fd)).rejects.toThrow("Unauthorized");
    expect(mocks.prisma.user.update).not.toHaveBeenCalled();
  });
  it("setUserRole updates role for OWNER session", async () => {
    authMock.mockResolvedValue({
      user: {
        id: "o-1",
        role: "OWNER",
      },
    });
    mocks.prisma.user.update.mockResolvedValue({
      id: "t-1",
      email: "t@x",
      role: "ADMIN",
    });
    const fd = new FormData();
    fd.set("targetUserId", "cmofrjyxo0003jyp8scd7iy7t");
    fd.set("newRole", "ADMIN");
    await setUserRole(fd);
    expect(mocks.prisma.user.update).toHaveBeenCalledWith({
      where: {
        id: "cmofrjyxo0003jyp8scd7iy7t",
      },
      data: {
        role: "ADMIN",
      },
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin");
  });
  it("setUserRole no-ops for invalid form payload", async () => {
    authMock.mockResolvedValue({
      user: {
        id: "o-1",
        role: "OWNER",
      },
    });
    const fd = new FormData();
    fd.set("targetUserId", "bad-id");
    fd.set("newRole", "NOT_A_ROLE");
    await setUserRole(fd);
    expect(mocks.prisma.user.update).not.toHaveBeenCalled();
    expect(revalidatePathMock).not.toHaveBeenCalledWith("/admin");
  });
  it("setUserRole throws Unauthorized when OWNER targets own user id", async () => {
    const ownerId = "cmofrjyxo0003jyp8scd7iy7t";
    authMock.mockResolvedValue({
      user: {
        id: ownerId,
        role: "OWNER",
      },
    });
    const fd = new FormData();
    fd.set("targetUserId", ownerId);
    fd.set("newRole", "USER");
    await expect(setUserRole(fd)).rejects.toThrow("Unauthorized");
    expect(mocks.prisma.user.update).not.toHaveBeenCalled();
  });
});
