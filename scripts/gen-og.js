/* gen-og.js — generate a branded default Open Graph image (1200x630).
   Used as og:image for pages without an eyecatch (TOP) and as a fallback.
   Run: npm i sharp && node scripts/gen-og.js */
const sharp = require("sharp");
const path = require("path");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#22D3EE"/><stop offset="1" stop-color="#3B82F6"/></linearGradient>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E7ECF3"/></linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="0" y="0" width="1200" height="12" fill="url(#g)"/>
  <g transform="translate(150,235)">
    <rect width="130" height="130" rx="30" fill="url(#g)"/>
    <g transform="translate(65,66)" fill="none" stroke="#fff" stroke-width="7.5" stroke-linecap="round">
      <path d="M-32 -8 a44 44 0 0 1 64 0"/>
      <path d="M-19 9 a26 26 0 0 1 38 0"/>
      <circle cx="0" cy="24" r="5" fill="#fff" stroke="none"/>
    </g>
  </g>
  <text x="320" y="300" font-family="Noto Sans JP, Yu Gothic, Meiryo, sans-serif" font-size="74" font-weight="900" fill="#111827">ネット回線比較<tspan fill="#0891B2">.com</tspan></text>
  <text x="322" y="372" font-family="Noto Sans JP, Yu Gothic, Meiryo, sans-serif" font-size="34" fill="#5A6473">実質月額で選ぶ、失敗しないネット回線比較。</text>
  <g transform="translate(322,430)" font-family="Noto Sans JP, Yu Gothic, sans-serif" font-size="26" font-weight="700">
    <rect x="0" y="0" width="150" height="52" rx="10" fill="#F1F3F8"/><text x="30" y="35" fill="#0891B2">光回線</text>
    <rect x="168" y="0" width="220" height="52" rx="10" fill="#F1F3F8"/><text x="196" y="35" fill="#0891B2">ホームルーター</text>
    <rect x="404" y="0" width="230" height="52" rx="10" fill="#F1F3F8"/><text x="432" y="35" fill="#0891B2">ポケット型WiFi</text>
  </g>
</svg>`;

sharp(Buffer.from(svg)).png().toFile(path.join(__dirname, "..", "assets", "img", "og-default.png"))
  .then(() => console.log("wrote assets/img/og-default.png (1200x630)"))
  .catch(e => { console.error(e); process.exit(1); });
