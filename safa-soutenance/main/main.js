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
    // next frame so the transition runs
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
  const reveals = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  // ---- slow autoscroll tour (hold to pause, release to resume) ----
  const tourBtn = document.getElementById("tour-btn");
  const SPEED = 0.55;      // px per frame ≈ a gentle, very slow drift
  const html = document.documentElement;
  let raf = null;
  let playing = false;
  let paused = false;
  let pos = 0;
  let wheelTimer = null;

  function atBottom() {
    return window.innerHeight + window.scrollY >= document.body.scrollHeight - 2;
  }

  function step() {
    if (!playing) return;
    if (!paused) {
      pos += SPEED;
      window.scrollTo(0, pos);
      if (atBottom()) { stopTour(); return; }
    }
    raf = requestAnimationFrame(step);
  }

  function startTour() {
    if (playing) return;
    playing = true; paused = false;
    pos = window.scrollY;
    html.style.scrollBehavior = "auto";   // avoid fighting CSS smooth-scroll
    tourBtn && tourBtn.classList.add("is-playing");
    raf = requestAnimationFrame(step);
  }

  function stopTour() {
    if (!playing) return;
    playing = false; paused = false;
    if (raf) cancelAnimationFrame(raf);
    html.style.scrollBehavior = "";       // restore CSS smooth
    tourBtn && tourBtn.classList.remove("is-playing");
  }

  function pause() { if (playing) paused = true; }
  function resume() {                      // re-sync after any manual move
    if (playing) { pos = window.scrollY; paused = false; }
  }

  // finger/mouse held down → pause; lifted → resume
  window.addEventListener("pointerdown", pause, { passive: true });
  window.addEventListener("pointerup", resume, { passive: true });
  window.addEventListener("pointercancel", resume, { passive: true });

  // desktop wheel: pause while scrolling, resume shortly after it settles
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
