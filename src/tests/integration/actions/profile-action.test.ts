import { beforeEach, describe, expect, it, vi } from "vitest";
import { authMock } from "@/tests/setup/mocks/auth";
import { revalidatePathMock } from "@/tests/setup/mocks/navigation";
const mocks = vi.hoisted(() => ({
  prisma: {
    userProfile: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    systemAuditLog: {
      create: vi.fn(),
    },
    user: {
      findUniqueOrThrow: vi.fn(),
    },
  },
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
import { updateProfile } from "@/lib/actions/profile";
describe("actions/profile.updateProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("returns Unauthorized when no session", async () => {
    authMock.mockResolvedValue(null);
    const result = await updateProfile(new FormData());
    expect(result).toEqual({
      success: false,
      error: "Unauthorized",
    });
  });
  it("returns zod validation error for invalid phone", async () => {
    authMock.mockResolvedValue({
      user: {
        id: "u-1",
      },
    });
    const fd = new FormData();
    fd.append("phoneNumber", "+0996389722");
    const result = await updateProfile(fd);
    expect(result).toEqual({
      success: false,
      error: "Некоректний номер телефону",
    });
  });
  it("upserts profile and revalidates layout", async () => {
    authMock.mockResolvedValue({
      user: {
        id: "u-1",
      },
    });
    mocks.prisma.userProfile.findUnique.mockResolvedValue({
      firstName: "Old",
      lastName: "Name",
      phoneNumber: "0990000000",
    });
    mocks.prisma.userProfile.upsert.mockResolvedValue({
      id: "profile-1",
      firstName: "John",
      lastName: "Doe",
      phoneNumber: "0996389722",
    });
    mocks.prisma.systemAuditLog.create.mockResolvedValue({});
    mocks.prisma.user.findUniqueOrThrow.mockResolvedValue({
      email: "john@doe.com",
    });
    const fd = new FormData();
    fd.append("firstName", "John");
    fd.append("lastName", "Doe");
    fd.append("phoneNumber", "0996389722");
    const result = await updateProfile(fd);
    expect(result.success).toBe(true);
    expect(revalidatePathMock).toHaveBeenCalledWith("/", "layout");
  });
});
