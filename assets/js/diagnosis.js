/* diagnosis.js — セルフ診断 (CLAUDE.md §9)
   Lives on TOP (#diagnosis). Only Q1 (利用場所) branches the result:
     戸建て/集合住宅 -> モバレコAir · 外出先 -> BroadWiMAX
   Q2-Q5 are cosmetic. Q4「わからない」-> scroll to #comparison-matrix.
   Result CTA uses the source-routed affiliate URL (window.ctaUrlFor from cta-router.js). */
(function () {
  var root = document.getElementById("diagnosis");
  var data = window.__DIAGNOSIS__;
  if (!root || !data) return;
  var panel = root.querySelector(".diag-panel");
  var names = window.__PRODUCT_NAMES__ || {};
  var qs = data.questions || [];
  var total = qs.length;
  var idx = 0;
  var resultKey = null;

  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];}); }

  function chevron(){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>'; }

  function renderQuestion() {
    var q = qs[idx];
    var dots = "";
    for (var i = 0; i < total; i++) dots += '<i class="' + (i <= idx ? "on" : "") + '"></i>';
    var opts = q.options.map(function (o, i) {
      return '<button class="diag-opt" data-i="' + i + '"><span>' + esc(o.value) + "</span>" + chevron() + "</button>";
    }).join("");
    panel.innerHTML =
      '<div class="diag-step"><span class="s">STEP ' + (idx + 1) + " / " + total + '</span><span class="diag-dots">' + dots + "</span></div>" +
      '<div class="diag-q">' + esc(q.label) + "</div>" +
      '<div class="diag-opts">' + opts + "</div>" +
      '<div class="diag-hint">回答はいつでもやり直せます。結果は最短3秒で表示。</div>';
    panel.classList.remove("swap"); void panel.offsetWidth; panel.classList.add("swap");
    panel.querySelectorAll(".diag-opt").forEach(function (b) {
      b.addEventListener("click", function () { choose(q, +b.getAttribute("data-i")); });
    });
  }

  function choose(q, i) {
    var opt = q.options[i];
    if (opt.action === "scrollToComparison") {
      var el = document.getElementById("comparison-matrix");
      if (el) el.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (q.branches) resultKey = opt.result || (data.results && data.results[opt.value]) || resultKey;
    idx++;
    if (idx >= total) showResult(); else renderQuestion();
  }

  function showResult() {
    if (!resultKey) resultKey = "mobareco-air";
    var nm = names[resultKey] || resultKey;
    var href = (window.ctaUrlFor && window.ctaUrlFor(resultKey)) || "#";
    panel.innerHTML =
      '<div class="diag-result show">' +
        '<div class="logo-badge"><div class="k">あなたにおすすめの回線</div><div class="n">' + esc(nm) + "</div></div>" +
        '<a class="cta-btn cta-amber cta-block" href="' + esc(href) + '" rel="nofollow sponsored noopener" target="_blank">公式サイトで詳細を見る</a>' +
        '<button class="diag-restart" type="button">もう一度診断する</button>' +
      "</div>";
    panel.querySelector(".diag-restart").addEventListener("click", function () {
      idx = 0; resultKey = null; renderQuestion();
    });
  }

  renderQuestion();
})();
