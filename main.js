/* ==========================================================
   arian emamjomeh — shared behaviors
   top nav injection, tabs, reveal on scroll
   ========================================================== */
(function () {
    const NAV = [
        { href: "index.html",    label: "me" },
        { href: "projects.html", label: "projects" },
        { href: "things.html",   label: "things" }
    ];

    function currentPage() {
        const p = location.pathname.replace(/\/$/, "").split("/").pop();
        if (!p) return "index.html";
        return (p.endsWith(".html") ? p : p + ".html").toLowerCase();
    }

    // "projects.html" → "/projects", "index.html" → "/"
    function cleanUrl(file) {
        const name = file.replace(/\.html$/i, "");
        return name === "index" ? "/" : "/" + name;
    }

    const ICONS = {
        mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 7l8.5 6 8.5-6"/></svg>',
        github: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.11.79-.25.79-.56 0-.27-.01-1.16-.02-2.1-3.2.7-3.88-1.36-3.88-1.36-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.17.08 1.78 1.2 1.78 1.2 1.04 1.77 2.72 1.26 3.38.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.29 1.18-3.09-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18.92-.26 1.91-.39 2.9-.39.98 0 1.98.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.11 3.04.74.8 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.78 1.05.78 2.12 0 1.53-.01 2.77-.01 3.15 0 .31.21.68.8.56A11.5 11.5 0 0 0 12 .5z"/></svg>',
        linkedin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1-.01 5.01A2.5 2.5 0 0 1 4.98 3.5zM3 9h4v12H3zM9 9h3.8v1.65h.06c.53-.95 1.82-1.95 3.74-1.95 4 0 4.74 2.6 4.74 5.98V21h-4v-5.5c0-1.31-.02-3-1.83-3-1.83 0-2.11 1.42-2.11 2.9V21H9z"/></svg>',
        cv: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>'
    };

    function buildTopbar() {
        const cur = currentPage();
        const links = NAV.map(n => {
            const active = n.href.toLowerCase() === cur ? " active" : "";
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
    let clickBuffer = null;
    let clickLoading = false;
    async function loadClickBuffer() {
        if (clickBuffer || clickLoading) return;
        clickLoading = true;
        try {
            const ctx = ensureCtx();
            const res = await fetch("assets/universfield-computer-mouse-click-352734.mp3");
            const ab = await res.arrayBuffer();
            clickBuffer = await new Promise((resolve, reject) =>
                ctx.decodeAudioData(ab, resolve, reject));
        } catch (e) { /* no-op */ }
        clickLoading = false;
    }
    function playClick() {
        try {
            const ctx = ensureCtx();
            if (!clickBuffer) { loadClickBuffer(); return; }
            const src = ctx.createBufferSource();
            src.buffer = clickBuffer;
            const gain = ctx.createGain();
            gain.gain.value = 0.3;
            src.connect(gain).connect(ctx.destination);
            src.start();
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

    const pageCache = new Map();
    async function swapPage(url, push = true) {
        try {
            let html = pageCache.get(url);
            if (!html) {
                const res = await fetch(url, { credentials: "same-origin" });
                if (!res.ok) throw new Error("fetch failed");
                html = await res.text();
                pageCache.set(url, html);
            }
            const doc = new DOMParser().parseFromString(html, "text/html");
            const newMain = doc.querySelector("main");
            const currentMain = document.querySelector("main");
            if (!newMain || !currentMain) throw new Error("missing main");
            const newTitle = doc.querySelector("title")?.textContent || document.title;
            const newBodyClass = doc.body.className;

            const apply = () => {
                currentMain.replaceWith(newMain);
                document.body.className = newBodyClass;
                document.title = newTitle;
                if (push) history.pushState({ url }, "", cleanUrl(url));
                window.scrollTo(0, 0);
                // Rewire behaviors for the freshly inserted DOM
                revealOnScroll();
                wireExpTabs();
                wireProjectFilters();
                wireWorkRowHover();
                wirePrevToggle();
                splitHeroWords();
                renderGames();
                // Refresh active state on topnav
                const cur = currentPage();
                document.querySelectorAll(".topnav a").forEach(a => {
                    a.classList.toggle("active", (a.getAttribute("href") || "").toLowerCase() === cur);
                });
            };

            if (document.startViewTransition) {
                document.startViewTransition(apply);
            } else {
                apply();
            }
        } catch (err) {
            window.location.href = url; // graceful fallback
        }
    }

    function primeAudio() { ensureCtx(); loadClickBuffer(); }

    function wireClickSounds() {
        document.addEventListener("pointerdown", primeAudio, { once: true });
        document.addEventListener("click", (e) => {
            const navHit = e.target.closest(".topnav a, .brand");
            if (navHit) {
                playNavClick();
                const href = navHit.getAttribute("href") || "";
                const isInternalPage = /^(index|projects|experience|map|games|things)\.html$/i.test(href);
                if (isInternalPage) {
                    e.preventDefault();
                    if (href.toLowerCase() !== currentPage()) swapPage(href);
                }
            } else {
                playClick();
            }
        }, true);
    }

    window.addEventListener("popstate", () => {
        const url = currentPage();
        swapPage(url, false);
    });

    function wireWorkRowMagnet() {
        /* removed by user request */
    }

    const STAR_PATH = "M12 2.2l2.9 6.6 7.1.6-5.4 4.8 1.6 7L12 17.6 5.8 21.2l1.6-7L2 9.4l7.1-.6z";
    function starSVG(state) {
        return `<svg class="game-star ${state}" viewBox="0 0 24 24" aria-hidden="true">
            <path class="star-bg" d="${STAR_PATH}"/>
            <path class="star-fill" d="${STAR_PATH}"/>
        </svg>`;
    }
    function starsHTML(rating) {
        const r = Number(rating) || 0;
        return Array.from({ length: 5 }, (_, i) => {
            const pos = i + 1;
            let state = "off";
            if (r >= pos) state = "on";
            else if (r >= pos - 0.5) state = "half";
            return starSVG(state);
        }).join("");
    }

    let gamesData = [];

    function openGameModal(appid) {
        const g = gamesData.find(x => String(x.appid) === String(appid));
        if (!g) return;
        const scrim = document.querySelector(".game-modal-scrim");
        if (!scrim) return;

        scrim.querySelector(".game-modal-title").textContent = g.title;
        const coverImg = scrim.querySelector(".game-modal-cover");
        coverImg.src = g.cover;
        coverImg.onerror = () => { coverImg.onerror = null; coverImg.src = g.cover_fallback; };

        const ratingRow = scrim.querySelector(".game-modal-stars");
        ratingRow.innerHTML = starsHTML(g.rating || 0);

        const meta = scrim.querySelector(".game-modal-meta");
        const parts = [];
        if (g.playtime_hours) parts.push(`${g.playtime_hours}h played`);
        if (g.achievements_total) parts.push(`${g.achievements_earned} / ${g.achievements_total} achievements`);
        meta.textContent = parts.join(" · ");

        scrim.querySelector(".game-modal-completed").hidden = !g.completed;

        const rankEl = scrim.querySelector(".game-modal-rank");
        if (g.rank && g.rank.image && g.category === "competitive") {
            rankEl.style.setProperty("--rank-color", g.rank.color || "180, 120, 230");
            scrim.querySelector(".modal-rank-img").src = g.rank.image;
            scrim.querySelector(".modal-rank-name").textContent = (g.rank.label || "").toUpperCase();
            rankEl.hidden = false;
        } else {
            rankEl.hidden = true;
        }

        const noteEl = scrim.querySelector(".game-modal-note");
        const noteWrap = scrim.querySelector(".game-modal-note-wrap");
        if (g.note) {
            noteEl.textContent = g.note;
            noteWrap.hidden = false;
        } else {
            noteEl.textContent = "";
            noteWrap.hidden = true;
        }

        const achWrap = scrim.querySelector(".game-modal-achievements");
        const achGrid = scrim.querySelector(".game-modal-ach-grid");
        const list = g.earned_achievements || [];
        if (g.achievements_total > 0) {
            achWrap.hidden = false;
            const pct = Math.round((g.achievements_earned / g.achievements_total) * 100);
            const bannerTitle = scrim.querySelector(".ach-banner-title");
            const bannerSub = scrim.querySelector(".ach-banner-sub");
            const barFill = scrim.querySelector(".ach-banner-bar-fill");
            bannerTitle.textContent = g.completed
                ? `You've unlocked all achievements! ${g.achievements_earned}/${g.achievements_total} (${pct}%)`
                : `${g.achievements_earned} / ${g.achievements_total} achievements (${pct}%)`;
            if (g.global_completion_percent != null) {
                bannerSub.textContent = `Only ${g.global_completion_percent}% of players have completed this game`;
                bannerSub.hidden = false;
            } else {
                bannerSub.textContent = "";
                bannerSub.hidden = true;
            }
            barFill.style.width = pct + "%";
            scrim.querySelector(".ach-banner").classList.toggle("is-100", g.completed);

            const fmt = (ts) => {
                if (!ts) return "";
                const d = new Date(ts * 1000);
                return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            };
            const esc = (s) => (s == null ? "" : String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
            achGrid.innerHTML = list.map(a => {
                return `
                <div class="ach-item"
                    data-icon="${esc(a.icon || "")}"
                    data-name="${esc(a.name)}"
                    data-desc="${esc(a.description || "")}"
                    data-date="${a.unlocked_at ? esc(fmt(a.unlocked_at)) : ""}"
                    data-rarity="${a.global_percent != null ? a.global_percent : ""}">
                    ${a.icon ? `<img class="ach-icon" src="${a.icon}" alt="">` : `<div class="ach-icon ach-icon--blank"></div>`}
                    <div class="ach-body">
                        <div class="ach-name">${esc(a.name)}</div>
                    </div>
                </div>`;
            }).join("");
            wireAchTooltip(scrim);
        } else {
            achWrap.hidden = true;
            achGrid.innerHTML = "";
        }

        scrim.classList.add("is-open");
        scrim.setAttribute("aria-hidden", "false");
    }

    function closeGameModal() {
        const scrim = document.querySelector(".game-modal-scrim");
        if (!scrim) return;
        scrim.classList.remove("is-open");
        scrim.setAttribute("aria-hidden", "true");
        const tt = scrim.querySelector(".ach-tooltip");
        if (tt) tt.classList.remove("is-visible");
    }

    function wireAchTooltip(scrim) {
        const tt = scrim.querySelector(".ach-tooltip");
        if (!tt) return;
        const ttIcon   = tt.querySelector(".tt-icon");
        const ttName   = tt.querySelector(".tt-name");
        const ttDesc   = tt.querySelector(".tt-desc");
        const ttDate   = tt.querySelector(".tt-date");
        const ttRarity = tt.querySelector(".tt-rarity");

        function show(item) {
            const icon = item.dataset.icon;
            const name = item.dataset.name;
            const desc = item.dataset.desc;
            const date = item.dataset.date;
            const rarity = item.dataset.rarity;

            if (icon) { ttIcon.src = icon; ttIcon.hidden = false; } else { ttIcon.hidden = true; }
            ttName.textContent = name || "";
            ttDesc.textContent = desc || "";
            ttDesc.hidden = !desc;
            ttDate.textContent = date ? `Unlocked on ${date}` : "";
            ttDate.hidden = !date;
            ttRarity.textContent = rarity ? `${rarity}% of players have this achievement` : "";
            ttRarity.hidden = !rarity;

            // Show first (without transition) to measure, then position
            tt.classList.add("is-visible");
            const itemRect = item.getBoundingClientRect();
            const ttRect = tt.getBoundingClientRect();
            const gap = 10;
            const vw = window.innerWidth;
            const vh = window.innerHeight;

            // Prefer right side of the item; fall back to left if no room
            let left = itemRect.right + gap;
            if (left + ttRect.width > vw - 12) left = itemRect.left - ttRect.width - gap;
            if (left < 12) left = 12;

            let top = itemRect.top + itemRect.height / 2 - ttRect.height / 2;
            if (top < 12) top = 12;
            if (top + ttRect.height > vh - 12) top = vh - 12 - ttRect.height;

            tt.style.left = `${Math.round(left)}px`;
            tt.style.top  = `${Math.round(top)}px`;
            tt.setAttribute("aria-hidden", "false");
        }

        function hide() {
            tt.classList.remove("is-visible");
            tt.setAttribute("aria-hidden", "true");
        }

        scrim.querySelectorAll(".ach-item").forEach(item => {
            item.addEventListener("mouseenter", () => show(item));
            item.addEventListener("mouseleave", hide);
            item.addEventListener("focus", () => show(item));
            item.addEventListener("blur", hide);
        });
    }

    function wireGameModal() {
        const scrim = document.querySelector(".game-modal-scrim");
        if (!scrim || scrim.dataset.wired) return;
        scrim.dataset.wired = "1";

        scrim.querySelector(".game-modal-close").addEventListener("click", closeGameModal);
        scrim.addEventListener("click", (e) => { if (e.target === scrim) closeGameModal(); });
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && scrim.classList.contains("is-open")) closeGameModal();
        });
    }

    async function renderGames() {
        const grid = document.getElementById("games-grid");
        if (!grid) return;
        try {
            const [steamRes, manualRes] = await Promise.all([
                fetch("assets/games.json", { cache: "no-cache" }),
                fetch("assets/games-manual.json", { cache: "no-cache" }).catch(() => null)
            ]);
            const steam = await steamRes.json();
            const manual = manualRes && manualRes.ok ? await manualRes.json() : [];
            const allGames = [
                ...(Array.isArray(steam) ? steam : []),
                ...(Array.isArray(manual) ? manual : [])
            ];
            if (allGames.length === 0) {
                grid.innerHTML = `<div class="games-empty">no games yet. run <code>node scripts/fetch-steam.js</code> to populate.</div>`;
                return;
            }
            gamesData = allGames;

            const sorted = [...allGames].sort((a, b) => {
                return (b.rating || 0) - (a.rating || 0)
                    || (b.playtime_hours || 0) - (a.playtime_hours || 0);
            });
            // Keep Hollow Knight + Silksong adjacent, OG first
            const HK = 367520, SILKSONG = 1030300;
            const silksongIdx = sorted.findIndex(g => g.appid === SILKSONG);
            if (silksongIdx !== -1) {
                const [silksong] = sorted.splice(silksongIdx, 1);
                const hkIdx = sorted.findIndex(g => g.appid === HK);
                if (hkIdx !== -1) sorted.splice(hkIdx + 1, 0, silksong);
                else sorted.unshift(silksong);
            }

            function renderCard(g) {
                const hoursOverlay = (g.playtime_hours || 0) > 0
                    ? `<div class="cover-overlay cover-hours">${g.playtime_hours} hrs</div>`
                    : "";
                let belowCover = "";
                let coverInside = "";
                if (g.rank && g.rank.image && g.category === "competitive") {
                    const rankColor = g.rank.color || "180, 120, 230";
                    const rankSize = g.rank.size || 110;
                    belowCover = `<div class="rank-badge" style="--rank-color: ${rankColor}; --rank-size: ${rankSize}px;"><img src="${g.rank.image}" alt="${g.rank.label || "rank"}"></div>`;
                } else if ((g.achievements_total || 0) > 0) {
                    const pct = Math.round((g.achievements_earned / g.achievements_total) * 100);
                    const is100 = pct === 100;
                    const medal = is100
                        ? `<svg class="cover-medal" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="10" r="6" fill="#f2c04b" stroke="#b88a1f" stroke-width="1"/><path d="M9 14l-2 6 5-3 5 3-2-6" fill="#4a8ee0" stroke="#2563b8" stroke-width="0.8"/><path d="M10.6 10l1 1 2-2.2" stroke="#fff" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`
                        : "";
                    coverInside = `<div class="cover-overlay cover-complete${is100 ? ' is-100' : ''}">${medal}<span>${pct}% Complete</span></div>`;
                }
                const imgFit = g.cover_fit === "contain" ? "contain" : "cover";
                const coverSafe = (g.cover || "").replace(/'/g, "%27");
                const bgLayer = g.cover_fit === "contain"
                    ? `<div class="cover-bg" style="background-image: url('${coverSafe}');"></div>`
                    : "";
                const cat = g.category || "all";
                return `
                <div class="game-card" data-appid="${g.appid}" data-category="${cat}">
                    <div class="game-cover">
                        <div class="cover-art">
                            ${bgLayer}
                            <img class="cover-fg" src="${g.cover}" alt="${g.title}"
                                 style="object-fit: ${imgFit};"
                                 onerror="this.onerror=null;this.src='${g.cover_fallback}';">
                            ${hoursOverlay}
                            ${coverInside}
                        </div>
                    </div>
                    ${belowCover}
                    <div class="game-meta">
                        <div class="game-title">${g.title}</div>
                        <div class="game-stars">${starsHTML(g.rating || 0)}</div>
                    </div>
                </div>`;
            }

            grid.innerHTML = sorted.map(renderCard).join("");

            grid.querySelectorAll(".game-card").forEach(card => {
                card.addEventListener("click", () => openGameModal(card.dataset.appid));
            });

            // Filter tabs (all / competitive / …)
            const filters = document.querySelectorAll(".games-filter");
            function applyFilter(cat) {
                grid.querySelectorAll(".game-card").forEach(card => {
                    const show = (card.dataset.category || "all") === cat;
                    card.style.display = show ? "" : "none";
                });
            }
            filters.forEach(btn => {
                btn.addEventListener("click", () => {
                    filters.forEach(b => b.classList.toggle("active", b === btn));
                    applyFilter(btn.dataset.cat);
                });
            });
            const activeBtn = document.querySelector(".games-filter.active");
            if (activeBtn) applyFilter(activeBtn.dataset.cat);

            wireGameModal();
        } catch (e) {
            grid.innerHTML = `<div class="games-empty">couldn't load games.json</div>`;
        }
    }

    function wireProjCardTilt() {
        /* removed by user request */
    }

    // Swallow clicks on placeholder <a href="#"> so they don't scroll to top
    document.addEventListener("click", (e) => {
        const a = e.target.closest("a");
        if (!a) return;
        const href = a.getAttribute("href");
        if (href === "#" || href === "" || href == null) e.preventDefault();
    });

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
        renderGames();
        wireWorkRowMagnet();
        wireProjCardTilt();
    });
})();
