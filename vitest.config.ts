import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/tests/unit/**/*.test.ts", "src/tests/integration/**/*.test.ts"],
    setupFiles: ["src/tests/setup/vitest-setup.ts"],
    environment: "jsdom",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
