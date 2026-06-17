import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    root: "./",
    include: ["src/**/*.spec.ts", "test/**/*.e2e-spec.ts"],
    hookTimeout: 60_000,
    testTimeout: 30_000,
  },
  plugins: [
    // SWC handles NestJS decorators + emitDecoratorMetadata (esbuild does not).
    swc.vite({ module: { type: "es6" } }),
  ],
});
