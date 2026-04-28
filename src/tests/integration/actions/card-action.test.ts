import { beforeEach, describe, expect, it, vi } from "vitest";
import { authMock } from "@/tests/setup/mocks/auth";
import { revalidatePathMock } from "@/tests/setup/mocks/navigation";
const mocks = vi.hoisted(() => ({
  prisma: {
    card: {
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
  getCardProductIdMock: vi.fn(),
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
vi.mock("@/lib/card-product-lookup", () => ({
  getCardProductId: mocks.getCardProductIdMock,
}));
import { requestCard, requestUnfreezeCard } from "@/lib/actions/card";
describe("actions/card", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("requestCard returns login-required error for guests", async () => {
    authMock.mockResolvedValue(null);
    const result = await requestCard({
      name: "Card",
      type: "UNIVERSAL",
      paymentSystem: "VISA",
      tier: "STANDARD",
    });
    expect(result).toEqual({
      success: false,
      error: "Потрібен вхід у систему",
    });
  });
  it("requestCard returns validation errors in expected signature", async () => {
    authMock.mockResolvedValue({
      user: {
        id: "u-1",
      },
    });
    const result = await requestCard({
      name: "",
      type: "UNIVERSAL",
      paymentSystem: "VISA",
      tier: "STANDARD",
    });
    expect(result.success).toBe(false);
    expect(result).toHaveProperty("error");
  });
  it("requestCard creates pending card on success", async () => {
    authMock.mockResolvedValue({
      user: {
        id: "u-1",
      },
    });
    mocks.getCardProductIdMock.mockResolvedValue("product-1");
    mocks.prisma.card.create.mockResolvedValue({});
    const result = await requestCard({
      name: "Картка Універсальна",
      type: "UNIVERSAL",
      paymentSystem: "VISA",
      tier: "STANDARD",
    });
    expect(result).toEqual({
      success: true,
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/wallet");
  });
  it("requestUnfreezeCard throws when unauthorized", async () => {
    authMock.mockResolvedValue(null);
    await expect(
      requestUnfreezeCard("cmofrjyxo0003jyp8scd7iy7t"),
    ).rejects.toThrow("Unauthorized");
  });
  it("requestUnfreezeCard sets timestamp only for user's frozen card", async () => {
    authMock.mockResolvedValue({
      user: {
        id: "u-1",
      },
    });
    mocks.prisma.card.findFirst.mockResolvedValue({
      id: "cmofrjyxo0003jyp8scd7iy7t",
      status: "FROZEN",
    });
    mocks.prisma.card.update.mockResolvedValue({});
    await requestUnfreezeCard("cmofrjyxo0003jyp8scd7iy7t");
    expect(mocks.prisma.card.update).toHaveBeenCalled();
    expect(revalidatePathMock).toHaveBeenCalledWith("/wallet");
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin");
  });
});
