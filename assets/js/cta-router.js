/* cta-router.js — source-routed affiliate CTAs (CLAUDE.md §8)
   Detects inbound ad source (gclid→google, yclid→yahoo, msclkid→bing, else
   utm_source, else その他) and rewrites every [data-cta] href to the matching
   variant. Products map is injected per-page as window.__CTA__:
     { "<product-key>": { google, yahoo, bing, "その他" } }
   The 5 "指定なし" products have the same URL in all 4 variants, so the routing
   logic is uniform for every product.

   NOTE (client decision 2026-07-11 — supersedes §8's click-id passthrough):
   we do NOT write the gclid/yclid/msclkid VALUE into the outbound URL; those
   params stay empty as provided. The click-id reaches the ASP via the Referer
   header instead (meta referrer = no-referrer-when-downgrade), so also passing
   it in the URL would risk double-counting. Source detection is kept only to
   choose the correct per-source variant (each magic-ad variant has its own bId). */
(function () {
  var CTA = window.__CTA__ || {};
  var utmMap = (window.__CTA_CONFIG__ && window.__CTA_CONFIG__.utmSourceMap) || {
    google: "google", yahoo: "yahoo", bing: "bing"
  };
  var DEFAULT = (window.__CTA_CONFIG__ && window.__CTA_CONFIG__.default) || "その他";

  var qp = new URLSearchParams(location.search);

  function detectSource() {
    if (qp.has("gclid")) return "google";
    if (qp.has("yclid")) return "yahoo";
    if (qp.has("msclkid")) return "bing";
    var utm = qp.get("utm_source");
    if (utm && utmMap[utm]) return utmMap[utm];
    return DEFAULT;
  }

  var src = detectSource();

  // Referer-only: return the source-matched variant as-is (empty gclid/yclid/msclkid slots kept)
  function urlFor(key) {
    var v = CTA[key];
    if (!v) return null;
    return v[src] || v[DEFAULT] || v["その他"] || v.google || null;
  }

  // expose for diagnosis.js
  window.ctaUrlFor = urlFor;
  window.ctaSource = src;

  document.querySelectorAll("[data-cta]").forEach(function (a) {
    var key = a.getAttribute("data-product");
    var url = urlFor(key);
    if (url) {
      a.href = url;
      a.setAttribute("rel", "nofollow sponsored noopener");
      a.setAttribute("target", "_blank");
    }
  });

  /* ---------- analytics: GTM dataLayer events ---------- */
  var NAMES = window.__PRODUCT_NAMES__ || {};
  var PAGE = window.__PAGE__ || ((location.pathname.split("/").pop() || "index").replace(/\.html$/, "") || "index");
  function dl(o) { (window.dataLayer = window.dataLayer || []).push(o); }
  window.dl = dl;          // shared helper for diagnosis.js / main.js
  window.__ctaSource = src;
  window.__ctaPage = PAGE;

  function placementOf(el) {
    if (el.closest(".diag-result")) return "diagnosis_result";
    if (el.closest(".pick-row")) return "editor_pick";
    if (el.closest(".matrix")) return "top5_matrix";
    if (el.closest(".t5card")) return "top5_card";
    if (el.closest(".rcard")) return "ranking";
    return "other";
  }

  // delegated so dynamically-added CTAs (diagnosis result) are tracked too
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("[data-cta]") : null;
    if (!a) return;
    var key = a.getAttribute("data-product");
    dl({
      event: "affiliate_click",
      product: key,
      product_name: NAMES[key] || key,
      ad_source: src,
      placement: placementOf(a),
      page: PAGE,
      href: a.href
    });
  });
})();
