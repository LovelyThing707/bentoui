/* date.js — client-side date auto-update (CLAUDE.md §10)
   - [data-year-badge]  -> "2026年最新版"  (eyecatch overlay, §10b)
   - [data-ym]          -> "2026年6月"     (visible text dates, §10a)
   - [data-year]        -> "2026"
   All driven by the current date on load, so the year never goes stale. */
(function () {
  var now = new Date();
  var y = now.getFullYear();
  var m = now.getMonth() + 1;
  var badgeFmt = (window.__SITE__ && window.__SITE__.badgeFormat) || "{year}年最新版";

  document.querySelectorAll("[data-year-badge]").forEach(function (el) {
    el.textContent = badgeFmt.replace("{year}", y);
  });
  document.querySelectorAll("[data-ym]").forEach(function (el) {
    el.textContent = y + "年" + m + "月";
  });
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(y);
  });
})();
