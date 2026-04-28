import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => {
  const prismaMock = {
    cardProduct: {
      findUnique: vi.fn(),
    },
  };
  return {
    prismaMock,
  };
});
vi.mock("@/lib/prisma", () => ({
  prisma: mocks.prismaMock,
}));
import { getCardProductId } from "@/lib/card-product-lookup";
describe("lib/cardProductLookup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("returns product id from catalog tuple", async () => {
    mocks.prismaMock.cardProduct.findUnique.mockResolvedValue({
      id: "prod-1",
    });
    const id = await getCardProductId("UNIVERSAL", "STANDARD", "VISA");
    expect(id).toBe("prod-1");
    expect(mocks.prismaMock.cardProduct.findUnique).toHaveBeenCalledWith({
      where: {
        type_tier_paymentSystem: {
          type: "UNIVERSAL",
          tier: "STANDARD",
          paymentSystem: "VISA",
        },
      },
    });
  });
  it("throws when product tuple is missing", async () => {
    mocks.prismaMock.cardProduct.findUnique.mockResolvedValue(null);
    await expect(
      getCardProductId("DIGITAL", "GOLD", "MASTERCARD"),
    ).rejects.toThrow(
      "cardProductLookup: no catalog row for type/tier/paymentSystem",
    );
  });
  it("getCardProductId resolves universal/standard/visa (default catalog path)", async () => {
    mocks.prismaMock.cardProduct.findUnique.mockResolvedValue({
      id: "default-prod",
    });
    await expect(
      getCardProductId("UNIVERSAL", "STANDARD", "VISA"),
    ).resolves.toBe("default-prod");
  });
});
