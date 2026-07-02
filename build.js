/* ============================================================
   build.js — static site generator for ネット回線比較.com
   Reads data/site-data.json + data/pages/<slug>.json, renders 13
   static HTML pages from 3 templates (product/scene, article, top)
   into /dist. Zero runtime deps (Node core only). Contract-compliant.
   Run:  node build.js
   ============================================================ */
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const DIST = path.join(ROOT, "dist");
const site = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "site-data.json"), "utf8"));

/* ---------- helpers ---------- */
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const mdBold = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
const cleanTileTitle = (t) => String(t || "").replace(/^\s*カード[①-⑳0-9]+\s*[：:]\s*/, "").replace(/^【(.+)】$/, "$1").replace(/【|】/g, "").trim();
const cleanBody = (b) => String(b || "").replace(/^\s*一言\s*[：:]\s*/, "").trim();
const cleanIllus = (s) => String(s || "").replace(/^（図解[：:]?/, "").replace(/）$/, "").trim();
const load = (slug) => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, "data", "pages", slug + ".json"), "utf8")); } catch (e) { return null; } };

/* ---------- inline SVG icons ---------- */
const I = {
  wifi: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12.55a11 11 0 0 1 14 0"/><path d="M8.5 16.1a6 6 0 0 1 7 0"/><path d="M2 8.82a15 15 0 0 1 20 0"/><line x1="12" y1="20" x2="12" y2="20"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg>',
  coin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.5 9.5h4a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3h4" stroke-linecap="round"/></svg>',
  bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5z"/><path d="M9 12l2 2 4-4" stroke-linecap="round"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 10l9-7 9 7"/><path d="M5 9v11h14V9"/></svg>',
  router: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 17h.01M11 17h4M12 9V5M8 8l4-3 4 3"/></svg>',
  mobile: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2" stroke-linecap="round"/></svg>',
  game: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 12h4M9 10v4M15 11h.01M18 13h.01"/><rect x="2" y="6" width="20" height="12" rx="5"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0M17 5a3 3 0 0 1 0 6M21 20a6 6 0 0 0-4-5.6"/></svg>',
  briefcase: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  person: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
  map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>',
  swap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4L3 8l4 4"/><path d="M3 8h14a4 4 0 0 1 0 8h-2"/><path d="M17 20l4-4-4-4"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2z"/><path d="M8 3v18"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>',
};
const TILE_ICONS = ["coin", "bolt", "shield", "check"];

/* ---------- partials ---------- */
function head(page, title, desc) {
  const gtm = site.site.gtmId;
  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="referrer" content="no-referrer-when-downgrade">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtm}');</script>
<!-- End Google Tag Manager -->
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@600;700;800;900&family=Noto+Sans+JP:wght@350;400;500;700;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${gtm}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`;
}

function header() {
  return `<header class="site-header"><div class="wrap">
  <a class="logo" href="index.html"><span class="mark">${I.wifi}</span><span class="word">ネット回線比較<span class="tld">.com</span></span></a>
  <nav class="main-nav">
    <a href="index.html#ranking">ランキング</a>
    <a href="index.html#diagnosis">無料診断</a>
    <a href="index.html#comparison-matrix">料金比較</a>
    <a class="nav-btn" href="guide.html">初心者ガイド</a>
  </nav>
  <button class="nav-toggle" aria-label="メニュー"><span></span><span></span><span></span></button>
</div>
<div class="mobile-menu">
  <a href="index.html#ranking">ランキング</a>
  <a href="index.html#diagnosis">無料診断</a>
  <a href="index.html#comparison-matrix">料金比較</a>
  <a href="guide.html">初心者ガイド</a>
</div></header>`;
}

function footer() {
  const nav = site.site.footerNav.map((n) => `<a href="${esc(n.href)}">${esc(n.label)}</a>`).join("");
  return `<footer class="site-footer"><div class="wrap">
  <div class="foot-top">
    <div class="foot-brand">
      <span class="logo"><span class="mark">${I.wifi}</span><span class="word">ネット回線比較<span class="tld">.com</span></span></span>
      <p>実質月額で選ぶ、失敗しないネット回線比較。</p>
    </div>
    <nav class="foot-nav">${nav}</nav>
  </div>
  <hr class="foot-div">
  <p class="foot-disclaimer">${esc(site.site.footerDisclaimer)}</p>
  <div class="foot-bot">
    <span>${esc(site.site.copyright)}</span>
    <span>お問い合わせ：<a href="mailto:${esc(site.site.contactEmail)}">${esc(site.site.contactEmail)}</a></span>
  </div>
</div></footer>`;
}

function dataBlobs(opts) {
  opts = opts || {};
  const cta = {}, names = {};
  for (const k in site.products) { if (k === "_note") continue; cta[k] = site.products[k].cta; names[k] = site.products[k].name; }
  let js = `window.__SITE__=${JSON.stringify({ badgeFormat: site.site.eyecatchBadge.format })};` +
    `window.__CTA__=${JSON.stringify(cta)};` +
    `window.__CTA_CONFIG__=${JSON.stringify({ utmSourceMap: site.ctaRouting.utmSourceMap, default: site.ctaRouting.default })};` +
    `window.__PRODUCT_NAMES__=${JSON.stringify(names)};`;
  if (opts.top) {
    const T = load("top") || {};
    js += `window.__DIAGNOSIS__=${JSON.stringify({ questions: site.diagnosis.questions, results: site.diagnosis.results })};`;
    js += `window.__SIM__=${JSON.stringify(site.simulator)};`;
    js += `window.__SD__=${JSON.stringify((T.sumahoWari && { results: T.sumahoWari.results, eligibleLabel: T.sumahoWari.eligibleLabel }) || {})};`;
  }
  return `<script>${js}</script>`;
}

function scripts(opts) {
  const list = ["date.js", "cta-router.js"];
  if (opts && opts.top) { list.push("diagnosis.js"); }
  list.push("main.js");
  return dataBlobs(opts) + list.map((f) => `<script src="assets/js/${f}"></script>`).join("");
}

function foot(opts) { return footer() + scripts(opts) + "\n</body>\n</html>"; }

/* ---------- shared components ---------- */
function eyecatch(page, alt) {
  if (!page.eyecatch) return "";
  return `<div class="mv-eyecatch"><img src="${esc(page.eyecatch)}" alt="${esc(alt)}" loading="eager"><span class="eyecatch-badge" data-year-badge></span></div>`;
}
function secHead(eyebrowEN, title, sub, accent) {
  return `<div class="sec-head"><span class="eyebrow ${accent || ""}"><span class="dot"></span>${esc(eyebrowEN)}</span><h2>${esc(title)}</h2>${sub ? `<p>${esc(sub)}</p>` : ""}</div>`;
}
function ctaBtn(key, label, primary) {
  const url = (site.products[key] && site.products[key].cta[site.ctaRouting.default]) || "#";
  return `<a class="cta-btn ${primary ? "cta-amber" : "cta-teal"}" data-cta data-product="${esc(key)}" href="${esc(url)}" rel="nofollow sponsored noopener" target="_blank">${esc(label)}${primary ? I.arrow : ""}</a>`;
}

function rankingCard(item, isFirst) {
  const s = item.specs || {};
  const cells = [
    ["実質月額", s.jisshitsu, "price"],
    ["開通", s.openingSpeed, ""],
    ["工事", s.construction, ""],
    ["データ容量", s.dataCapacity, ""],
  ].map(([lbl, val, cls]) => `<div class="spec-cell ${cls}"><div class="lbl">${esc(lbl)}</div><div class="val">${esc(val || "-")}</div></div>`).join("");
  const points = (item.points || []).map((p) => `<li>${esc(p)}</li>`).join("");
  const reco = (item.recommendedPeople || []).map((p) => `<li>${esc(p)}</li>`).join("");
  const nreco = (item.notRecommendedPeople || []).map((p) => `<li>${esc(p)}</li>`).join("");
  const key = item.canonicalKey;
  const badge = isFirst
    ? `<span class="rank-badge">1<small>総合</small></span>`
    : `<span class="rank-badge">${esc(item.rank)}</span>`;
  return `<article class="rank-card ${isFirst ? "is-first" : ""}">
    <div class="rank-head">${badge}
      <div class="rank-title"><div class="name">${esc(item.name)}${isFirst ? `<span class="badge-1i">総合1位</span>` : ""}</div>
      <div class="type">${esc(item.lineType || "")}</div></div>
    </div>
    <div class="spec-grid">${cells}</div>
    ${points ? `<ul class="rank-points">${points}</ul>` : ""}
    ${item.detail ? `<p class="rank-detail">${esc(item.detail)}</p>` : ""}
    ${(reco || nreco) ? `<div class="rank-people">
      ${reco ? `<div class="box ok"><h4>${I.check}こんな人におすすめ</h4><ul>${reco}</ul></div>` : ""}
      ${nreco ? `<div class="box ng"><h4>おすすめできない人</h4><ul>${nreco}</ul></div>` : ""}
    </div>` : ""}
    <div class="cta-block">${ctaBtn(key, "公式サイトで詳細を見る", true)}</div>
  </article>`;
}

function simpleTable(rows) {
  if (!rows || !rows.length) return "";
  const body = rows.map((r) => `<tr class="${r.rank === 1 ? "hl" : ""}"><td class="r">${esc(r.rank)}位</td><td class="nm">${esc(r.name)}</td><td>${esc(r.jisshitsu || "-")}</td><td>${esc(r.setDiscount || "-")}</td></tr>`).join("");
  return `<div style="overflow-x:auto"><table class="simple-table"><thead><tr><th>順位</th><th>回線</th><th>実質月額</th><th>スマホセット割</th></tr></thead><tbody>${body}</tbody></table></div>`;
}

/* ---------- template: product / scene ---------- */
function tplProduct(pageKey, page) {
  const d = load(pageKey) || {};
  const order = site.rankings[page.ranking] || [];
  const byKey = {};
  (d.ranking || []).forEach((r) => { if (r.canonicalKey) byKey[r.canonicalKey] = r; });
  // ranking cards in canonical order, fall back to extracted order
  let items = order.map((k, i) => byKey[k] ? { ...byKey[k], rank: i + 1, canonicalKey: k } : null).filter(Boolean);
  if (!items.length) items = (d.ranking || []);
  const tiles = (d.tiles || []).map((t, i) => `<div class="tile"><div class="chip">${I[TILE_ICONS[i % TILE_ICONS.length]]}</div><h3>${esc(cleanTileTitle(t.title))}</h3><p>${esc(cleanBody(t.body))}</p>${t.illustrationNote ? `<div class="illus">${esc(cleanIllus(t.illustrationNote))}</div>` : ""}</div>`).join("");
  const lead = (d.lead && d.lead.paragraphs || []).map((p) => `<p>${mdBold(p)}</p>`).join("");
  const reco = (d.recommendedFor || []).length ? `<div class="reco-card"><h3><span class="chip">${I.check}</span>こんな方におすすめ</h3><ul class="reco-list">${d.recommendedFor.map((r) => `<li>${I.check}<span>${esc(r)}</span></li>`).join("")}</ul></div>` : "";
  const cards = items.map((it, i) => rankingCard(it, i === 0)).join("");
  const closeLabel = (d.closing && d.closing.ctaLabel) || "おすすめランキングをもう一度見る";
  const closeParas = (d.closing && d.closing.paragraphs || []).map((p) => `<p>${mdBold(p)}</p>`).join("");
  const title = page.h1 + "【" + "" + "最新版】｜ネット回線比較.com";

  return head(page, page.h1 + "｜ネット回線比較.com", (d.lead && d.lead.paragraphs && d.lead.paragraphs[0]) || page.h1) + header() +
  `<main>
    <section class="mv"><div class="wrap">
      <p class="promo-line">${esc(site.site.promoLine)}</p>
      <h1>${esc(page.h1)}</h1>
      ${eyecatch(page, page.h1)}
    </div></section>

    <section class="section lead"><div class="wrap">
      ${d.lead && d.lead.heading ? `<h2>${esc(d.lead.heading)}</h2>` : ""}
      ${lead}
      ${reco}
    </div></section>

    ${tiles ? `<section class="section"><div class="wrap">
      ${secHead("GUIDE", "選定のポイント", "当サイトが重視した比較の軸")}
      <div class="tiles cols-${(d.tiles || []).length === 4 ? "4" : "3"}">${tiles}</div>
    </div></section>` : ""}

    <section class="section" id="ranking"><div class="wrap">
      ${secHead("RANKING", d.rankingTitle || page.h1, "実質月額・速度・開通スピードで総合評価")}
      ${simpleTable(d.simpleTable)}
      <div class="ranking-list" style="margin-top:16px">${cards}</div>
      <p class="rank-disclaimer">※ 掲載の料金・スペックは各社公式情報等をもとにした参考値です。最新の詳細は各公式サイトをご確認ください。</p>
    </div></section>

    <section class="section"><div class="wrap">
      <div class="closing">
        <span class="eyebrow"><span class="dot"></span>STILL DECIDING?</span>
        <h2>${esc((d.closing && d.closing.heading) || "まだ迷っていますか？")}</h2>
        ${closeParas}
        <a class="cta-btn cta-amber" href="#ranking" data-scroll="#ranking">${esc(closeLabel)}${I.arrow}</a>
        <p class="micro"><a href="index.html#diagnosis" style="color:var(--cyan)">3秒セルフ診断で自分に最適な回線を調べる →</a></p>
      </div>
    </div></section>
  </main>` + foot({});
}

/* ---------- template: article (解説ガイド) ---------- */
function tplArticle(pageKey, page) {
  const d = load(pageKey) || {};
  const toc = (d.toc || []).map((t) => `<li><a href="#sec-${esc(String(t).match(/^\d+/) || "")}">${esc(String(t).replace(/^\d+\s*/, ""))}</a></li>`).join("");
  const sections = (d.sections || []).map((s) => {
    const callouts = (s.callouts || []).map((c) => `<div class="callout"><div class="chip">${I.info}</div><div><h4>${esc(c.title || "ポイント")}</h4><p>${mdBold(c.body || "")}</p></div></div>`).join("");
    const stepper = (s.stepper && s.stepper.length) ? `<div class="stepper">${s.stepper.map((st, i) => `<div class="step"><div class="n">${i + 1}</div><h4>${esc(st.title)}</h4><p>${esc(st.body || "")}</p></div>`).join("")}</div>` : "";
    const tiles = (s.tiles && s.tiles.length) ? `<div class="tiles cols-3" style="margin:18px 0">${s.tiles.map((t, i) => `<div class="tile"><div class="chip">${I[["router", "home", "mobile"][i % 3]]}</div><h3>${esc(t.title)}</h3><p>${esc(t.body || "")}</p></div>`).join("")}</div>` : "";
    const body = (typeof s.body === "string" ? s.body.split(/\n{2,}/) : (s.body || [])).map((p) => `<p>${mdBold(p)}</p>`).join("");
    return `<section class="art-sec" id="sec-${esc(s.num || "")}">
      <div class="sh"><div class="n">${esc(s.num || "")}</div><h2>${esc(s.title)}</h2></div>
      <div class="body">${body}${tiles}${callouts}${stepper}</div>
    </section>`;
  }).join("");
  const faq = (d.faq || []).map((f) => `<div class="faq-card"><div class="faq-row q"><span class="qa-badge q">Q</span><p>${esc(f.q)}</p></div><div class="faq-row a"><span class="qa-badge a">A</span><p>${mdBold(f.a)}</p></div></div>`).join("");
  const lead = (d.lead && d.lead.paragraphs || []).map((p) => `<p>${mdBold(p)}</p>`).join("");

  // the guide has its own beginner ranking (rankings.guide) — render it so nothing is dropped
  const order = site.rankings[page.ranking] || [];
  const byKey = {}; (d.ranking || []).forEach((r) => { if (r.canonicalKey) byKey[r.canonicalKey] = r; });
  let items = order.map((k, i) => byKey[k] ? { ...byKey[k], rank: i + 1, canonicalKey: k } : null).filter(Boolean);
  if (!items.length) items = (d.ranking || []);
  // section 5 in the guide already titles the ranking, so render just the table + cards here
  const rankingBlock = items.length ? `<div id="ranking" style="margin-top:22px">
      ${simpleTable(d.simpleTable)}
      <div class="ranking-list" style="margin-top:16px">${items.map((it, i) => rankingCard(it, i === 0)).join("")}</div>
      <p class="rank-disclaimer">※ 掲載の料金・スペックは各社公式情報等をもとにした参考値です。最新の詳細は各公式サイトをご確認ください。</p>
    </div>` : "";
  const closeLabel = (d.closing && d.closing.ctaLabel) || "おすすめランキングをもう一度見る";

  return head(page, page.h1 + "｜ネット回線比較.com", (d.lead && d.lead.paragraphs && d.lead.paragraphs[0]) || page.h1) + header() +
  `<main><div class="wrap"><div class="article">
    <section class="mv art-mv">
      <p class="promo-line">${esc(site.site.promoLine)}</p>
      <span class="eyebrow"><span class="dot"></span>初心者ガイド ・ <span data-ym></span>更新</span>
      <h1 style="font-size:28px;margin:12px 0">${esc(page.h1)}</h1>
      ${lead}
      <p class="meta"><span data-ym></span>更新 ・ 約5分で読めます</p>
      ${eyecatch(page, page.h1)}
    </section>

    ${toc ? `<nav class="toc" style="margin-top:28px"><h2>目次</h2><ol>${toc}</ol></nav>` : ""}
    ${sections}
    ${rankingBlock}
    ${faq ? `<section class="art-sec"><div class="sh"><div class="n">FAQ</div><h2>よくある質問</h2></div><div class="faq">${faq}</div></section>` : ""}

    <section class="section" style="padding-bottom:0">
      <div class="closing">
        <span class="eyebrow"><span class="dot"></span>READY TO CHOOSE?</span>
        <h2>${esc((d.closing && d.closing.heading) || "あなたに最適な回線を診断")}</h2>
        ${(d.closing && d.closing.paragraphs || ["3秒のセルフ診断で、あなたにぴったりのネット回線が見つかります。"]).map((p) => `<p>${mdBold(p)}</p>`).join("")}
        ${items.length ? `<a class="cta-btn cta-amber" href="#ranking" data-scroll="#ranking">${esc(closeLabel)}${I.arrow}</a>` : ""}
        <p class="micro"><a href="index.html#diagnosis" style="color:var(--cyan)">3秒セルフ診断で自分に最適な回線を調べる →</a></p>
      </div>
    </section>
  </div></div></main>` + foot({});
}

/* ---------- template: TOP ---------- */
function reverseSD() {
  const map = {};
  for (const carrier in site.smartphoneDiscount) {
    if (carrier.startsWith("_")) continue;
    (site.smartphoneDiscount[carrier] || []).forEach((k) => { (map[k] = map[k] || []).push(carrier); });
  }
  return map;
}
const CARRIER_LABEL = { docomo: "docomo", au: "au", SoftBank: "SoftBank", Rakuten: "楽天モバイル", "格安SIM": "格安SIM" };

function tplTop(page) {
  const p = site.products;
  const topKeys = site.rankings.top;
  const T = load("top") || {};

  const sceneMeta = [["hitorigurashi", "person"], ["kazoku-kodate", "users"], ["gaishutsu", "map"], ["game", "game"], ["telework", "briefcase"], ["business", "home"]];
  const scenes = (T.sceneNav.cards || []).map((c, i) => {
    const [slug, icon] = sceneMeta[i];
    return `<a class="nav-card" href="${slug}.html"><div class="chip">${I[icon]}</div><h3>${esc(c.label)}</h3><p>${esc(c.desc)}</p><span class="go">${esc(T.sceneNav.link)} ${I.arrow}</span></a>`;
  }).join("");

  const typeMeta = [["hikari", "router"], ["home-router", "home"], ["pocket-wifi", "mobile"]];
  const types = (T.lineType.cards || []).map((c, i) => {
    const [slug, icon] = typeMeta[i];
    return `<a class="nav-card" href="${slug}.html"><div class="chip blue">${I[icon]}</div><h3>${esc(c.label)}</h3><div class="speed">${esc(c.speed)}</div><p>${esc(c.desc)}</p><span class="go blue">${esc(T.lineType.link)} ${I.arrow}</span></a>`;
  }).join("");

  const quickMeta = [["norikae", "swap"], ["sokujitsu", "clock"], ["guide", "book"]];
  const quick = (T.quickAccess.cards || []).map((c, i) => {
    const [slug, icon] = quickMeta[i];
    return `<a class="nav-card" href="${slug}.html"><div class="chip ${esc(c.accent)}">${I[icon]}</div><h3>${esc(c.label)}</h3><p>${esc(c.desc)}</p><span class="go ${esc(c.accent)}">${esc(c.link)} ${I.arrow}</span></a>`;
  }).join("");

  // simulator: horizontal 3 cards, prices rendered/updated by main.js from __SIM__
  const simKeys = Object.keys(site.simulator.products);
  const simSub = (m) => (T.simulator.sublabel || "実質月額 / {m}ヶ月").replace("{m}", m);
  const simCards = simKeys.map((k) => `<div class="sim-card" data-sim-product="${k}"><div class="nm">${esc(p[k].name)}<span class="cheapest" style="display:none">最安</span></div><div class="price num">¥-</div><div class="sub" data-sim-sub>${esc(simSub("12"))}</div></div>`).join("");

  // TOP5 matrix: 実質月額 from Excel (products.jisshitsu); 通信速度/開通/工事/種別 from Figma (T.topMatrix.matrix)
  const mx = (T.topMatrix && T.topMatrix.matrix) || {};
  const matrixRows = topKeys.map((k, i) => {
    const m = mx[k] || {};
    const pos = m.positive ? "pos" : "";
    const first = i === 0;
    return `<tr class="${first ? "hl" : ""}">
      <td class="rankcell"><span class="rank-badge sm ${first ? "grad" : ""}">${i + 1}</span></td>
      <td class="nm"><div class="mn">${esc(p[k].name)}</div><div class="sub">${esc(m.type || p[k].type)}</div></td>
      <td class="price num">¥${Number(p[k].jisshitsu).toLocaleString()}<div class="sub">${esc(T.topMatrix.priceSub || "")}</div></td>
      <td class="rating num"><span class="star">★</span> ${esc(m.rating || "-")}</td>
      <td class="${pos}">${esc(m.opening || "-")}</td>
      <td class="${pos}">${esc(m.construction || "-")}</td>
      <td><a class="cta-btn ${first ? "cta-amber" : "cta-teal"} mini-cta" data-cta data-product="${k}" href="${esc(p[k].cta[site.ctaRouting.default])}" rel="nofollow sponsored noopener" target="_blank">公式サイト</a></td>
    </tr>`;
  }).join("");

  // スマホ割 toggle (SoftBank active by default per Figma)
  const sdDef = (T.sumahoWari && T.sumahoWari.defaultCarrier) || "SoftBank";
  const sdBtns = Object.keys(site.smartphoneDiscount).filter((c) => !c.startsWith("_")).map((c) => `<button class="${c === sdDef ? "on" : ""}" data-carrier="${esc(c)}">${esc(CARRIER_LABEL[c] || c)}</button>`).join("");

  const pick = topKeys[0];
  const pickTags = (T.editorPick.tags || []).map((t) => `<span class="ptag ${esc(t.color)}">${esc(t.text)}</span>`).join("");

  return head(page, "ネット回線比較.com｜実質月額で選ぶ、失敗しないネット回線ランキング", "光回線・ホームルーター・ポケット型WiFiを実質月額で徹底比較。3秒セルフ診断であなたに最適な回線が見つかります。") + header() +
  `<main>
    <section class="hero"><div class="wrap">
      <p class="promo-line">${esc(site.site.promoLine)}</p>
      <span class="eyebrow-pill"><span class="pdot"></span><span data-ym></span> ${esc(T.hero.eyebrowPill)}</span>
      <h1>${esc(T.hero.h1Line1)}<br>${esc(T.hero.h1Line2)}</h1>
      <p class="sub">${esc(T.hero.sub)}</p>

      <div class="bento">
        <!-- diagnosis dark tile -->
        <div class="diag-tile" id="diagnosis">
          <div class="head"><span class="chip">${I.wifi}</span><div><span class="eyebrow">SELF CHECK</span><h2>3秒判定セルフ診断</h2><p>${esc(T.diagnosisSub)}</p></div></div>
          <div class="diag-panel"><!-- rendered by diagnosis.js --></div>
        </div>
        <div class="bento-right">
          <!-- simulator -->
          <div class="wtile" id="simulator">
            <div class="thead"><div class="t"><span class="chip chip-blue">${I.coin}</span><div><span class="eyebrow">PRICE SIMULATOR</span><h2>${esc(T.simulator.title)}</h2></div></div>
              <div class="sim-toggle"><button class="on" data-month="12">12ヶ月</button><button data-month="24">24ヶ月</button><button data-month="36">36ヶ月</button></div>
            </div>
            <div class="sim-cards">${simCards}</div>
            <p class="sim-note">${esc(T.simulator.note)}</p>
          </div>
          <!-- editor pick -->
          <div class="wtile">
            <div class="thead"><div class="t"><span class="chip chip-amber">★</span><div><span class="eyebrow">EDITOR'S PICK</span><h2>${esc(T.editorPick.title)}</h2></div></div><a class="pick-link" href="#comparison-matrix" data-scroll="#comparison-matrix">${esc(T.editorPick.link)} ${I.arrow}</a></div>
            <div class="pick-row">
              <span class="badge num">1</span>
              <div><div class="pnm">${esc(p[pick].name)}</div><div class="type" style="font-size:12.5px;color:var(--lo)">${esc(p[pick].type)}</div></div>
              ${ctaBtn(pick, T.editorPick.cta, true)}
              <div class="pick-tags">${pickTags}</div>
            </div>
            <p class="pick-foot">${esc(T.editorPick.footnote)}</p>
          </div>
        </div>
      </div>
    </div></section>

    <section class="section" id="ranking"><div class="wrap">
      ${secHead("USE CASE", T.sceneNav.title, T.sceneNav.sub)}
      <div class="nav-grid scene">${scenes}</div>
    </div></section>

    <section class="section"><div class="wrap">
      ${secHead("LINE TYPE", T.lineType.title, T.lineType.sub, "blue")}
      <div class="nav-grid type">${types}</div>
    </div></section>

    <section class="section" id="comparison-matrix"><div class="wrap">
      ${secHead("RANKING", T.topMatrix.title, T.topMatrix.sub)}
      <div class="matrix-wrap"><table class="matrix top5"><thead><tr><th></th><th>回線・種別</th><th>実質月額(12ヶ月)</th><th>通信速度</th><th>開通</th><th>工事</th><th>お申込み</th></tr></thead><tbody>${matrixRows}</tbody></table></div>
      <p class="rank-disclaimer">${esc(T.topMatrix.disclaimer)}</p>
    </div></section>

    <section class="section" id="sumaho-wari"><div class="wrap">
      ${secHead("SET DISCOUNT", T.sumahoWari.title, T.sumahoWari.sub, "green")}
      <div class="sd-toggle">${sdBtns}</div>
      <div class="sd-result"><!-- rendered by main.js --></div>
    </div></section>

    <section class="section"><div class="wrap">
      <div class="nav-grid quick">${quick}</div>
    </div></section>
  </main>` + foot({ top: true });
}

/* ---------- run ---------- */
function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.isDirectory()) copyDir(s, d); else fs.copyFileSync(s, d);
  }
}

function main() {
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });

  let count = 0;
  for (const key in site.pages) {
    const page = site.pages[key];
    let html;
    if (page.template === "top") html = tplTop(page);
    else if (page.template === "article") html = tplArticle(key, page);
    else html = tplProduct(key, page);
    fs.writeFileSync(path.join(DIST, page.file), html, "utf8");
    count++;
    console.log("  ✓", page.file);
  }

  // favicon
  fs.writeFileSync(path.join(DIST, "favicon.svg"),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#22D3EE"/><stop offset="1" stop-color="#3B82F6"/></linearGradient></defs><rect width="64" height="64" rx="16" fill="url(#g)"/><g fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"><path d="M16 30a22 22 0 0 1 32 0"/><path d="M23 37a12 12 0 0 1 18 0"/><circle cx="32" cy="45" r="2.5" fill="#fff" stroke="none"/></g></svg>`, "utf8");

  // assets + data
  copyDir(path.join(ROOT, "assets"), path.join(DIST, "assets"));
  copyDir(path.join(ROOT, "data"), path.join(DIST, "data"));

  // prune the original Japanese-named eyecatch duplicates from dist (only slug names are referenced)
  const ecDir = path.join(DIST, "assets", "img", "eyecatch");
  for (const f of fs.readdirSync(ecDir)) { if (/[^\x00-\x7f]/.test(f)) fs.rmSync(path.join(ecDir, f)); }

  console.log(`\nBuilt ${count} pages -> dist/`);
}
main();
