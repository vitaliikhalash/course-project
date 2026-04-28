import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
  compareMock: vi.fn(),
  captured: {} as {
    config?: Record<string, unknown>;
  },
}));
vi.mock("@/lib/prisma", () => ({
  prisma: mocks.prisma,
}));
vi.mock("bcryptjs", () => ({
  default: {
    compare: mocks.compareMock,
  },
  compare: mocks.compareMock,
}));
vi.mock("next-auth", () => ({
  default: vi.fn((config: Record<string, unknown>) => {
    mocks.captured.config = config;
    return {
      handlers: {
        GET: vi.fn(),
        POST: vi.fn(),
      },
      signIn: vi.fn(),
      signOut: vi.fn(),
      auth: vi.fn(),
    };
  }),
}));
vi.mock("next-auth/providers/credentials", () => ({
  default: (opts: unknown) => ({
    ...(opts as Record<string, unknown>),
    type: "credentials",
  }),
}));
describe("auth credentials authorize", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    mocks.captured.config = undefined;
    await import("@/auth");
  });
  it("returns null for invalid credentials payload", async () => {
    const providers = mocks.captured.config?.providers as Array<
      Record<string, unknown>
    >;
    const authorize = providers[0].authorize as (
      creds: unknown,
    ) => Promise<unknown>;
    const result = await authorize({
      email: "bad",
      password: "",
    });
    expect(result).toBeNull();
  });
  it("returns null when user missing or password mismatch", async () => {
    const providers = mocks.captured.config?.providers as Array<
      Record<string, unknown>
    >;
    const authorize = providers[0].authorize as (
      creds: unknown,
    ) => Promise<unknown>;
    mocks.prisma.user.findUnique.mockResolvedValue(null);
    expect(
      await authorize({
        email: "john@doe.com",
        password: "x",
      }),
    ).toBeNull();
    mocks.prisma.user.findUnique.mockResolvedValue({
      id: "u-1",
      email: "john@doe.com",
      password: "hashed",
      role: "USER",
      userProfile: {
        firstName: "John",
        lastName: "Doe",
      },
    });
    mocks.compareMock.mockResolvedValue(false);
    expect(
      await authorize({
        email: "john@doe.com",
        password: "x",
      }),
    ).toBeNull();
  });
  it("returns session user shape on success", async () => {
    const providers = mocks.captured.config?.providers as Array<
      Record<string, unknown>
    >;
    const authorize = providers[0].authorize as (
      creds: unknown,
    ) => Promise<unknown>;
    mocks.prisma.user.findUnique.mockResolvedValue({
      id: "u-1",
      email: "john@doe.com",
      password: "hashed",
      role: "ADMIN",
      userProfile: {
        firstName: "John",
        lastName: "Doe",
      },
    });
    mocks.compareMock.mockResolvedValue(true);
    const result = (await authorize({
      email: "john@doe.com",
      password: "x",
    })) as Record<string, unknown>;
    expect(result.id).toBe("u-1");
    expect(result.role).toBe("ADMIN");
    expect(result.name).toBe("John Doe");
  });
});
