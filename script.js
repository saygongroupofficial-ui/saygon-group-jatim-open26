function typeLine(el, text, startDelay, step) {
  const wrap = document.createElement("div");
  wrap.className = "letters";
  [...text].forEach((ch, i) => {
    const span = document.createElement("span");
    span.className = "letter";
    span.textContent = ch === " " ? "\u00A0" : ch;
    span.style.animationDelay = startDelay + i * step + "s";
    wrap.appendChild(span);
  });
  el.appendChild(wrap);
}
typeLine(document.getElementById("line1"), "SAYGON", 1.1, 0.045);
typeLine(document.getElementById("line2"), "GROUP", 1.4, 0.045);

setTimeout(() => {
  document.getElementById("markWrap").classList.add("settled");
}, 2000);

const fillEl = document.getElementById("fill");
const statusEl = document.getElementById("status");
const FILL_START = 1600;
const FILL_DURATION = 1800;

setTimeout(() => {
  fillEl.style.transition = "width " + FILL_DURATION + "ms linear";
  fillEl.style.width = "100%";

  const startTime = performance.now();
  function updatePct() {
    const elapsed = performance.now() - startTime;
    const pct = Math.min(100, Math.round((elapsed / FILL_DURATION) * 100));
    statusEl.textContent = "Memuat " + pct + "%";
    if (pct < 100) {
      requestAnimationFrame(updatePct);
    } else {
      goToPage2();
    }
  }
  requestAnimationFrame(updatePct);
}, FILL_START);

function goToPage2() {
  setTimeout(() => {
    const loading = document.getElementById("loading");
    const page2 = document.getElementById("page2");
    loading.classList.add("hide");
    page2.classList.add("show");
    document.body.classList.add("page2-active");
    setTimeout(() => {
      loading.style.display = "none";
    }, 950);
  }, 350);
}

/* ===== Scroll reveal setup for page2 ===== */
(function setupScrollReveal() {
  const page2 = document.getElementById("page2");
  if (!page2) return;

  // Hero: reveal on load (already has its own CSS animation), skip observer for it.

  // Desc section: heading + paragraphs slide from left, legend slides from right
  const descHeading = page2.querySelector(".desc h2");
  const descParas = page2.querySelectorAll(".desc p");
  if (descHeading) descHeading.classList.add("reveal", "reveal-left");
  descParas.forEach((p, i) => {
    p.classList.add("reveal", "reveal-left");
    p.style.transitionDelay = 0.1 + i * 0.1 + "s";
  });

  const legend = page2.querySelector(".legend");
  if (legend) legend.classList.add("reveal", "reveal-right");

  page2.querySelectorAll(".legend-item").forEach((item, i) => {
    item.classList.add("reveal");
    item.style.transitionDelay = 0.15 + i * 0.08 + "s";
  });

  // FAQ sections: heading + intro fade up, each faq-item staggered
  page2.querySelectorAll(".faq h2, .faq-intro").forEach((el) => {
    el.classList.add("reveal");
  });
  page2.querySelectorAll(".faq-list").forEach((list) => {
    const items = list.querySelectorAll(".faq-item");
    items.forEach((item, i) => {
      item.classList.add("reveal");
      item.style.transitionDelay = Math.min(i * 0.06, 0.4) + "s";
    });
  });

  // CTA content
  const ctaInner = page2.querySelector(".cta-inner");
  if (ctaInner) ctaInner.classList.add("reveal", "reveal-scale");

  const revealTargets = page2.querySelectorAll(
    ".reveal, .reveal-left, .reveal-right, .reveal-scale",
  );

  if (!("IntersectionObserver" in window)) {
    revealTargets.forEach((el) => el.classList.add("in-view"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
  );

  revealTargets.forEach((el) => observer.observe(el));
})();

document.querySelectorAll(".faq-item").forEach((item) => {
  const q = item.querySelector(".faq-q");
  const a = item.querySelector(".faq-a");
  if (item.classList.contains("open")) {
    a.style.maxHeight = a.scrollHeight + "px";
  }
  q.addEventListener("click", () => {
    const isOpen = item.classList.contains("open");
    document.querySelectorAll(".faq-item").forEach((other) => {
      other.classList.remove("open");
      other.querySelector(".faq-a").style.maxHeight = 0;
    });
    if (!isOpen) {
      item.classList.add("open");
      a.style.maxHeight = a.scrollHeight + "px";
    }
  });
});
