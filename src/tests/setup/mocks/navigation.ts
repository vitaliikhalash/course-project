import { vi } from "vitest";
export const routerMock = {
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  back: vi.fn(),
};
export const redirectMock = vi.fn();
export const revalidatePathMock = vi.fn();
