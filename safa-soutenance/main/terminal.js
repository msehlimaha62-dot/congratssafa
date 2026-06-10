/* ============================================================
   terminal.js — types the "compile your success" sequence,
   animates the loading bar, then hands off to the certificate.
   Exposes window.runTerminal(onComplete).
   ============================================================ */

(function () {
  const screen = document.getElementById("terminal-screen");
  const cursor = document.getElementById("cursor");
  const term   = document.getElementById("terminal");

  // each step: typed command line, then instant output lines
  const steps = [
    { cmd: "whoami", out: [["t-ok", "safa.ben.hajali"]] },
    { cmd: "git log --oneline -1", out: [["t-ok", "a1b2c3d  fix: survived the viva \uD83C\uDF93"]] },
    { cmd: 'run compile_success.sh --student "Safa"', out: "BAR" },
    { cmd: null, out: [
        ["t-ok",   "build: PASSED   \u2714   0 errors \u00b7 0 warnings"],
        ["t-info", "deploying: B.Sc. Computer Science"],
        ["t-info", "            \u2192 Software Engineering & Information Systems"],
        ["t-dim",  "done in 3 years. \u2728"]
    ] }
  ];

  const TYPE = 85;   // ms per char (slower, more deliberate)
  let buffer = "";   // committed html

  function render(extra = "") {
    screen.innerHTML = buffer + extra +
      '<span class="terminal__cursor">\u2588</span>';
  }

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  async function typeCmd(text) {
    let typed = "";
    for (const ch of text) {
      typed += ch;
      render('<span class="t-prompt">$ </span><span class="t-cmd">' + escapeHtml(typed) + "</span>");
      await sleep(TYPE);
    }
    buffer += '<span class="t-prompt">$ </span><span class="t-cmd">' + escapeHtml(text) + "</span>\n";
  }

  async function loadingBar() {
    const width = 22;
    for (let i = 0; i <= width; i++) {
      const filled = "\u2588".repeat(i);
      const empty  = "\u2591".repeat(width - i);
      const pct = Math.round((i / width) * 100);
      render('<span class="t-bar">[' + filled + empty + "] compiling your success... " + pct + "%</span>");
      await sleep(95);
    }
    buffer += '<span class="t-bar">[' + "\u2588".repeat(width) + "] compiling your success... 100%</span>\n";
  }

  function printOut(lines) {
    for (const [cls, txt] of lines) {
      buffer += '<span class="' + cls + '">' + escapeHtml(txt) + "</span>\n";
    }
    render();
  }

  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  window.runTerminal = async function (onComplete) {
    cursor && cursor.remove();
    render();
    await sleep(450);
    for (const step of steps) {
      if (step.cmd) { await typeCmd(step.cmd); await sleep(360); }
      if (step.out === "BAR") { await loadingBar(); }
      else if (Array.isArray(step.out)) { printOut(step.out); }
      await sleep(620);
    }
    await sleep(1100);
    term.classList.add("is-done");
    await sleep(650);
    if (typeof onComplete === "function") onComplete();
  };
})();
