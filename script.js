function typeLine(el, text, startDelay, step) {
  if (!el) return;
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

function goToPage2(loading, page2) {
  setTimeout(() => {
    if (loading) loading.classList.add("hide");
    if (page2) page2.classList.add("show");
    document.body.classList.add("page2-active");
    setTimeout(() => {
      if (loading) loading.style.display = "none";
    }, 950);
  }, 350);
}

function setupLoadingScreen() {
  const markWrap = document.getElementById("markWrap");
  const line1 = document.getElementById("line1");
  const line2 = document.getElementById("line2");
  const fillEl = document.getElementById("fill");
  const statusEl = document.getElementById("status");
  const loading = document.getElementById("loading");
  const page2 = document.getElementById("page2");

  typeLine(line1, "SAYGON", 1.1, 0.045);
  typeLine(line2, "GROUP", 1.4, 0.045);

  setTimeout(() => {
    if (markWrap) markWrap.classList.add("settled");
  }, 2000);

  // Jika elemen progress bar tidak ada, langsung pindah ke halaman 2
  // supaya pengunjung tidak terjebak di layar loading.
  if (!fillEl || !statusEl) {
    goToPage2(loading, page2);
    return;
  }

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
        goToPage2(loading, page2);
      }
    }
    requestAnimationFrame(updatePct);
  }, FILL_START);

  // Jaring pengaman: kalau animasi progress gagal berjalan (mis. tab di
  // background lama sehingga requestAnimationFrame ditunda browser),
  // tetap paksa pindah ke halaman 2 setelah beberapa detik.
  setTimeout(
    () => {
      if (loading && !loading.classList.contains("hide")) {
        goToPage2(loading, page2);
      }
    },
    FILL_START + FILL_DURATION + 4000,
  );
}

function setupScrollReveal() {
  const page2 = document.getElementById("page2");
  if (!page2) return;

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
}

function setupFaqAccordion() {
  function syncOpenHeights() {
    document.querySelectorAll(".faq-item.open .faq-a").forEach((a) => {
      a.style.maxHeight = a.scrollHeight + "px";
    });
  }

  document.querySelectorAll(".faq-list").forEach((list) => {
    const items = list.querySelectorAll(".faq-item");
    items.forEach((item) => {
      const q = item.querySelector(".faq-q");
      const a = item.querySelector(".faq-a");
      if (!q || !a) return;
      if (item.classList.contains("open")) {
        a.style.maxHeight = a.scrollHeight + "px";
      }
      q.addEventListener("click", () => {
        const isOpen = item.classList.contains("open");
        items.forEach((other) => {
          other.classList.remove("open");
          const otherA = other.querySelector(".faq-a");
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
    document.fonts.ready.then(syncOpenHeights).catch(() => {});
  }
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(syncOpenHeights, 150);
  });
}

// Semua inisialisasi dijalankan lewat DOMContentLoaded supaya script tetap
// aman dipindah ke <head> atau diberi atribut defer/async oleh page
// builder/CDN Hostinger, dan setiap bagian dibungkus try/catch supaya satu
// fitur yang gagal (mis. karena id elemen berubah saat upload) tidak ikut
// mematikan fitur lain di halaman.
function init() {
  try {
    setupLoadingScreen();
  } catch (err) {
    console.error("Loading screen error:", err);
  }
  try {
    setupScrollReveal();
  } catch (err) {
    console.error("Scroll reveal error:", err);
  }
  try {
    setupFaqAccordion();
  } catch (err) {
    console.error("FAQ accordion error:", err);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
