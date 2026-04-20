/* ==========================================================
   arian emamjomeh — shared behaviors
   top nav injection, tabs, reveal on scroll
   ========================================================== */
(function () {
    const CURRENT = (location.pathname.split("/").pop() || "index.html").toLowerCase();

    const NAV = [
        { href: "index.html",      label: "me" },
        { href: "projects.html",   label: "projects" }
    ];

    const ICONS = {
        mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 7l8.5 6 8.5-6"/></svg>',
        github: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.11.79-.25.79-.56 0-.27-.01-1.16-.02-2.1-3.2.7-3.88-1.36-3.88-1.36-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.17.08 1.78 1.2 1.78 1.2 1.04 1.77 2.72 1.26 3.38.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.29 1.18-3.09-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18.92-.26 1.91-.39 2.9-.39.98 0 1.98.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.11 3.04.74.8 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.78 1.05.78 2.12 0 1.53-.01 2.77-.01 3.15 0 .31.21.68.8.56A11.5 11.5 0 0 0 12 .5z"/></svg>',
        linkedin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1-.01 5.01A2.5 2.5 0 0 1 4.98 3.5zM3 9h4v12H3zM9 9h3.8v1.65h.06c.53-.95 1.82-1.95 3.74-1.95 4 0 4.74 2.6 4.74 5.98V21h-4v-5.5c0-1.31-.02-3-1.83-3-1.83 0-2.11 1.42-2.11 2.9V21H9z"/></svg>',
        cv: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>'
    };

    function buildTopbar() {
        const links = NAV.map(n => {
            const active = n.href.toLowerCase() === CURRENT ? " active" : "";
            return `<a href="${n.href}" class="${active.trim()}">${n.label}</a>`;
        }).join("");

        const html = `
        <div class="topbar-inner">
            <a class="brand" href="index.html">
                <span class="brand-dot"></span>
                <span class="brand-name">arian emamjomeh</span>
            </a>
            <nav class="topnav">${links}</nav>
            <div class="socials">
                <a href="mailto:arianemamjomeh@gmail.com" aria-label="email" title="email">${ICONS.mail}</a>
                <a href="https://github.com/arianemamjomeh" target="_blank" rel="noopener" aria-label="github" title="github">${ICONS.github}</a>
                <a href="https://www.linkedin.com/in/arian-emamjomeh/" target="_blank" rel="noopener" aria-label="linkedin" title="linkedin">${ICONS.linkedin}</a>
                <a href="#" aria-label="resume" title="resume">${ICONS.cv}</a>
            </div>
        </div>`;

        const bar = document.createElement("header");
        bar.className = "topbar";
        bar.innerHTML = html;
        document.body.prepend(bar);
    }

    function buildFooter() {
        const f = document.createElement("footer");
        f.innerHTML = `arian emamjomeh <span class="dot">•</span> waterloo, on <span class="dot">•</span> ${new Date().getFullYear()}`;
        document.body.appendChild(f);
    }

    function revealOnScroll() {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
        }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
        document.querySelectorAll(".reveal").forEach(el => io.observe(el));
    }

    function wireExpTabs() {
        const tabs = document.querySelectorAll(".exp-tab");
        if (!tabs.length) return;
        tabs.forEach(tab => {
            tab.addEventListener("click", () => {
                const id = tab.dataset.panel;
                document.querySelectorAll(".exp-tab").forEach(t => t.classList.toggle("active", t === tab));
                document.querySelectorAll(".exp-panel").forEach(p => p.classList.toggle("active", p.id === id));
            });
        });
    }

    function wireProjectFilters() {
        const buttons = document.querySelectorAll(".proj-filter");
        if (!buttons.length) return;
        buttons.forEach(btn => {
            btn.addEventListener("click", () => {
                const cat = btn.dataset.cat;
                buttons.forEach(b => b.classList.toggle("active", b === btn));
                document.querySelectorAll(".proj-card").forEach(card => {
                    const tags = (card.dataset.tags || "").split(" ");
                    const show = cat === "all" || tags.includes(cat);
                    card.style.display = show ? "" : "none";
                });
            });
        });
    }

    function wireWorkRowHover() {
        document.querySelectorAll(".work-row[data-hover-color]").forEach(row => {
            row.style.setProperty("--hover-color", row.dataset.hoverColor);
        });
    }

    function wirePrevToggle() {
        const btn = document.querySelector(".prev-toggle");
        const list = document.querySelector(".prev-list");
        if (!btn || !list) return;
        btn.addEventListener("click", () => {
            const open = btn.getAttribute("aria-expanded") === "true";
            btn.setAttribute("aria-expanded", String(!open));
            list.classList.toggle("is-open", !open);
            list.setAttribute("aria-hidden", String(open));
        });
    }

    function splitHeroWords() {
        const h = document.querySelector(".me-hello");
        if (!h || h.dataset.split) return;
        h.dataset.split = "1";
        // wrap top-level text nodes and inline elements into .word spans by text segments
        const parts = [];
        h.childNodes.forEach(n => {
            if (n.nodeType === 3) {
                n.textContent.split(/(\s+)/).forEach(t => { if (t) parts.push({ text: t }); });
            } else {
                parts.push({ el: n.cloneNode(true) });
            }
        });
        h.innerHTML = "";
        let wordIdx = 0;
        parts.forEach(p => {
            if (p.text !== undefined) {
                if (/^\s+$/.test(p.text)) {
                    h.appendChild(document.createTextNode(p.text));
                } else {
                    const s = document.createElement("span");
                    s.className = "word";
                    s.textContent = p.text;
                    s.style.animationDelay = (0.05 + wordIdx * 0.13) + "s";
                    h.appendChild(s);
                    wordIdx++;
                }
            } else {
                const s = document.createElement("span");
                s.className = "word";
                s.appendChild(p.el);
                s.style.animationDelay = (0.05 + wordIdx * 0.13) + "s";
                h.appendChild(s);
                wordIdx++;
            }
        });
    }

    let audioCtx = null;
    function ensureCtx() {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === "suspended") audioCtx.resume();
        return audioCtx;
    }
    const clickSample = new Audio("assets/universfield-computer-mouse-click-352734.mp3");
    clickSample.preload = "auto";
    clickSample.volume = 0.3;
    function playClick() {
        try {
            const a = clickSample.cloneNode();
            a.volume = clickSample.volume;
            a.play().catch(() => {});
        } catch (e) { /* no-op */ }
    }
    function playNavClick() {
        try {
            const ctx = ensureCtx();
            const t = ctx.currentTime;
            // two-tone chime — C5 then E5, all-linear envelope that truly reaches zero
            [[523.25, 0], [659.25, 0.09]].forEach(([freq, offset]) => {
                const start = t + offset;
                const attackEnd = start + 0.008;
                const releaseEnd = start + 0.22;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = "sine";
                osc.frequency.setValueAtTime(freq, start);
                gain.gain.setValueAtTime(0, start);
                gain.gain.linearRampToValueAtTime(0.035, attackEnd);
                gain.gain.linearRampToValueAtTime(0, releaseEnd);
                osc.connect(gain).connect(ctx.destination);
                osc.start(start);
                osc.stop(releaseEnd + 0.005);
            });
        } catch (e) { /* no-op if audio unsupported */ }
    }

    function wireClickSounds() {
        document.addEventListener("click", (e) => {
            const navHit = e.target.closest(".topnav a, .brand");
            if (navHit) {
                playNavClick();
                const navigatesSameTab = navHit.tagName === "A" &&
                    navHit.getAttribute("href") &&
                    navHit.getAttribute("target") !== "_blank" &&
                    !navHit.getAttribute("href").startsWith("#") &&
                    !navHit.getAttribute("href").startsWith("mailto:");
                if (navigatesSameTab) {
                    e.preventDefault();
                    setTimeout(() => { window.location.href = navHit.href; }, 340);
                }
            } else {
                playClick();
            }
        }, true);
    }

    function wireWorkRowMagnet() {
        /* removed by user request */
    }

    function wireProjCardTilt() {
        /* removed by user request */
    }

    document.addEventListener("DOMContentLoaded", () => {
        buildTopbar();
        buildFooter();
        revealOnScroll();
        wireExpTabs();
        wireProjectFilters();
        wireWorkRowHover();
        wirePrevToggle();
        wireClickSounds();
        splitHeroWords();
        wireWorkRowMagnet();
        wireProjCardTilt();
    });
})();
