/* cta-router.js — source-routed affiliate CTAs (CLAUDE.md §8)
   Detects inbound ad source and rewrites every [data-cta] href to the
   matching variant. Products map is injected per-page as window.__CTA__:
     { "<product-key>": { google, yahoo, bing, "その他" } }
   Elements: <a data-cta data-product="mobareco-air" href="<fallback>">
   The 5 "指定なし" products have the same URL in all 4 variants, so this
   logic is uniform for every product. */
(function () {
  var CTA = window.__CTA__ || {};
  var utmMap = (window.__CTA_CONFIG__ && window.__CTA_CONFIG__.utmSourceMap) || {
    google: "google", yahoo: "yahoo", bing: "bing"
  };
  var DEFAULT = (window.__CTA_CONFIG__ && window.__CTA_CONFIG__.default) || "その他";

  function detectSource() {
    var p = new URLSearchParams(location.search);
    if (p.has("gclid")) return "google";
    if (p.has("yclid")) return "yahoo";
    if (p.has("msclkid")) return "bing";
    var utm = p.get("utm_source");
    if (utm && utmMap[utm]) return utmMap[utm];
    return DEFAULT;
  }

  var src = detectSource();

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
})();
