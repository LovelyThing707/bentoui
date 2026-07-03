/* cta-router.js — source-routed affiliate CTAs (CLAUDE.md §8)
   1. Detects inbound ad source (gclid→google, yclid→yahoo, msclkid→bing,
      else utm_source, else その他) and rewrites every [data-cta] href to the
      matching variant. Products map is injected per-page as window.__CTA__:
        { "<product-key>": { google, yahoo, bing, "その他" } }
   2. Click-id passthrough: forwards the inbound gclid/yclid/msclkid VALUE into
      the outbound affiliate URL's matching (empty) param, so the ad network can
      attribute the conversion. Only fills params that already exist on the URL,
      so non-magic-ad links (a8/rentracks/affitown/accesstrade) are untouched.
   The 5 "指定なし" products have the same URL in all 4 variants, so the routing
   logic is uniform for every product. */
(function () {
  var CTA = window.__CTA__ || {};
  var utmMap = (window.__CTA_CONFIG__ && window.__CTA_CONFIG__.utmSourceMap) || {
    google: "google", yahoo: "yahoo", bing: "bing"
  };
  var DEFAULT = (window.__CTA_CONFIG__ && window.__CTA_CONFIG__.default) || "その他";

  var qp = new URLSearchParams(location.search);
  var inbound = { gclid: qp.get("gclid"), yclid: qp.get("yclid"), msclkid: qp.get("msclkid") };

  function detectSource() {
    if (qp.has("gclid")) return "google";
    if (qp.has("yclid")) return "yahoo";
    if (qp.has("msclkid")) return "bing";
    var utm = qp.get("utm_source");
    if (utm && utmMap[utm]) return utmMap[utm];
    return DEFAULT;
  }

  var src = detectSource();

  function withClickIds(rawUrl) {
    try {
      var u = new URL(rawUrl, location.href);
      ["gclid", "yclid", "msclkid"].forEach(function (k) {
        if (inbound[k] && u.searchParams.has(k)) u.searchParams.set(k, inbound[k]);
      });
      return u.toString();
    } catch (e) { return rawUrl; }
  }

  function urlFor(key) {
    var v = CTA[key];
    if (!v) return null;
    var raw = v[src] || v[DEFAULT] || v["その他"] || v.google || null;
    return raw ? withClickIds(raw) : null;
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
