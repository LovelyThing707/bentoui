/* main.js — interactive widgets (TOP + shared)
   - 実質月額シミュレーター (window.__SIM__)
   - スマホ割チェッカー (window.__SD__)
   - collapse (さらに見る), mobile menu, smooth in-page scroll */
(function () {
  var names = window.__PRODUCT_NAMES__ || {};
  var yen = function (n) { return "¥" + Number(n).toLocaleString("ja-JP"); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // animated count-up for a yen figure
  function animateYen(el, to) {
    var from = parseInt((el.textContent || "").replace(/[^0-9]/g, ""), 10) || 0;
    if (reduce || from === to) { el.textContent = yen(to); return; }
    var start = null, dur = 480;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      el.textContent = yen(Math.round(from + (to - from) * eased));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  // re-trigger a CSS animation class on an element
  function replay(el, cls) { if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }

  /* ---------- simulator ---------- */
  (function () {
    var sim = window.__SIM__;
    var wrap = document.getElementById("simulator");
    if (!sim || !wrap) return;
    var rows = wrap.querySelectorAll("[data-sim-product]");
    var btns = wrap.querySelectorAll(".sim-toggle button");
    function update(month) {
      var min = Infinity;
      rows.forEach(function (r) {
        var k = r.getAttribute("data-sim-product");
        var v = sim.products[k] && sim.products[k][month];
        if (v != null && v < min) min = v;
      });
      rows.forEach(function (r) {
        var k = r.getAttribute("data-sim-product");
        var v = sim.products[k] && sim.products[k][month];
        var pr = r.querySelector(".price");
        if (pr && v != null) animateYen(pr, v);
        var sub = r.querySelector("[data-sim-sub]");
        if (sub) sub.textContent = "実質月額 / " + month + "ヶ月";
        r.classList.toggle("best", v != null && v === min);
        var badge = r.querySelector(".cheapest");
        if (badge) badge.style.display = (v != null && v === min) ? "" : "none";
      });
    }
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        btns.forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        update(b.getAttribute("data-month"));
        if (window.dl) window.dl({ event: "simulator_toggle", months: Number(b.getAttribute("data-month")) });
      });
    });
    update((wrap.querySelector(".sim-toggle button.on") || btns[0]).getAttribute("data-month"));
  })();

  /* ---------- スマホ割 checker ---------- */
  (function () {
    var sd = window.__SD__;
    var wrap = document.getElementById("sumaho-wari");
    if (!sd || !sd.results || !wrap) return;
    var btns = wrap.querySelectorAll(".sd-toggle button");
    var out = wrap.querySelector(".sd-result");
    var eligLabel = sd.eligibleLabel || "セット割対象：";
    function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }
    function update(carrier) {
      var r = sd.results[carrier];
      if (!r) { out.innerHTML = ""; return; }
      var amount = (r.amount || "").replace("{hl}", r.highlight ? '<span class="hl">' + esc(r.highlight) + "</span>" : "");
      var pills = (r.eligible || []).map(function (n) { return '<span class="sd-pill">' + esc(n) + "</span>"; }).join("");
      out.innerHTML =
        '<div class="hit"><span class="ck"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg></span>' +
        '<div><div class="hd">' + esc(r.headline) + "</div><div class=\"am\">" + amount + "</div></div></div>" +
        '<div class="sd-elig"><span class="lbl">' + esc(eligLabel) + '</span><span class="sd-pills">' + pills + "</span></div>";
      replay(out, "swap");
    }
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        btns.forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        update(b.getAttribute("data-carrier"));
        if (window.dl) window.dl({ event: "sumaho_wari_select", carrier: b.getAttribute("data-carrier") });
      });
    });
    var on = wrap.querySelector(".sd-toggle button.on") || btns[0];
    if (on) update(on.getAttribute("data-carrier"));
  })();

  /* ---------- collapse (さらに見る) ---------- */
  document.querySelectorAll(".collapse-toggle").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var box = document.getElementById(btn.getAttribute("data-target"));
      if (!box) return;
      var collapsed = box.classList.toggle("collapsed");
      btn.textContent = collapsed ? btn.getAttribute("data-more") : btn.getAttribute("data-less");
    });
  });

  /* ---------- mobile menu ---------- */
  var tgl = document.querySelector(".nav-toggle");
  var menu = document.querySelector(".mobile-menu");
  if (tgl && menu) tgl.addEventListener("click", function () { menu.classList.toggle("open"); });

  /* ---------- smooth in-page scroll for data-scroll ---------- */
  document.querySelectorAll("[data-scroll]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      var sel = a.getAttribute("data-scroll");
      var el = sel && document.querySelector(sel);
      if (el) { e.preventDefault(); el.scrollIntoView({ behavior: "smooth" }); }
    });
  });
})();
