#!/usr/bin/env node
/**
 * Add photos without the editor:  npm run images
 *
 * For people working on the code. Drop photos into transformations/ or
 * certifications/, run this, and they're added to the content files:
 *   1. Converts iPhone HEIC photos to JPG (macOS only, uses the built-in `sips`).
 *   2. Adds any photo that isn't listed yet to the end of
 *      content/transformations.json (the site shows the end first) or
 *      content/certifications.json.
 *
 * Resizing and compression happen during `npm run build`, so originals can be
 * any size. HEIC originals are moved to _originals/.
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, renameSync, existsSync } from "node:fs";
import { join, extname, basename, dirname } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEB_EXT = [".jpg", ".jpeg", ".png", ".webp", ".avif"];
const byNumberThenName = (a, b) => a.localeCompare(b, undefined, { numeric: true });

function convertHeic(folder) {
  const dir = join(ROOT, folder);
  if (!existsSync(dir)) return;
  for (const f of readdirSync(dir)) {
    if (![".heic", ".heif"].includes(extname(f).toLowerCase())) continue;
    if (process.platform !== "darwin") { console.warn(`! ${folder}/${f}: convert HEIC to JPG first (auto-convert needs macOS).`); continue; }
    const src = join(dir, f);
    const out = join(dir, basename(f, extname(f)) + ".jpg");
    execFileSync("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "88", src, "--out", out], { stdio: "ignore" });
    mkdirSync(join(ROOT, "_originals", folder), { recursive: true });
    renameSync(src, join(ROOT, "_originals", folder, f));
    console.log(`  converted ${folder}/${f} -> ${basename(out)}`);
  }
}

function addUnlisted(folder, file, listKey, makeItem) {
  const path = join(ROOT, "content", file);
  const data = JSON.parse(readFileSync(path, "utf8"));
  const list = (data[listKey] ||= []);
  const listed = new Set(list.map((it) => (typeof it === "string" ? it : it.image)));
  const fresh = readdirSync(join(ROOT, folder))
    .filter((f) => WEB_EXT.includes(extname(f).toLowerCase()) && !listed.has(`/${folder}/${f}`))
    .sort(byNumberThenName)
    .map((f) => makeItem(`/${folder}/${f}`));
  if (!fresh.length) return console.log(`✓ ${folder}: nothing new`);
  data[listKey] = [...list, ...fresh];
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
  console.log(`✓ ${folder}: added ${fresh.length} photo(s) to content/${file}`);
}

for (const folder of ["personal", "transformations", "certifications"]) convertHeic(folder);
// Transformations: appended to the end of the list, which the site shows first.
addUnlisted("transformations", "transformations.json", "photos", (image) => image);
addUnlisted("certifications", "certifications.json", "items", (image) => ({ image, title: "Certification", issuer: "", year: "" }));
