# Arian Emamjomeh Portfolio

A polished, single-page portfolio for Arian Emamjomeh built with semantic HTML, bespoke CSS, and lightweight vanilla JavaScript. The site highlights academic achievements, featured projects, professional experience, and contact details in a responsive layout suitable for desktop and mobile viewing.

## Features
- Responsive sections for Home, About, Projects, Experience, Extracurriculars, and Contact.
- Animated timelines, project cards, and fade-in effects driven by an `IntersectionObserver`.
- Mobile-friendly navigation with a hamburger menu, smooth scrolling, and a sticky navbar that adapts on scroll.
- Contact form that opens the user's email client via a prefilled `mailto:` link, paired with inline success notifications.
- Optional niceties including a scroll-to-top shortcut, downloadable résumé link, and social media integrations.

## Getting Started

```bash
git clone https://github.com/ArianEmamjomeh/arianemamjomeh-portfolio.git
cd arianemamjomeh-portfolio
```

### Local Preview
1. Serve the site locally with any static file server:
   - `python3 -m http.server 8000`
   - `npx serve .`
2. Open `http://localhost:8000` in your browser.
3. After editing `styles.css` or `script.js`, hard-refresh (`Cmd+Shift+R` / `Ctrl+Shift+R`) to bypass cached assets.

## Project Structure
- `index.html` – All markup for the single-page experience, organized by anchor targets (`#home`, `#about`, etc.).
- `styles.css` – Centralized typography, layout, responsive rules, and animation keyframes.
- `script.js` – UI behaviours including navigation toggles, smooth scrolling, notifications, and scroll-to-top logic.
- `logo.png`, `profile.jpg`, `waterloo-logo.png` – Brand imagery referenced throughout the page.
- `Arian Emamjomeh Resume.docx.pdf` – Downloadable résumé surfaced from the hero section.

## Customization Tips
- Update copy directly in `index.html`; maintain heading hierarchy for accessibility.
- Add or reorder projects by editing the `.projects-grid` section; keep technology tags (`.tech-tag`) consistent for styling.
- Extend animations or breakpoints within `styles.css`, grouping new rules alongside the relevant section comments.
- Introduce new JavaScript features by wrapping them in well-named functions inside `script.js` and guarding DOM queries before use.
- If you add images or fonts, place them under an `assets/` directory and update relative paths accordingly.

## QA Checklist
- Verify navigation links, smooth scrolling, and the hamburger menu on both desktop Chrome and mobile Safari (responsive mode).
- Confirm animation triggers fire as sections enter the viewport.
- Send a test message through the contact form to ensure the `mailto:` link populates correctly and the success notification appears.
- Navigate the page using only the keyboard and check that focus styles remain visible.
- Run Lighthouse in Chrome DevTools after layout changes; aim for ≥90 in Performance and Accessibility.

## Deployment
The site is static—deploy by syncing `index.html`, `styles.css`, `script.js`, and supporting assets to your hosting provider (Netlify, GitHub Pages, Vercel, etc.). Keep external CDN dependencies (Google Fonts, Font Awesome) pinned to known-good versions to avoid unexpected regressions.

