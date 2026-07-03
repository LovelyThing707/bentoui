/* optimize-images.js — generate responsive WebP variants of the eyecatch images.
   Run once when the eyecatch PNGs change:  npm i sharp && node scripts/optimize-images.js
   Outputs <slug>-800.webp and <slug>-1600.webp next to each <slug>.png.
   The PNGs are kept as a <picture> fallback; build.js just copies whatever is here. */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "..", "assets", "img", "eyecatch");
const slugs = ["hikari", "home-router", "pocket-wifi", "norikae", "sokujitsu", "hitorigurashi",
  "kazoku-kodate", "gaishutsu", "game", "telework", "business", "guide"];

(async () => {
  let savedFrom = 0, savedTo = 0;
  for (const s of slugs) {
    const src = path.join(dir, s + ".png");
    if (!fs.existsSync(src)) { console.log("MISSING", src); continue; }
    for (const w of [800, 1600]) {
      await sharp(src).resize({ width: w, withoutEnlargement: true }).webp({ quality: 80 })
        .toFile(path.join(dir, s + "-" + w + ".webp"));
    }
    const png = fs.statSync(src).size;
    const w8 = fs.statSync(path.join(dir, s + "-800.webp")).size;
    const w16 = fs.statSync(path.join(dir, s + "-1600.webp")).size;
    savedFrom += png; savedTo += w16;
    console.log(s.padEnd(16), "png=" + (png / 1024 | 0) + "KB", "→ 800w=" + (w8 / 1024 | 0) + "KB", "1600w=" + (w16 / 1024 | 0) + "KB");
  }
  console.log("\nLCP image weight (PC): " + (savedFrom / 1048576).toFixed(1) + "MB PNG → " + (savedTo / 1048576).toFixed(1) + "MB WebP");
})();
