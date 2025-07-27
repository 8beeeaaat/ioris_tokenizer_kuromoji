import { type BuildOptions, build } from "esbuild";
import pkg from "./package.json" with { type: "json" };

const { dependencies } = pkg;

const entryFile = "./src/index.ts";
const shared: BuildOptions = {
  bundle: true,
  entryPoints: [entryFile],
  logLevel: "info",
  minify: true,
  sourcemap: true,
  external: Object.keys(dependencies),
};

build({
  ...shared,
  format: "esm",
  outfile: "./dist/index.mjs",
});
