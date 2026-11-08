#!/usr/bin/env node
// Production build: refresh the image list, then copy only the files the
// website needs into public/ (what Vercel / Netlify serve).
import { rmSync, mkdirSync, cpSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public");
const INCLUDE = ["index.html", "config.js", "css", "js", "personal", "transformations", "certifications"];

await import("./sync-images.mjs");

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT);
for (const item of INCLUDE) {
  const src = join(ROOT, item);
  if (existsSync(src)) cpSync(src, join(OUT, item), { recursive: true, filter: (p) => !p.endsWith(".DS_Store") });
}
console.log("✓ built site into public/");
