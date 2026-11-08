# jijodavis.com

Static website for Jijo Davis, personal trainer and physique coach. It has no framework and no dependencies. You only need Node to run the helper scripts..

## Changing the site

| You want to… | Edit |
|---|---|
| Change any text, services, FAQ, contact details, certificate titles, section order | `config.js` |
| Change colours, fonts, spacing, corner radius, animation speed | `css/theme.css` |
| Add or remove client transformation photos | drop files in `transformations/` → run `npm run images` |
| Add a certificate | drop the image in `certifications/` → run `npm run images` → (optional) add a title in `config.js` |
| Change the hero / about / contact photos | put photos in `personal/` and set the path in `config.js` |

Search `config.js` for `TODO`: the WhatsApp number, phone, email, Instagram handle and service areas are still placeholders.

### Two-tone headings
In `config.js`, wrap the words that should be bright in `*stars*`; everything else shows in grey:
```js
heading: "Real clients. *Real results.*"
```

### Hiding a section
Remove its name from `sections: [...]` in `config.js`, or empty its list.

## Photos

```bash
npm run images
```
This command:
- converts iPhone HEIC photos to JPG (on macOS)
- shrinks anything larger than 2000px
- renames new files to the next number (`37.jpg`, `38.jpg`, …)
- regenerates `js/images.js`, the list the gallery reads

Originals of converted or resized photos are kept in `_originals/`. Transformations show newest first (highest number); set `newestFirst: false` in `config.js` to reverse this.

If you forget to run the script, the gallery still finds photos named `1.jpg`, `2.jpg`, … in order. Running the script is still better.

## Preview locally

```bash
npm run dev
```
Then open http://localhost:4321.

## Deploying

Upload the whole folder to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages).
- **Netlify / Vercel / Cloudflare Pages:** set the build command to `npm run build` and the output directory to `.` (the project root). The image list is then rebuilt on every deploy.
- **GitHub Pages:** run `npm run images` before you commit.

Point `jijodavis.com` at the host using its custom-domain settings.

## Files

```
index.html          page shell + SEO meta tags
config.js           ← all content
css/theme.css       ← all design tokens (colours, type, spacing, motion)
css/styles.css      components (uses only theme variables)
js/main.js          renders config + animations
js/images.js        auto-generated image list
scripts/            image sync + local dev server
personal/  transformations/  certifications/
reference-template/ design reference only (can be deleted before deploying)
```
