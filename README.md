# Portfolio (Static) — GitHub Pages Ready

This repo is a **static HTML/CSS/JS** clone-style starter inspired by the layout in a handful of portfolios (built page-by-page).

## What’s included (so far)

- `index.html` — **Case Studies** landing page (responsive)
- `css/` — reset + tokenized theming + component styles
- `js/main.js` — dark mode (persisted) + mobile nav
- `assets/` — local SVG placeholders + favicon

## Run locally

Because this is static, you can open `index.html` directly.

For best results (routing + fetch support later), run a local server:

```bash
python -m http.server 5173
# then open http://localhost:5173
```

## Deploy to GitHub Pages

1. Push this repo to GitHub
2. Repo → **Settings** → **Pages**
3. Source: **Deploy from a branch**
4. Branch: `main` / folder: `/ (root)`

## Next page

Tell me which page you want next:
- A case study detail page (Thrive Gamification / Thrive Onboarding / Thrive Design System / Wpromote Design System / TF Intl Coaching Platform)
- Design Process
- Design & AI
- Design Tenets
- About Me


## Design Process drawer content
The Design Process page uses a right-side drawer tray. The drawer content is loaded from `assets/process-drawer-content.json`.

Because the drawer experience is a JavaScript-only app and cannot be fetched as HTML in this environment, you’ll need to paste the exact tray text into that JSON file (or send screenshots and I can fill it in for you).
