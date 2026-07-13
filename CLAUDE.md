# CLAUDE.md — ネット回線比較.com (static affiliate site build)

## 1. What this is
Static, upload-ready affiliate comparison site (bridge LP). **13 pages from 6 templates.**
No CMS / WordPress / SIRIUS. Plain HTML/CSS/JS output.
Brand: **ネット回線比較.com**. Client: 広告の貴公子. Contact: contact@ad-kikoushi.jp.
Design approved in Figma (light theme), file key `96PCO54XL7Ez8H5qZBUGJG`.
Approved representative pages: **TOP**, **光回線** (product template), **解説ガイド** (article template).
The other 10 pages are generated from these templates + per-page data + per-page eyecatch image.

## 2. Hard requirements (contract)
- Output = **static files, upload-ready**. No server-side code.
- Responsive (single codebase, PC + SP).
- Install client tags free, on EVERY page:
  - GTM container `GTM-59Z4BH` (head + body snippets)
  - `<meta name="referrer" content="no-referrer-when-downgrade">`
- Do NOT do: server/domain/SSL, deployment, analytics dashboards. Just produce files.
- Coding phase includes **2 revision rounds**.

## 3. Pages (13)
| Template | Page | file |
|---|---|---|
| top | TOP | index.html |
| product | 光回線 | hikari.html |
| product | ホームルーター | home-router.html |
| product | ポケット型WiFi | pocket-wifi.html |
| product | 乗り換え | norikae.html |
| product | 即日発送 | sokujitsu.html |
| scene(=product) | 一人暮らし | hitorigurashi.html |
| scene | 家族・戸建て | kazoku-kodate.html |
| scene | 外出先 | gaishutsu.html |
| scene | オンラインゲーム | game.html |
| scene | テレワーク・在宅 | telework.html |
| scene | 店舗・ビジネス | business.html |
| article | 解説ガイド | guide.html |

(product & scene use the same template; only content/ranking/eyecatch differ.)

## 4. Page anatomy
**product / scene template:** MV (page-title text + eyecatch image) → リード (intro + 「こんな方におすすめ」) →
図解タイル (4 tiles; 2×2 on PC, stacked on SP) → ランキング (5 cards; horizontal on PC, stacked 2×2-spec on SP) →
クロージング (dark CTA card → links to diagnosis).
**article (解説ガイド):** MV (title + eyecatch) → 目次 → numbered sections (with callouts + a 4-step stepper + FAQ) → クロージング.
**TOP:** bento hero → セルフ診断 tile → 実質月額シミュレーター → おすすめランキング → 利用シーン nav → 回線タイプ nav → スマホ割 → クイックアクセス → footer.

## 5. Design tokens (light theme)
- page #F4F6FA · card #FFFFFF · surf2 #EAEEF4 · well #F1F3F8
- ink #111827 · mid #5A6473 · lo #8A94A3 · line #0B0D12
- teal #0891B2 · blue #2563EB · green #059669
- CTA amber #F59E0B (text on amber #1A1206)
- dark accents (diagnosis tile, footer, closing CTA): bg #161A22 / #0E1117, dInk #EDF1F7, dMid #9AA4B2, cyan #22D3EE; cyan→blue gradient on logo marks & rank badges.
- badge (eyecatch year overlay): navy #1E3A5F pill, white text, radius 8.
- Fonts: **Noto Sans JP** (Black/Bold/Medium/Regular/DemiLight) for text, **Inter** (Bold/Semibold/ExtraBold) for numbers/labels. Radius ~10–22px. Soft shadows (low-opacity, y-offset).

## 6. Components (match Figma)
header (logo + nav: ランキング/無料診断/料金比較/初心者ガイド) · footer (disclaimer + 3-link nav + © + contact) ·
eyebrow chip · section heading (eyebrow + title + sub) · ranking card (rank badge, brand+type, spec cells 実質月額/速度/開通/工事, CTA; #1 highlighted cyan-tint + 総合1位 + amber CTA, others outline) · CTA button (amber primary / teal outline) · 図解 tile (icon chip + title + body) · callout (icon + title + body) · FAQ Q/A (Q/A badges) · dark closing CTA card · eyecatch banner (full-width image ~1.9:1 + live year-badge overlay, see §10b).

## 7. Data — single source: /data/site-data.json
All copy/pricing/rankings render from `site-data.json`.
**BUILD STEP 1 — parse the Excel** `2026_06_04_ネット比較BentoUI__1_.xlsx` (29 sheets) to fill:
- the 11 category ranking arrays (5 products each)
- スマホ割 table
- pricing / 実質月額 figures
- diagnosis question copy
Already provided in the starter JSON: TOP5 ranking, diagnosis branch logic, CTA-routing config, footer text/nav, GTM id, eyecatch badge format, all 13 page titles + slugs.

## 8. CTA routing (CRITICAL — affiliate core) → cta-router.js
Affiliate CTA links are **dynamic by inbound ad source**:
- On load detect source: `gclid`→google, `yclid`→yahoo, `msclkid`→bing, else `utm_source` (mapped), else **その他** (default).
- Every product has **4 CTA URL variants**. Rewrite all CTA hrefs to the matching variant.
```
const p = new URLSearchParams(location.search);
let src = p.has('gclid')?'google':p.has('yclid')?'yahoo':p.has('msclkid')?'bing'
        : (utmMap[p.get('utm_source')] || 'その他');
document.querySelectorAll('[data-cta]').forEach(a=>{ a.href = product.cta[src]; });
```
**⚠ BLOCKER (RESOLVED):** the actual affiliate URLs are in the Excel リンク先一覧 sheet (11 products; 6 magic-ad source-routed w/ empty `gclid=&yclid=&msclkid=` slots, 5 単一URL a8/rentracks/etc.).
**Click-id handling (client decisions):** **gclid/yclid = Referer-only** (2026-07-11): do NOT write their VALUE into the URL — meta referrer `no-referrer-when-downgrade` carries them and GTM's Conversion Linker handles gclid; passing them in the URL too would double-count. **msclkid = WRITTEN into the URL** (2026-07-13, req ①): Microsoft Ads isn't covered by GTM's Google linker, so Bing needs the explicit param — `cta-router.js` fills the `msclkid=` slot on `ac.magic-ad.jp` links from `?msclkid` (`withMsclkid`). Source→variant selection kept (each magic-ad variant has its own `bId`).

## 9. Diagnosis (セルフ診断) → diagnosis.js
Quiz; only **Q1 (利用場所)** branches the result:
戸建て → モバレコAir · 集合住宅 → モバレコAir · 外出先 → BroadWiMAX.
Other questions cosmetic. Result CTA uses the source-routed affiliate URL.
Lives on TOP; sub-page closing CTAs deep-link to it.

## 10. Date auto-update (client request ③ + eyecatch year overlay)
Two related mechanisms, both driven by the current date on load (`date.js`):

### 10a. Text dates in page content
All visible date text in HTML ("2026年6月", 更新日, "最新版" labels) renders the **current 年月** on load via `formatYearMonth()` → e.g. `2026年6月`.

### 10b. Eyecatch year badge (Option B — CONFIRMED)
The eyecatch IMAGES are generated **WITHOUT** any「2026年最新版」badge so the year never goes stale and nothing needs re-rendering each January. The **entire badge (pill + text) is a live HTML/CSS overlay** on top of the image, top-left:
```html
<div class="mv-eyecatch">
  <img src="assets/img/eyecatch/<slug>.png" alt="">
  <span class="eyecatch-badge" data-year-badge></span>
</div>
```
- CSS: `.mv-eyecatch{position:relative;display:block}` ·
  `.eyecatch-badge{position:absolute; top:6.5%; left:4%; background:#1E3A5F; color:#fff; border-radius:8px; padding:.4em .8em; font-weight:700; white-space:nowrap}`.
  Use **percentage** offsets + an `em`/`clamp()`-based font-size so the badge tracks the image as it scales PC↔SP. Tune `top/left/font-size` against the actual image; provide an SP override if needed.
- `date.js`: `document.querySelectorAll('[data-year-badge]').forEach(el=>{ el.textContent = site.eyecatchBadge.format.replace('{year}', new Date().getFullYear()); });` → renders e.g.「2026年最新版」.
- Images now have clean empty top-left (no baked badge) — overlay sits cleanly on the light panel. (Re-rolled from the approved set to remove the baked year.)

## 11. Footer (all pages)
- Disclaimer: see JSON (verify exact text vs. Figma).
- 3-link nav: お役立ちコラム / 会社概要・ランキングについて / コンサルタントに相談.
- © 2026 ネット回線比較.com · contact@ad-kikoushi.jp.
- Also: 「本ページはプロモーションが含まれます」 in each page's MV (ステマ規制).

## 12. Assets
- Eyecatch: 12 images (hikari + 11), `/assets/img/eyecatch/<slug>.png`, ~1.9:1, PC/SP share.
  **Generated WITHOUT the year badge** — badge is a live CSS/JS overlay (§10b). Bottom icon-bar text (料金/速度/etc.) IS baked in (intended). (Already generated & client-approved.)
- Logo + favicon. 図解 = inline SVG icon tiles (~12 motifs, per design).

## 13. Suggested structure
```
/ index.html  hikari.html … guide.html
/assets/css/style.css
/assets/js/{cta-router,diagnosis,date,main}.js
/assets/img/eyecatch/*  /assets/img/*
/data/site-data.json
```

## 14. Build approach (recommended)
Drive all 13 pages from shared template(s) + site-data.json — **do not hand-duplicate 13 files.**
- Recommended: a lightweight generator (Eleventy/11ty, Nunjucks) reading `site-data.json` → outputs **plain static HTML** to `/dist` (contract-compliant). Keep the 11ty source; deliver `/dist`.
- Acceptable: a small Node script with template literals.
- Order: tokens/CSS → header+footer partials → product template (match 光回線 Figma) → article template (match 解説ガイド) → TOP → generate the other 10 from data → wire cta-router/diagnosis/date + GTM + year-badge overlay → responsive QA → link/tag QA.

## 15. Definition of done
13 responsive static pages · eyecatch images placed + year badge overlaying correctly across PC/SP · real ranking data · working source-routed CTAs · diagnosis · GTM + referrer meta on every page · text dates auto-updating · footer correct · no console errors.