# ネット回線比較.com

Static, upload-ready affiliate comparison site (bridge LP). **13 pages generated from data + 3 templates** — no CMS, plain HTML/CSS/JS.

## Build

```bash
node build.js      # reads data/ → writes /dist  (zero runtime dependencies)
```

- `data/site-data.json` — globals: products & source-routed CTA URLs, rankings, diagnosis, 実質月額 simulator, スマホ割, footer.
- `data/pages/<slug>.json` — per-page copy (lead, 図解 tiles, ranking cards, closing; article extras: TOC / sections / FAQ).
- `build.js` — templates (`top`, `product`/scene, `article`) + partials (GTM `GTM-59Z4BH` + referrer meta on every page) + inline-SVG icons.
- `assets/css/style.css` — light "Bento UI" design system.
- `assets/js/` — `date.js` (year badge + text dates), `cta-router.js` (source-routed affiliate links), `diagnosis.js` (セルフ診断), `main.js` (simulator / スマホ割 / UI).

## Deploy (Vercel, git-connected)

Vercel is configured via `vercel.json`: build command `node build.js`, output directory `dist`.
Every push to the connected branch triggers a deploy (production on `main`, preview on other branches / PRs).

## Editing content

Change copy/prices/rankings in `data/`, run `node build.js`, commit & push — Vercel redeploys automatically.
