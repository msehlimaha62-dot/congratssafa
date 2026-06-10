/* ============================================================
   main.js — orchestrates page load (terminal -> certificate)
   and scroll-reveal animations. Respects reduced motion.
   ============================================================ */

(function () {
  const certificate = document.getElementById("certificate");
  const terminal = document.getElementById("terminal");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function showCertificate() {
    if (terminal) terminal.style.display = "none";
    certificate.hidden = false;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => certificate.classList.add("is-in"));
    });
  }

  // ---- page load sequence ----
  if (reduceMotion || !window.runTerminal) {
    if (terminal) terminal.style.display = "none";
    showCertificate();
  } else {
    window.runTerminal(showCertificate);
  }

  // ---- scroll reveals ----
  // threshold 0 + small rootMargin = fires as soon as element peeks in,
  // more reliable on mobile where viewport is short
  const reveals = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  // ---- autoscroll tour ----
  const tourBtn = document.getElementById("tour-btn");
  const html = document.documentElement;
  const isMobile = () => window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  let raf = null;
  let playing = false;
  let paused = false;
  let pos = 0;
  let wheelTimer = null;
  let touchScrolling = false;
  let touchScrollTimer = null;

  function atBottom() {
    return window.innerHeight + window.scrollY >= document.body.scrollHeight - 2;
  }

  function scrollStep() {
    if (!playing) return;
    if (!paused && !touchScrolling) {
      pos += isMobile() ? 0.7 : 0.55;
      window.scrollTo(0, pos);
      if (atBottom()) { stopTour(); return; }
    }
    raf = requestAnimationFrame(scrollStep);
  }

  function startTour() {
    if (playing) return;
    playing = true; paused = false; touchScrolling = false;
    pos = window.scrollY;
    html.style.scrollBehavior = "auto";
    tourBtn && tourBtn.classList.add("is-playing");
    raf = requestAnimationFrame(scrollStep);
  }

  function stopTour() {
    if (!playing) return;
    playing = false; paused = false; touchScrolling = false;
    if (raf) cancelAnimationFrame(raf);
    html.style.scrollBehavior = "";
    tourBtn && tourBtn.classList.remove("is-playing");
  }

  // desktop: mouse held pauses, released resumes
  window.addEventListener("mousedown", () => { if (playing) paused = true; }, { passive: true });
  window.addEventListener("mouseup",   () => { if (playing) { pos = window.scrollY; paused = false; } }, { passive: true });

  // mobile: touchmove = user is manually scrolling → pause until they stop
  window.addEventListener("touchmove", () => {
    if (!playing) return;
    touchScrolling = true;
    clearTimeout(touchScrollTimer);
    touchScrollTimer = setTimeout(() => {
      pos = window.scrollY;
      touchScrolling = false;
    }, 600);
  }, { passive: true });

  // desktop wheel
  window.addEventListener("wheel", () => {
    if (!playing) return;
    paused = true;
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => { pos = window.scrollY; paused = false; }, 900);
  }, { passive: true });

  if (tourBtn) {
    tourBtn.addEventListener("click", () => {
      if (reduceMotion) {
        document.getElementById("journey").scrollIntoView({ behavior: "smooth" });
        return;
      }
      if (playing) stopTour(); else startTour();
    });
  }
})();