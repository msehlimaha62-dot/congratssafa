/* ============================================================
   main.js — orchestrates page load (terminal -> certificate)
   and scroll-reveal animations. Respects reduced motion.
   ============================================================ */

(function () {
  const certificate = document.getElementById("certificate");
  const terminal    = document.getElementById("terminal");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- detect mobile (touch-only device) ---- */
  const isMobile = window.matchMedia("(hover: none) and (pointer: coarse)").matches;

  let certShown = false;

  function showCertificate() {
    if (certShown) return;  /* idempotent — safety timeout + normal path both call this */
    certShown = true;
    if (terminal) terminal.style.display = "none";
    certificate.removeAttribute("hidden");  /* removeAttribute is more reliable than .hidden=false on some iOS */
    /* setTimeout instead of double-rAF: rAF can stall on backgrounded iOS tabs */
    setTimeout(function () { certificate.classList.add("is-in"); }, 20);
  }

  /* Safety net: reveal certificate after 10 s regardless — guards against any JS error
     or rAF timing issue that prevents the terminal callback from firing. */
  setTimeout(showCertificate, 10000);

  /* ---- page load sequence ---- */
  if (reduceMotion || !window.runTerminal) {
    if (terminal) terminal.style.display = "none";
    showCertificate();
  } else {
    try {
      window.runTerminal(showCertificate);
    } catch (e) {
      showCertificate();
    }
  }

  /* ---- scroll reveals ----
     Problème mobile : threshold: 0.15 nécessite que 15% de l'élément soit
     visible. Sur un écran court avec de gros éléments, ça n'arrive jamais.
     Fix : threshold 0 + rootMargin négatif réduit = se déclenche dès que
     l'élément entre dans le viewport.
     Fallback : si l'observer ne se déclenche pas après 2s (ex: Safari iOS
     quirks), on force is-in sur tous les éléments non encore révélés.
  */
  const reveals = Array.from(document.querySelectorAll("[data-reveal]"));

  function forceRevealAll() {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  if ("IntersectionObserver" in window && !reduceMotion) {
    let revealCount = 0;
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          obs.unobserve(e.target);
          revealCount++;
        }
      });
    }, { threshold: 0, rootMargin: "0px 0px -20px 0px" });

    reveals.forEach((el) => io.observe(el));

    /* Fallback : si rien ne s'est révélé après 2.5s → force tout */
    setTimeout(() => {
      if (revealCount === 0) forceRevealAll();
    }, 2500);

  } else {
    forceRevealAll();
  }

  /* ---- autoscroll tour ----
     Problème mobile :
     1. window.scrollTo() peut être ignoré sur iOS si html/body ont
        overflow hidden ou si scroll-behavior: smooth est actif.
     2. L'ancien code utilisait pointerdown pour pauser, ce qui pausait
        aussi au tap du bouton.

     Fix :
     - Sur mobile on scrolle via el.scrollTop sur document.documentElement
       avec fallback sur document.body (iOS Safari).
     - On sépare pause desktop (mousedown) et pause mobile (touchmove).
     - On force scrollBehavior: auto sur html ET body avant de commencer.
  */
  const tourBtn = document.getElementById("tour-btn");
  const html    = document.documentElement;
  const body    = document.body;

  let raf             = null;
  let playing         = false;
  let paused          = false;
  let pos             = 0;
  let wheelTimer      = null;
  let touchScrolling  = false;
  let touchTimer      = null;

  function getScrollY() {
    return window.scrollY || html.scrollTop || body.scrollTop || 0;
  }

  function doScrollTo(y) {
    /* window.scrollTo peut être ignoré sur certains iOS — on force les deux */
    window.scrollTo(0, y);
    html.scrollTop = y;
    body.scrollTop = y;
  }

  function atBottom() {
    const scrollable = document.body.scrollHeight - window.innerHeight;
    return pos >= scrollable - 2;
  }

  function scrollStep() {
    if (!playing) return;
    if (!paused && !touchScrolling) {
      pos += isMobile ? 0.8 : 0.55;
      doScrollTo(pos);
      if (atBottom()) { stopTour(); return; }
    }
    raf = requestAnimationFrame(scrollStep);
  }

  function startTour() {
    if (playing) return;
    playing = true; paused = false; touchScrolling = false;
    pos = getScrollY();
    /* désactiver smooth scroll sur html ET body */
    html.style.scrollBehavior = "auto";
    body.style.scrollBehavior = "auto";
    tourBtn && tourBtn.classList.add("is-playing");
    raf = requestAnimationFrame(scrollStep);
  }

  function stopTour() {
    if (!playing) return;
    playing = false; paused = false; touchScrolling = false;
    if (raf) cancelAnimationFrame(raf);
    html.style.scrollBehavior = "";
    body.style.scrollBehavior = "";
    tourBtn && tourBtn.classList.remove("is-playing");
  }

  /* desktop pause */
  window.addEventListener("mousedown", () => { if (playing) paused = true; }, { passive: true });
  window.addEventListener("mouseup",   () => {
    if (playing) { pos = getScrollY(); paused = false; }
  }, { passive: true });

  /* mobile pause : pause autoscroll the instant the finger touches the screen —
     touchmove fires too late and lets the RAF fight native scroll for a few frames */
  window.addEventListener("touchstart", () => {
    if (!playing) return;
    touchScrolling = true;
    clearTimeout(touchTimer);
  }, { passive: true });

  window.addEventListener("touchmove", () => {
    if (!playing) return;
    touchScrolling = true;
    clearTimeout(touchTimer);
    touchTimer = setTimeout(() => {
      pos = getScrollY();
      touchScrolling = false;
    }, 700);
  }, { passive: true });

  /* desktop wheel */
  window.addEventListener("wheel", () => {
    if (!playing) return;
    paused = true;
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => { pos = getScrollY(); paused = false; }, 900);
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