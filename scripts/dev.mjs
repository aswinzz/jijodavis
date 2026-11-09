#!/usr/bin/env node
// Local preview:  npm run dev  ->  http://localhost:4321
// Builds the site into public/, serves it, and rebuilds whenever content,
// styles, scripts, the admin config or photos change.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { watch, existsSync } from "node:fs";
import { join, extname, normalize, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";

// Run each build in a fresh process, so edits to the build scripts are picked up too.
const build = () =>
  new Promise((resolve, reject) =>
    execFile(process.execPath, [join(dirname(fileURLToPath(import.meta.url)), "build.mjs")], (err, stdout, stderr) => {
      if (stdout.trim()) console.log(stdout.trim());
      if (stderr.trim()) console.error(stderr.trim());
      err ? reject(err) : resolve();
    })
  );

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public");
const PORT = Number(process.env.PORT) || 4321;
const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript",
  ".json": "application/json", ".yml": "text/yaml", ".txt": "text/plain", ".xml": "application/xml",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".avif": "image/avif",
  ".gif": "image/gif", ".svg": "image/svg+xml", ".ico": "image/x-icon",
};

await build();

let timer = null;
let running = Promise.resolve();
const rebuild = (why) => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    running = running.then(() => build().then(() => console.log(`↻ rebuilt (${why})`))).catch((e) => console.error(e.message));
  }, 150);
};
for (const dir of ["content", "src", "css", "js", "admin", "scripts", "static", "personal", "transformations", "certifications"]) {
  const p = join(ROOT, dir);
  if (existsSync(p)) watch(p, { recursive: true }, (_, file) => rebuild(`${dir}/${file || ""}`));
}

createServer(async (req, res) => {
  try {
    await running;
    const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^(\.\.[/\\])+/, "");
    let file = join(OUT, path);
    if (!file.startsWith(OUT)) throw new Error("forbidden");
    if ((await stat(file)).isDirectory()) file = join(file, "index.html");
    const body = await readFile(file);
    res.writeHead(200, { "Content-Type": TYPES[extname(file).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-cache" });
    res.end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  }
}).listen(PORT, "127.0.0.1", () => console.log(`Preview: http://localhost:${PORT}   Editor: http://localhost:${PORT}/admin/`));
