import { defineConfig } from "tsup";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { version } = require("./package.json");

export default defineConfig({
  define: { __APP_VERSION__: JSON.stringify(version) },
  entry: ["src/server.ts", "src/db/migrate.ts"],
  format: ["esm"],
  target: "node22",
  outDir: "dist",
  clean: true,
  sourcemap: true,
  dts: false,
  splitting: false,
  shims: false,
});
