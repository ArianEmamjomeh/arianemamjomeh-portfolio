/* ==========================================================
   map.js — draggable illustrated map with location albums
   ========================================================== */

(function () {
    // World coordinates are in SVG units (0..3200 x 0..2000).
    // Each place is anchored at an (x, y) in that space.
    const PLACES = [
        {
            id: "waterloo",
            name: "waterloo",
            sub: "university of waterloo",
            coords: "43.4723° N, 80.5449° W",
            years: "2025 — now",
            x: 1120,
            y: 820,
            photos: [
                // Placeholder entries. Replace src: "assets/..." when you add photos.
                { src: null, caption: "ring road, first week" },
                { src: null, caption: "dc library, 2am" },
                { src: null, caption: "grad house" },
                { src: null, caption: "e7 atrium" },
                { src: null, caption: "laurel creek" },
                { src: null, caption: "columbia lake" }
            ]
        },
        {
            id: "peths",
            name: "peths",
            sub: "pierre elliott trudeau hs",
            coords: "43.8761° N, 79.2829° W",
            years: "2021 — 2025",
            x: 2180,
            y: 1180,
            photos: [
                { src: "pethspics/pethschristmasjpg.jpg", caption: "christmas" },
                { src: null, caption: "the courtyard" },
                { src: null, caption: "robotics lab" },
                { src: null, caption: "graduation" },
                { src: null, caption: "library" },
                { src: null, caption: "main hall" },
                { src: null, caption: "parking lot, last day" }
            ]
        }
    ];

    // World dimensions
    const W = 3200;
    const H = 2000;

    // Transform state
    let tx = 0, ty = 0, scale = 1;
    const MIN_SCALE = 0.45;
    const MAX_SCALE = 2.2;

    // Refs
    let stage, canvas, pinsLayer, places = {};

    function init() {
        stage = document.querySelector(".map-stage");
        canvas = document.querySelector(".map-canvas");
        if (!stage || !canvas) return;

        buildWorld();
        buildPins();
        buildPlacesMenu();
        bindDrag();
        bindZoom();
        bindControls();
        bindAlbum();

        // center on Waterloo by default
        const rect = stage.getBoundingClientRect();
        scale = 0.75;
        focusOn(PLACES[0].x, PLACES[0].y, rect, false);
        applyTransform();
    }

    /* ---------- world svg (minimalist transit style) ---------- */

    function buildWorld() {
        // Flat background, faint grid, single connecting line. That's it.
        const ns = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(ns, "svg");
        svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
        svg.setAttribute("width", W);
        svg.setAttribute("height", H);
        svg.style.display = "block";

        // Build the connecting line as an orthogonal transit-style path
        // from Waterloo -> PETHS: go east, then step south-east in 45° segments.
        const a = PLACES[0], b = PLACES[1];
        // Orthogonal / 45° path: horizontal run, diagonal, horizontal
        const midX = (a.x + b.x) / 2 - 120;
        const linePath = `M ${a.x} ${a.y} L ${midX} ${a.y} L ${midX + (b.y - a.y)} ${b.y} L ${b.x} ${b.y}`;

        svg.innerHTML = `
          <defs>
            <pattern id="minorGrid" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M80 0H0V80" fill="none" stroke="rgba(255,255,255,0.025)" stroke-width="1"/>
            </pattern>
          </defs>

          <!-- flat background -->
          <rect x="0" y="0" width="${W}" height="${H}" fill="#1f1f1e"/>
          <rect x="0" y="0" width="${W}" height="${H}" fill="url(#minorGrid)"/>

          <!-- subway-style connecting line (halo + core) -->
          <path d="${linePath}"
                stroke="rgba(217,119,87,0.12)" stroke-width="16"
                fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="${linePath}"
                stroke="#d97757" stroke-width="5"
                fill="none" stroke-linecap="round" stroke-linejoin="round"/>

          <!-- station dots at each endpoint -->
          <circle cx="${a.x}" cy="${a.y}" r="10" fill="#1f1f1e" stroke="#d97757" stroke-width="4"/>
          <circle cx="${b.x}" cy="${b.y}" r="10" fill="#1f1f1e" stroke="#d97757" stroke-width="4"/>
        `;
        canvas.appendChild(svg);
    }

    /* ---------- station cards ---------- */

    function buildPins() {
        // Station "cards": name plaque sitting next to the station dot.
        // Positioned within the transformed canvas so they pan/zoom with the map.
        PLACES.forEach((p, i) => {
            const el = document.createElement("div");
            el.className = "map-pin";
            // offset card so it doesn't cover the dot — alternate sides
            const side = i % 2 === 0 ? "right" : "left";
            el.dataset.side = side;
            el.style.left = p.x + "px";
            el.style.top  = p.y + "px";
            el.innerHTML = `
                <div class="station-card">
                    <div class="sc-name">${p.name}</div>
                    <div class="sc-sub">${p.sub}</div>
                    <div class="sc-meta">
                        <span>${p.years}</span>
                        <span class="sep"></span>
                        <span>${p.photos.length} photos →</span>
                    </div>
                </div>
            `;
            el.addEventListener("click", (e) => {
                e.stopPropagation();
                openAlbum(p.id);
            });
            canvas.appendChild(el);
            places[p.id] = { ...p, el };
        });
    }

    /* ---------- places menu (bottom-left overlay) ---------- */

    function buildPlacesMenu() {
        const menu = document.querySelector(".map-places .places-list");
        if (!menu) return;
        menu.innerHTML = PLACES.map(p => `
            <button data-id="${p.id}">
                <span class="dot"></span>
                <span>${p.name}</span>
                <span class="count">${p.photos.length}</span>
            </button>
        `).join("");
        menu.querySelectorAll("button").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.dataset.id;
                const p = places[id];
                const rect = stage.getBoundingClientRect();
                scale = Math.max(scale, 1.0);
                focusOn(p.x, p.y, rect, true);
                // open the album a short beat after the camera settles
                setTimeout(() => openAlbum(id), 420);
            });
        });
    }

    /* ---------- drag / pan ---------- */

    function bindDrag() {
        let startX = 0, startY = 0, startTx = 0, startTy = 0, dragging = false, pointerId = null;

        stage.addEventListener("pointerdown", (e) => {
            if (e.target.closest(".map-pin")) return;
            if (e.target.closest(".map-chrome") && !e.target.closest(".map-canvas")) return;
            dragging = true;
            pointerId = e.pointerId;
            stage.setPointerCapture(e.pointerId);
            stage.classList.add("is-dragging");
            startX = e.clientX; startY = e.clientY;
            startTx = tx; startTy = ty;
        });

        stage.addEventListener("pointermove", (e) => {
            if (!dragging) return;
            tx = startTx + (e.clientX - startX);
            ty = startTy + (e.clientY - startY);
            clampTransform();
            applyTransform();
        });

        function end(e) {
            if (!dragging) return;
            dragging = false;
            try { stage.releasePointerCapture(pointerId); } catch (_) {}
            stage.classList.remove("is-dragging");
        }
        stage.addEventListener("pointerup", end);
        stage.addEventListener("pointercancel", end);
        stage.addEventListener("pointerleave", end);
    }

    /* ---------- zoom (wheel + buttons) ---------- */

    function bindZoom() {
        stage.addEventListener("wheel", (e) => {
            e.preventDefault();
            const rect = stage.getBoundingClientRect();
            const cx = e.clientX - rect.left;
            const cy = e.clientY - rect.top;
            const factor = e.deltaY < 0 ? 1.08 : 1 / 1.08;
            zoomAt(cx, cy, factor);
        }, { passive: false });
    }

    function zoomAt(cx, cy, factor) {
        const newScale = clamp(scale * factor, MIN_SCALE, MAX_SCALE);
        const realFactor = newScale / scale;
        tx = cx - (cx - tx) * realFactor;
        ty = cy - (cy - ty) * realFactor;
        scale = newScale;
        clampTransform();
        applyTransform();
    }

    function bindControls() {
        const zoomIn = document.querySelector("[data-action=zoom-in]");
        const zoomOut = document.querySelector("[data-action=zoom-out]");
        const recenter = document.querySelector("[data-action=recenter]");
        zoomIn && zoomIn.addEventListener("click", () => {
            const rect = stage.getBoundingClientRect();
            zoomAt(rect.width / 2, rect.height / 2, 1.2);
        });
        zoomOut && zoomOut.addEventListener("click", () => {
            const rect = stage.getBoundingClientRect();
            zoomAt(rect.width / 2, rect.height / 2, 1 / 1.2);
        });
        recenter && recenter.addEventListener("click", () => {
            const rect = stage.getBoundingClientRect();
            scale = 0.75;
            focusOn((PLACES[0].x + PLACES[1].x) / 2, (PLACES[0].y + PLACES[1].y) / 2, rect, true);
        });
    }

    /* ---------- transforms ---------- */

    function focusOn(wx, wy, rect, animate) {
        const targetTx = rect.width / 2 - wx * scale;
        const targetTy = rect.height / 2 - wy * scale;
        if (!animate) {
            tx = targetTx; ty = targetTy;
            clampTransform();
            applyTransform();
            return;
        }
        const fromTx = tx, fromTy = ty;
        const fromScale = scale;
        const toScale = scale;
        const dur = 480;
        const t0 = performance.now();
        function tick(now) {
            const t = Math.min(1, (now - t0) / dur);
            const e = t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2, 2)/2; // easeInOutQuad
            tx = fromTx + (targetTx - fromTx) * e;
            ty = fromTy + (targetTy - fromTy) * e;
            scale = fromScale + (toScale - fromScale) * e;
            clampTransform();
            applyTransform();
            if (t < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    function clampTransform() {
        const rect = stage.getBoundingClientRect();
        const sw = W * scale;
        const sh = H * scale;
        // If world is smaller than viewport on an axis, center it.
        if (sw < rect.width) {
            tx = (rect.width - sw) / 2;
        } else {
            const minX = rect.width - sw;
            const maxX = 0;
            tx = clamp(tx, minX, maxX);
        }
        if (sh < rect.height) {
            ty = (rect.height - sh) / 2;
        } else {
            const minY = rect.height - sh;
            const maxY = 0;
            ty = clamp(ty, minY, maxY);
        }
    }

    function applyTransform() {
        canvas.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    }

    /* ---------- album modal ---------- */

    let currentAlbum = null;
    let currentViewerIx = 0;

    function bindAlbum() {
        const scrim = document.querySelector(".album-scrim");
        const closeBtn = scrim.querySelector(".album-close");
        const viewer = scrim.querySelector(".album-viewer");

        function close() { scrim.classList.remove("is-open"); viewer.classList.remove("is-open"); }
        closeBtn.addEventListener("click", close);
        scrim.addEventListener("click", (e) => { if (e.target === scrim) close(); });
        document.addEventListener("keydown", (e) => {
            if (!scrim.classList.contains("is-open")) return;
            if (e.key === "Escape") close();
            if (viewer.classList.contains("is-open")) {
                if (e.key === "ArrowLeft") stepViewer(-1);
                if (e.key === "ArrowRight") stepViewer(1);
            }
        });

        viewer.querySelector(".vclose").addEventListener("click", () => viewer.classList.remove("is-open"));
        viewer.querySelector(".vprev").addEventListener("click", () => stepViewer(-1));
        viewer.querySelector(".vnext").addEventListener("click", () => stepViewer(1));
    }

    function openAlbum(id) {
        const p = places[id];
        if (!p) return;
        currentAlbum = p;
        const scrim = document.querySelector(".album-scrim");
        scrim.querySelector(".album-title").innerHTML = `<em>${p.name}</em>`;
        scrim.querySelector(".album-meta").innerHTML = `
            <span>${p.sub}</span>
            <span class="dot">•</span>
            <span>${p.coords}</span>
            <span class="dot">•</span>
            <span>${p.years}</span>
            <span class="dot">•</span>
            <span>${p.photos.length} photos</span>
        `;

        const grid = scrim.querySelector(".album-grid");
        grid.innerHTML = p.photos.map((photo, i) => {
            const ix = String(i + 1).padStart(2, "0");
            if (photo.src) {
                return `<div class="album-tile" data-ix="${i}">
                    <span class="ix">${ix}</span>
                    <img src="${photo.src}" alt="${photo.caption || ""}">
                </div>`;
            }
            return `<div class="album-tile placeholder" data-ix="${i}">
                <span class="ix">${ix}</span>
                ${photo.caption || "photo coming soon"}
            </div>`;
        }).join("");

        grid.querySelectorAll(".album-tile").forEach(tile => {
            tile.addEventListener("click", () => {
                const ix = parseInt(tile.dataset.ix, 10);
                openViewer(ix);
            });
        });

        scrim.classList.add("is-open");
    }

    function openViewer(ix) {
        if (!currentAlbum) return;
        const photo = currentAlbum.photos[ix];
        if (!photo || !photo.src) return; // nothing to view for placeholders
        currentViewerIx = ix;
        const viewer = document.querySelector(".album-viewer");
        viewer.querySelector("img").src = photo.src;
        viewer.classList.add("is-open");
    }

    function stepViewer(delta) {
        if (!currentAlbum) return;
        const n = currentAlbum.photos.length;
        let i = currentViewerIx;
        for (let step = 0; step < n; step++) {
            i = (i + delta + n) % n;
            if (currentAlbum.photos[i].src) { openViewer(i); return; }
        }
    }

    /* ---------- helpers ---------- */

    function clamp(n, a, b) { return Math.min(b, Math.max(a, n)); }

    document.addEventListener("DOMContentLoaded", init);
})();
