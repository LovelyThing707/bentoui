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

## Analytics — GTM `dataLayer` events

GTM (`GTM-59Z4BH`) is installed on every page. Beyond the pageview, the site pushes these
custom events to `window.dataLayer` — build GA4/conversion triggers on them in GTM (no code change needed):

| `event` | Fired when | Payload |
|---|---|---|
| `affiliate_click` | any affiliate CTA is clicked (the conversion) | `product`, `product_name`, `ad_source` (google/yahoo/bing/その他), `placement` (ranking / top5_matrix / top5_card / editor_pick / diagnosis_result / other), `page` (slug), `href` |
| `diagnosis_complete` | the セルフ診断 result is shown | `result`, `result_name` |
| `simulator_toggle` | the 実質月額 simulator period is switched | `months` (12/24/36) |
| `sumaho_wari_select` | a スマホ割 carrier chip is selected | `carrier` |

`ad_source` is the detected inbound ad network; the outbound `href` already carries the forwarded
click-id (gclid/yclid/msclkid) for the magic-ad links.

## Editing content

Change copy/prices/rankings in `data/`, run `node build.js`, commit & push — Vercel redeploys automatically.
