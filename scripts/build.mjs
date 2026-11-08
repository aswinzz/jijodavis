#!/usr/bin/env node
/**
 * Production build:  npm run build
 *
 *   content/*.json  ─┐
 *   src/page.html   ─┼─>  public/index.html   (finished HTML: fast first paint, good SEO)
 *   src/render.mjs  ─┘
 *   photos          ───>  public/img/*.webp   (resized, compressed, cache-busted)
 *   css/, js/       ───>  public/css, public/js (file names carry a content hash)
 *   admin/          ───>  public/admin         (the content editor at /admin)
 *
 * Only photos that the content actually uses are published.
 */
import { readFileSync, writeFileSync, rmSync, mkdirSync, cpSync, existsSync, readdirSync, copyFileSync } from "node:fs";
import { join, dirname, basename, extname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public");
const CACHE = join(ROOT, "node_modules", ".cache", "jd-images");
const WIDTHS = [480, 960, 1600];
const QUALITY = 78;

const hash = (buf, n = 10) => createHash("sha1").update(buf).digest("hex").slice(0, n);
const readJSON = (name) => {
  const file = join(ROOT, "content", `${name}.json`);
  return existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : {};
};
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "img";

/* ---------- content ---------- */
export function loadContent() {
  const settings = readJSON("settings");
  return {
    ...settings,
    hero: readJSON("hero"),
    about: readJSON("about"),
    services: readJSON("services"),
    transformations: readJSON("transformations"),
    process: readJSON("process"),
    certifications: readJSON("certifications"),
    faq: readJSON("faq"),
    contactSection: readJSON("contact"),
  };
}

/* ---------- images ---------- */
const warnings = [];
const images = new Map(); // "/folder/file.jpg" -> { variants: [{w, url}], width, height } | null

async function processImage(path) {
  if (!path || images.has(path)) return;
  const src = join(ROOT, path.replace(/^\/+/, ""));
  if (!existsSync(src)) {
    warnings.push(`Missing photo ${path}: it was left off the page.`);
    images.set(path, null);
    return;
  }
  try {
    const buf = readFileSync(src);
    const h = hash(buf);
    const meta = await sharp(buf).metadata();
    const rotated = (meta.orientation || 1) >= 5;
    const width = rotated ? meta.height : meta.width;
    const height = rotated ? meta.width : meta.height;
    const widths = [...new Set([...WIDTHS.filter((w) => w < width), Math.min(width, WIDTHS.at(-1))])].sort((a, b) => a - b);
    const name = slug(basename(path, extname(path)));
    const variants = [];
    for (const w of widths) {
      const file = `${name}-${h}-${w}.webp`;
      const cached = join(CACHE, file);
      if (!existsSync(cached)) {
        await sharp(buf).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: QUALITY }).toFile(cached);
      }
      copyFileSync(cached, join(OUT, "img", file));
      variants.push({ w, url: `/img/${file}` });
    }
    images.set(path, { variants, width, height, buf, h });
  } catch (e) {
    warnings.push(`Could not read photo ${path} (${e.message.split("\n")[0]}). Save it as JPG, PNG or WebP.`);
    images.set(path, null);
  }
}

const imgHelpers = {
  // <img> with srcset; `maxWidth` limits which sizes are offered.
  tag(path, { alt = "", sizes = "100vw", priority = false, maxWidth = Infinity } = {}) {
    const im = images.get(path);
    if (!im) return "";
    const vs = im.variants.filter((v) => v.w <= maxWidth);
    const list = vs.length ? vs : im.variants.slice(0, 1);
    const fallback = list.filter((v) => v.w <= 960).at(-1) || list[0];
    const big = list.at(-1).w;
    const h = Math.round((im.height / im.width) * big);
    const esc = (s) => String(s).replace(/"/g, "&quot;");
    return `<img src="${fallback.url}" srcset="${list.map((v) => `${v.url} ${v.w}w`).join(", ")}" sizes="${sizes}" width="${big}" height="${h}" alt="${esc(alt)}" ${
      priority ? 'fetchpriority="high"' : 'loading="lazy"'
    } decoding="async" />`;
  },
  // Largest version, used by the full-screen viewer.
  full(path) {
    return images.get(path)?.variants.at(-1).url || "";
  },
};

async function makeShareImage(path) {
  const im = images.get(path);
  if (!im) return "";
  const file = `share-${im.h}.jpg`;
  const cached = join(CACHE, file);
  if (!existsSync(cached)) {
    await sharp(im.buf).rotate().resize(1200, 630, { fit: "cover", position: "attention" }).jpeg({ quality: 82, mozjpeg: true }).toFile(cached);
  }
  copyFileSync(cached, join(OUT, "img", file));
  return `/img/${file}`;
}

/* ---------- static assets with hashed names ---------- */
function copyHashed(rel) {
  const buf = readFileSync(join(ROOT, rel));
  const ext = extname(rel);
  const out = `${rel.slice(0, -ext.length)}.${hash(buf, 8)}${ext}`;
  mkdirSync(join(OUT, dirname(out)), { recursive: true });
  writeFileSync(join(OUT, out), buf);
  return `/${out}`;
}

/* ---------- build ---------- */
export async function build({ quiet = false } = {}) {
  const t0 = Date.now();
  warnings.length = 0;
  images.clear();
  const C = loadContent();
  const site = C.site || {};
  const url = `https://${(site.domain || "jijodavis.com").replace(/^https?:\/\//, "").replace(/\/+$/, "")}/`;

  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(join(OUT, "img"), { recursive: true });
  mkdirSync(CACHE, { recursive: true });

  // Photos the page uses
  const t = C.transformations || {};
  const certs = C.certifications || {};
  const used = [
    C.hero?.photo,
    C.about?.photo,
    C.contactSection?.photo,
    C.seo?.shareImage,
    ...(t.photos || []).map((p) => p.image),
    ...(certs.items || []).map((m) => m.image),
  ].filter(Boolean);
  const queue = [...new Set(used)];
  const workers = Array.from({ length: 4 }, async () => {
    while (queue.length) await processImage(queue.shift());
  });
  await Promise.all(workers);

  // Drop list entries whose photo is missing or unreadable
  if (t.photos) t.photos = t.photos.filter((p) => images.get(p.image));
  if (certs.items) certs.items = certs.items.filter((m) => images.get(m.image));

  // Photos sitting in the folders that the content doesn't use (just a hint)
  for (const folder of ["transformations", "certifications"]) {
    const dir = join(ROOT, folder);
    if (!existsSync(dir)) continue;
    const listed = new Set(used.map((p) => p.replace(/^\/+/, "")));
    const extra = readdirSync(dir).filter((f) => !f.startsWith(".") && !listed.has(`${folder}/${f}`));
    if (extra.length) warnings.push(`${extra.length} photo(s) in ${folder}/ are not on the page (add them in /admin or run npm run images): ${extra.slice(0, 5).join(", ")}${extra.length > 5 ? "…" : ""}`);
  }

  const shareImage = await makeShareImage(C.seo?.shareImage || C.hero?.photo);
  const { renderPage, plain } = await import(pathToFileURL(join(ROOT, "src", "render.mjs")).href + `?t=${Date.now()}`);
  const { header, main, footer } = renderPage(C, imgHelpers);

  const heroImg = images.get(C.hero?.photo);
  const preload = heroImg
    ? `<link rel="preload" as="image" imagesrcset="${heroImg.variants.map((v) => `${v.url} ${v.w}w`).join(", ")}" imagesizes="(max-width: 900px) 100vw, 58vw" fetchpriority="high" />`
    : "";

  const k = C.contact || {};
  const jsonld = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    jobTitle: site.role,
    url,
    image: shareImage ? new URL(shareImage, url).href : undefined,
    description: C.seo?.description,
    email: k.email || undefined,
    telephone: k.phone || undefined,
    areaServed: k.location || undefined,
    sameAs: k.instagram ? [`https://instagram.com/${k.instagram}`] : undefined,
    hasCredential: (certs.items || []).map((m) => ({
      "@type": "EducationalOccupationalCredential",
      name: m.title,
      recognizedBy: m.issuer ? { "@type": "Organization", name: m.issuer } : undefined,
    })),
  };

  const esc = (s = "") => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const vars = {
    title: esc(plain(C.seo?.title || `${site.name} — ${site.role}`)),
    description: esc(plain(C.seo?.description || C.hero?.intro || "")),
    url,
    ogImage: shareImage ? new URL(shareImage, url).href : "",
    preload,
    "css.theme": copyHashed("css/theme.css"),
    "css.styles": copyHashed("css/styles.css"),
    "js.main": copyHashed("js/main.js"),
    jsonld: JSON.stringify(jsonld).replace(/</g, "\\u003c"),
    header,
    main,
    footer,
  };
  const html = readFileSync(join(ROOT, "src", "page.html"), "utf8").replace(/\{\{([\w.]+)\}\}/g, (m, key) => (key in vars ? vars[key] : m));
  writeFileSync(join(OUT, "index.html"), html);

  // Content editor, robots, sitemap
  if (existsSync(join(ROOT, "admin"))) cpSync(join(ROOT, "admin"), join(OUT, "admin"), { recursive: true });
  writeFileSync(join(OUT, "robots.txt"), `User-agent: *\nDisallow: /admin/\n\nSitemap: ${url}sitemap.xml\n`);
  writeFileSync(
    join(OUT, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${url}</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod></url>\n</urlset>\n`
  );

  for (const w of warnings) console.warn(`! ${w}`);
  if (!quiet || warnings.length) {
    const count = [...images.values()].filter(Boolean).length;
    console.log(`✓ built public/ (${count} photos) in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  build().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
