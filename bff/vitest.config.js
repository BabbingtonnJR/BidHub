import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true, // necessário para o matcher toPassAsync() do ArchUnitTS
    include: ["test/**/*.test.js"],
  },
});
