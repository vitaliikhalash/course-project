import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@/generated/prisma";
const mocks = vi.hoisted(() => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    userProfile: {
      findUnique: vi.fn(),
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
  it("returns duplicate phone error when number is taken", async () => {
    mocks.prisma.user.findUnique.mockResolvedValue(null);
    mocks.prisma.userProfile.findUnique.mockResolvedValue({
      id: "p-1",
    });
    const fd = new FormData();
    fd.append("firstName", "John");
    fd.append("lastName", "Doe");
    fd.append("phoneNumber", "0996389722");
    fd.append("email", "new@doe.com");
    fd.append("password", "pass");
    const result = await registerUser(fd);
    expect(result).toEqual({
      success: false,
      error: "Користувач з таким номером телефону вже існує",
    });
    expect(mocks.prisma.user.create).not.toHaveBeenCalled();
    expect(mocks.hashMock).not.toHaveBeenCalled();
  });
  it("maps P2002 on phone from create to duplicate phone message", async () => {
    mocks.prisma.user.findUnique.mockResolvedValue(null);
    mocks.prisma.userProfile.findUnique.mockResolvedValue(null);
    mocks.hashMock.mockResolvedValue("hashed");
    const p2002 = new Prisma.PrismaClientKnownRequestError(
      "Unique constraint failed on the fields: (`phoneNumber`)",
      {
        code: "P2002",
        clientVersion: "test",
        meta: {
          modelName: "UserProfile",
          target: ["phoneNumber"],
        },
      },
    );
    mocks.prisma.user.create.mockRejectedValue(p2002);
    const fd = new FormData();
    fd.append("firstName", "John");
    fd.append("lastName", "Doe");
    fd.append("phoneNumber", "0996389722");
    fd.append("email", "john@doe.com");
    fd.append("password", "pass");
    const result = await registerUser(fd);
    expect(result).toEqual({
      success: false,
      error: "Користувач з таким номером телефону вже існує",
    });
  });
  it("creates user with hashed password on success", async () => {
    mocks.prisma.user.findUnique.mockResolvedValue(null);
    mocks.prisma.userProfile.findUnique.mockResolvedValue(null);
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
