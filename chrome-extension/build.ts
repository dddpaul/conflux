import { build } from "esbuild";
import { cpSync } from "fs";

const entryPoints = [
  "src/background.ts",
  "src/popup.ts",
  "src/converter.ts",
  "src/options.ts",
  "src/settings.ts",
];

async function runBuild(): Promise<void> {
  await build({
    entryPoints,
    bundle: true,
    outdir: "dist",
    format: "iife",
    target: "chrome120",
    minify: false,
    sourcemap: false,
  });

  cpSync("public", "dist", { recursive: true });

  console.log("Build complete: dist/");
}

runBuild().catch((err) => {
  console.error(err);
  process.exit(1);
});
