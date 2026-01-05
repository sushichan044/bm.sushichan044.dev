import { defineConfig } from "tsdown";

export default defineConfig({
  clean: true,
  dts: {
    tsgo: true,
  },
  entry: ["src/*.ts"],
  fixedExtension: true,
  format: "iife",
  minify: "dce-only",
  nodeProtocol: true,
  outDir: "dist",
  platform: "browser",
  sourcemap: true,
  treeshake: true,
  unused: {
    ignore: {
      dependencies: ["hono"],
    },
  },
});
