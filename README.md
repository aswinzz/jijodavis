# jijodavis.com

Website for Jijo Davis, personal trainer and physique coach.

- **Visitors** get a plain static page: the HTML is built ahead of time and photos are resized to WebP. There is no framework and no tracking.
- **Jijo** edits text and photos at **jijodavis.com/admin** (from a phone or a laptop). Each save commits to GitHub, and Vercel republishes the site in about a minute. His guide is [docs/editing-guide.md](docs/editing-guide.md).

## Where things live

| What | Where |
|---|---|
| All text, photo lists, contact details, section order | `content/*.json` (edited through /admin) |
| Photos | `personal/`, `transformations/`, `certifications/` (originals, any size) |
| Colours, fonts, spacing, animation speed | `css/theme.css` |
| Components | `css/styles.css` (uses only theme variables) |
| Page HTML | `src/page.html` (head, SEO tags) + `src/render.mjs` (sections) |
| Motion and interactions | `js/main.js` |
| Editor setup (forms, labels, hints) | `admin/config.yml` |
| Favicons and other files served as-is | `static/` (copied to the site root) |
| Editor sign-in | `api/auth.js`, `api/callback.js` (Vercel functions) |
| Build | `scripts/build.mjs` → `public/` |

### Two-tone headings
Words between `*stars*` show bright; the rest shows in grey:
```json
"heading": "Real clients. *Real results.*"
```

### Hiding a section
Remove it from **Settings → Sections on the page**, or from `sections` in `content/settings.json`.

## Local preview

```bash
npm install
```
```bash
npm run dev
```
- Site: http://localhost:4321. It rebuilds automatically when content, CSS, JS or photos change.
- Editor: http://localhost:4321/admin/. Choose **Work with Local Repository** (Chrome or Edge) and pick this folder. That edits the files on your computer directly, with no sign-in.

### Adding photos without the editor
Drop files into `transformations/` or `certifications/`, then run:
```bash
npm run images
```
This converts HEIC to JPG (macOS) and adds any unlisted photo to the content files. Photos that aren't listed in the content are not published.

`content/transformations.json` stores `photos` oldest → newest, because bulk uploads in the editor are added at the end. The site shows them newest first. Captions are a separate `captions` list of `{ image, caption }`.

## Build and deploy

`npm run build` writes the finished site to `public/`:
- `index.html`, prerendered from the content, with title, description, Open Graph tags, JSON-LD (Person + credentials), `robots.txt` and `sitemap.xml`
- each photo in up to three widths (480, 960 and 1600px) as WebP with `srcset`, plus a 1200×630 share image
- CSS and JS with content hashes in their file names; `vercel.json` caches `/img`, `/css` and `/js` for a year

Resized photos are cached in `node_modules/.cache/jd-images`, so rebuilds only process new photos.

Vercel builds on every push to `master`. `reference-template/` and `_originals/` are never published.

## One-time setup for the editor sign-in

1. **Create a GitHub OAuth app:** GitHub → Settings → Developer settings → OAuth Apps → New OAuth App.
   - Homepage URL: `https://jijodavis.com`
   - Authorization callback URL: `https://jijodavis.com/api/callback`
   - Then click **Generate a new client secret**.
2. **Add the keys in Vercel:** Project → Settings → Environment Variables. Add `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` for Production, then redeploy.
3. **Give Jijo access:** he creates a free GitHub account. Then, in the repo, go to Settings → Collaborators → Add people → his username. He accepts the email invite.

Sign-in only works on the domain in the callback URL. Before `jijodavis.com` points at Vercel, use the `*.vercel.app` address in both URLs, and change them once the domain is live.
