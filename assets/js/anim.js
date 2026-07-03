/* anim.js — lightweight entrance + interaction animations (zero-dependency).
   - Scroll-reveal via IntersectionObserver (fade + rise), staggered in grids.
   - Header gains a shadow on scroll; amber CTAs get a one-time shine on reveal.
   Respects prefers-reduced-motion. The <html class="anim"> flag is set by an
   inline <head> snippet so reveal targets are hidden before first paint (no
   FOUC); with JS/observer unavailable, everything simply stays visible. */
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var SEL = ".sec-head,.diag-tile,.wtile,.nav-card,.tile,.rcard,.t5card,.mv-eyecatch," +
    ".reco-card,.closing,.art-sec,.toc,.faq-card,.stepper,.matrix-wrap," +
    ".hero .eyebrow-pill,.hero h1,.hero .sub,.lead p";

  function run() {
    var els = [].slice.call(document.querySelectorAll(SEL));

    if (reduce || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }

    // stagger elements that sit inside a grid/list container
    els.forEach(function (el) {
      var p = el.parentElement;
      if (p && /nav-grid|ranking-list|top5-cards|tiles|faq|reco-list/.test(p.className)) {
        var sibs = [].slice.call(p.children);
        el.style.transitionDelay = Math.min(sibs.indexOf(el), 6) * 70 + "ms";
      }
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
    els.forEach(function (el) { io.observe(el); });

    // one-time shine on amber CTAs as they scroll into view
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("shine"); io2.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    [].slice.call(document.querySelectorAll(".cta-amber")).forEach(function (c) { io2.observe(c); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();

  // sticky header: shadow after a little scroll
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }
})();
