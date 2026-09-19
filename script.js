(function () {
  "use strict";
  var FADE_MS = 900;
  var FILL_START = 1600;
  var FILL_DURATION = 1800;
  function typeLine(el, text, startDelay, step) {
    if (!el) return;
    var wrap = document.createElement("div");
    wrap.className = "letters";
    for (var i = 0; i < text.length; i++) {
      var ch = text.charAt(i);
      var span = document.createElement("span");
      span.className = "letter";
      span.textContent = ch === " " ? "\u00A0" : ch;
      span.style.animationDelay = startDelay + i * step + "s";
      wrap.appendChild(span);
    }
    el.appendChild(wrap);
  }
  function setupLoadingScreen() {
    var loading = document.getElementById("loading");
    var page2 = document.getElementById("page2");
    var markWrap = document.getElementById("markWrap");
    var line1 = document.getElementById("line1");
    var line2 = document.getElementById("line2");
    var fillEl = document.getElementById("fill");
    var statusEl = document.getElementById("status");
    document.body.classList.add("is-loading");
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    typeLine(line1, "SAYGON", 1.1, 0.045);
    typeLine(line2, "GROUP", 1.4, 0.045);

    window.setTimeout(function () {
      if (markWrap) markWrap.classList.add("settled");
    }, 2000);

    var finished = false;

    function revealPage2() {
      document.body.classList.remove("is-loading");
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      if (page2) page2.classList.add("show");
      setupScrollReveal();

      if (loading) {
        loading.classList.add("hide");
        loading.setAttribute("aria-hidden", "true");
        window.setTimeout(function () {
          loading.style.display = "none";
        }, FADE_MS);
      }
    }

    function finish() {
      if (finished) return;
      finished = true;
      revealPage2();
    }

    if (!fillEl || !statusEl) {
      finish();
      return;
    }

    window.setTimeout(function () {
      fillEl.style.transition = "width " + FILL_DURATION + "ms linear";
      fillEl.style.width = "100%";

      var start = performance.now();

      function tick() {
        var elapsed = performance.now() - start;
        var pct = Math.min(100, Math.round((elapsed / FILL_DURATION) * 100));
        statusEl.textContent = "Memuat " + pct + "%";
        if (pct < 100) {
          requestAnimationFrame(tick);
        } else {
          finish();
        }
      }

      requestAnimationFrame(tick);
    }, FILL_START);

    window.setTimeout(finish, FILL_START + FILL_DURATION + 4000);
  }
  var revealReady = false;

  function setupScrollReveal() {
    if (revealReady) return;
    revealReady = true;

    var page2 = document.getElementById("page2");
    if (!page2) return;

    var descHeading = page2.querySelector(".desc h2");
    if (descHeading) descHeading.classList.add("reveal", "reveal-left");

    page2.querySelectorAll(".desc p").forEach(function (p, i) {
      p.classList.add("reveal", "reveal-left");
      p.style.transitionDelay = 0.1 + i * 0.1 + "s";
    });

    var legend = page2.querySelector(".legend");
    if (legend) legend.classList.add("reveal", "reveal-right");

    page2.querySelectorAll(".legend-item").forEach(function (item, i) {
      item.classList.add("reveal");
      item.style.transitionDelay = 0.15 + i * 0.08 + "s";
    });

    page2.querySelectorAll(".faq h2").forEach(function (el) {
      el.classList.add("reveal");
    });

    page2.querySelectorAll(".faq-list").forEach(function (list) {
      list.querySelectorAll(".faq-item").forEach(function (item, i) {
        item.classList.add("reveal");
        item.style.transitionDelay = Math.min(i * 0.06, 0.4) + "s";
      });
    });

    var ctaInner = page2.querySelector(".cta-inner");
    if (ctaInner) ctaInner.classList.add("reveal", "reveal-scale");

    var targets = page2.querySelectorAll(
      ".reveal, .reveal-left, .reveal-right, .reveal-scale",
    );

    if (!("IntersectionObserver" in window)) {
      targets.forEach(function (el) {
        el.classList.add("in-view");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
    );

    targets.forEach(function (el) {
      observer.observe(el);
    });
  }

  function setupFaqAccordion() {
    function syncOpenHeights() {
      document.querySelectorAll(".faq-item.open .faq-a").forEach(function (a) {
        a.style.maxHeight = a.scrollHeight + "px";
      });
    }

    document.querySelectorAll(".faq-list").forEach(function (list) {
      var items = list.querySelectorAll(".faq-item");

      items.forEach(function (item) {
        var q = item.querySelector(".faq-q");
        var a = item.querySelector(".faq-a");
        if (!q || !a) return;

        if (item.classList.contains("open")) {
          a.style.maxHeight = a.scrollHeight + "px";
        }

        q.addEventListener("click", function () {
          var isOpen = item.classList.contains("open");

          items.forEach(function (other) {
            other.classList.remove("open");
            var otherA = other.querySelector(".faq-a");
            if (otherA) otherA.style.maxHeight = 0;
          });

          if (!isOpen) {
            item.classList.add("open");
            a.style.maxHeight = a.scrollHeight + "px";
          }
        });
      });
    });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(syncOpenHeights).catch(function () {});
    }

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(syncOpenHeights, 150);
    });

    window.addEventListener("orientationchange", function () {
      setTimeout(syncOpenHeights, 250);
    });

    window.addEventListener("load", syncOpenHeights);
  }

  function init() {
    try {
      setupFaqAccordion();
    } catch (err) {
      console.error("FAQ accordion error:", err);
    }

    try {
      setupLoadingScreen();
    } catch (err) {
      console.error("Loading screen error:", err);
      document.body.classList.remove("is-loading");
      var page2 = document.getElementById("page2");
      if (page2) page2.classList.add("show");
      setupScrollReveal();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
