import { describe, expect, it, vi } from "vitest";
vi.mock("@/auth", () => ({
  auth: (handler: (req: { auth: unknown; nextUrl: URL }) => Response | void) =>
    handler,
}));
import proxy from "@/proxy";
describe("proxy route protection", () => {
  it("redirects guests on protected routes", () => {
    const req = {
      auth: null,
      nextUrl: new URL("http://localhost:3000/wallet"),
    };
    const response = proxy(req as never, {} as never);
    expect(response).toBeInstanceOf(Response);
    expect((response as Response).status).toBe(302);
    expect((response as Response).headers.get("location")).toContain(
      "/?modal=login",
    );
  });
  it("allows logged in users on protected routes", () => {
    const req = {
      auth: {
        user: {
          id: "u-1",
        },
      },
      nextUrl: new URL("http://localhost:3000/wallet"),
    };
    expect(proxy(req as never, {} as never)).toBeUndefined();
  });
});
