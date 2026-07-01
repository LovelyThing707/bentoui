/* main.js — interactive widgets (TOP + shared)
   - 実質月額シミュレーター (window.__SIM__)
   - スマホ割チェッカー (window.__SD__)
   - collapse (さらに見る), mobile menu, smooth in-page scroll */
(function () {
  var names = window.__PRODUCT_NAMES__ || {};
  var yen = function (n) { return "¥" + Number(n).toLocaleString("ja-JP"); };

  /* ---------- simulator ---------- */
  (function () {
    var sim = window.__SIM__;
    var wrap = document.getElementById("simulator");
    if (!sim || !wrap) return;
    var rows = wrap.querySelectorAll(".sim-row");
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
        var p = r.querySelector(".price");
        if (p && v != null) p.textContent = yen(v);
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
      });
    });
    update((wrap.querySelector(".sim-toggle button.on") || btns[0]).getAttribute("data-month"));
  })();

  /* ---------- スマホ割 checker ---------- */
  (function () {
    var sd = window.__SD__;
    var wrap = document.getElementById("sumaho-wari");
    if (!sd || !wrap) return;
    var btns = wrap.querySelectorAll(".sd-toggle button");
    var out = wrap.querySelector(".sd-result");
    function update(carrier, label) {
      var keys = sd[carrier] || [];
      var pills = keys.map(function (k) { return '<span class="sd-pill">' + (names[k] || k) + "</span>"; }).join("");
      out.innerHTML =
        '<div class="hit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>' +
        label + "をお使いなら、以下の回線でセット割が適用できます</div>" +
        '<div class="sd-pills">' + (pills || "対象の回線はありません") + "</div>";
    }
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        btns.forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        update(b.getAttribute("data-carrier"), b.textContent);
      });
    });
    var on = wrap.querySelector(".sd-toggle button.on") || btns[0];
    if (on) update(on.getAttribute("data-carrier"), on.textContent);
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
