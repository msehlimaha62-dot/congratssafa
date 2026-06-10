/* ============================================================
   gallery.js — builds the photo grid from assets/ and wires
   up an accessible lightbox with keyboard + arrow navigation.
   ============================================================ */

(function () {
  const TOTAL = 38;
  const grid = document.getElementById("gallery-grid");
  if (!grid) return;

  const sources = [];
  for (let i = 1; i <= TOTAL; i++) {
    sources.push("assets/photo" + String(i).padStart(2, "0") + ".jpg");
  }

  const cells = [];
  sources.forEach((src, idx) => {
    const cell = document.createElement("button");
    cell.className = "gallery__cell";
    cell.type = "button";
    cell.setAttribute("aria-label", "Open photo " + (idx + 1));

    const img = document.createElement("img");
    img.src = src;
    img.loading = "lazy";
    img.alt = "Safa — photo " + (idx + 1);

    cell.appendChild(img);
    cell.addEventListener("click", () => openLightbox(idx));
    grid.appendChild(cell);
    cells.push(cell);
  });

  /* ---------- rise-from-below reveal (staggered) ---------- */
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduceMotion && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        // stagger reveals as they scroll into view
        const order = cells.indexOf(e.target);
        const delay = (order % 4) * 90; // cascade across each row
        setTimeout(() => e.target.classList.add("is-in"), delay);
        obs.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    cells.forEach((c) => io.observe(c));
  } else {
    cells.forEach((c) => c.classList.add("is-in"));
  }

  /* ---------- lightbox ---------- */
  const box   = document.getElementById("lightbox");
  const boxImg = document.getElementById("lightbox-img");
  const btnClose = document.getElementById("lightbox-close");
  const btnPrev  = document.getElementById("lightbox-prev");
  const btnNext  = document.getElementById("lightbox-next");
  let current = 0;
  let savedScrollY = 0;

  function openLightbox(i) {
    current = i;
    boxImg.src = sources[i];
    box.hidden = false;
    savedScrollY = window.scrollY || window.pageYOffset || 0;
    /* Lock scroll: set on both html and body — body alone is insufficient on iOS Safari */
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    btnClose.focus();
  }
  function closeLightbox() {
    box.hidden = true;
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
    /* Restore position: iOS can jump to top when overflow changes */
    if (savedScrollY) window.scrollTo(0, savedScrollY);
  }
  function step(d) {
    current = (current + d + sources.length) % sources.length;
    boxImg.src = sources[current];
  }

  btnClose.addEventListener("click", closeLightbox);
  btnPrev.addEventListener("click", () => step(-1));
  btnNext.addEventListener("click", () => step(1));
  box.addEventListener("click", (e) => { if (e.target === box) closeLightbox(); });

  document.addEventListener("keydown", (e) => {
    if (box.hidden) return;
    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "ArrowRight") step(1);
  });

  /* ---------- swipe gestures (mobile) ---------- */
  let touchStartX = 0;
  let touchStartY = 0;
  box.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  box.addEventListener("touchend", (e) => {
    if (box.hidden) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) < 40 || Math.abs(dy) > Math.abs(dx)) return; // too short or vertical
    step(dx < 0 ? 1 : -1);
  }, { passive: true });
})();