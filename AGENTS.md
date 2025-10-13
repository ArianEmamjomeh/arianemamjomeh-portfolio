# Repository Guidelines

## Project Structure & Module Organization
- `index.html` holds all markup for the one-page portfolio, grouped by navigation section (`#home`, `#about`, etc.).
- `styles.css` centralizes global styles, responsive rules, and CSS animations; keep new styles near related sections.
- `script.js` manages UI behaviors (nav toggles, smooth scroll, notifications). Extend modularly by wrapping new features in clearly named functions.
- Assets such as images or fonts should live in a new `assets/` folder; reference them with relative paths from `index.html`.

## Development & Preview Commands
- `python3 -m http.server 8000` — serves the site locally for quick smoke testing. Visit `http://localhost:8000`.
- `npx serve .` — alternative static server with caching headers similar to production hosts.
- After updating CSS or JS, hard-refresh the browser (`Cmd+Shift+R`) to clear cached assets.

## Coding Style & Naming Conventions
- Indent HTML, CSS, and JS with 4 spaces; no tabs.
- Use lowercase, hyphen-separated class names (`.hero-container`) and camelCase for JS identifiers (`scrollToTopBtn`).
- Favor semantic HTML (`<section>`, `<nav>`, `<h2>`) and keep heading levels sequential for accessibility.
- In JavaScript, prefer `const`/`let`, arrow functions for callbacks, and guard DOM queries before use.
- Keep inline CSS creation (e.g., notification styles) grouped at the bottom of `script.js` to preserve readability.

## Testing & QA Expectations
- Manually verify navigation, animations, and form behaviors in desktop Chrome and mobile Safari (use responsive mode in dev tools).
- Run Lighthouse (Chrome DevTools) after significant layout changes; target performance and accessibility scores ≥90.
- Confirm keyboard navigation works and that focus styles remain visible.

## Commit & Pull Request Guidelines
- Write imperative commit subjects ≤50 chars (e.g., `Add project timeline animations`). Group related changes into a single commit.
- Reference GitHub issues in the body (`Fixes #12`) and summarize key changes in bullet form.
- Pull requests should include before/after screenshots or videos for visual updates, a manual test checklist, and any follow-up tasks.

## Deployment Notes
- Site is static; redeploy by syncing `index.html`, `styles.css`, and `script.js` to the hosting provider.
- Keep external CDN links (Google Fonts, Font Awesome) pinned to known-good versions to avoid unexpected regressions.
