# Congratulations, Safa 🎓

A small static site celebrating **Safa Ben Hajali**'s thesis defense —
Bachelor of Computer Science, specialty *Software Engineering & Information Systems*.

## Open it
Just open `index.html` in any browser. No build step, no server needed.

## Structure (modular)
```
safa-soutenance/
├── index.html          ← the page
├── style/
│   ├── main.css         ← tokens, layout, hero, footer
│   ├── terminal.css     ← the "compile your success" terminal
│   ├── journey.css      ← git-log timeline + the letter
│   └── gallery.css      ← photo grid + lightbox
├── main/
│   ├── terminal.js      ← typing + loading-bar sequence
│   ├── gallery.js       ← builds the grid + lightbox
│   └── main.js          ← page-load orchestration + reveals
├── assets/
│   └── photo01.jpg … photo38.jpg
└── README.md
```

## Sections
1. **Hero** — a terminal boots up and "compiles your success", then a gilded
   *Congratulations, Safa* certificate is revealed.
2. **The commit history** — her three years told as a `git log`, ending on
   `release: defended the thesis` tagged v1.0.
3. **A note for you** — a personal letter.
4. **Gallery** — 38 photos, click any to open the lightbox (← → to navigate).

## Customize
- The letter text → `index.html` (`.note__body`) — edit the signature there too.
- Timeline commits → `index.html` (`.log`).
- Terminal speed → `TYPE` constant in `main/terminal.js` (bigger = slower).
- Colors → `:root` at the top of `style/main.css`.

Built with care. 🤍
