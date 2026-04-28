import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
  hashMock: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: mocks.prisma,
}));
vi.mock("bcryptjs", () => ({
  default: {
    hash: mocks.hashMock,
  },
  hash: mocks.hashMock,
}));
import { registerUser } from "@/lib/actions/auth";
describe("actions/auth.registerUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("returns validation error for empty payload", async () => {
    const fd = new FormData();
    const result = await registerUser(fd);
    expect(result).toEqual({
      success: false,
      error: "Заповніть усі поля",
    });
  });
  it("returns duplicate email error", async () => {
    mocks.prisma.user.findUnique.mockResolvedValue({
      id: "u-1",
    });
    const fd = new FormData();
    fd.append("firstName", "John");
    fd.append("lastName", "Doe");
    fd.append("phoneNumber", "+380996389722");
    fd.append("email", "john@doe.com");
    fd.append("password", "pass");
    const result = await registerUser(fd);
    expect(result).toEqual({
      success: false,
      error: "Користувач з таким email вже існує",
    });
  });
  it("creates user with hashed password on success", async () => {
    mocks.prisma.user.findUnique.mockResolvedValue(null);
    mocks.hashMock.mockResolvedValue("hashed");
    mocks.prisma.user.create.mockResolvedValue({
      id: "u-1",
    });
    const fd = new FormData();
    fd.append("firstName", "John");
    fd.append("lastName", "Doe");
    fd.append("phoneNumber", "0996389722");
    fd.append("email", "john@doe.com");
    fd.append("password", "pass");
    const result = await registerUser(fd);
    expect(result).toEqual({
      success: true,
    });
    expect(mocks.prisma.user.create).toHaveBeenCalled();
    expect(mocks.hashMock).toHaveBeenCalledWith("pass", 10);
  });
});
