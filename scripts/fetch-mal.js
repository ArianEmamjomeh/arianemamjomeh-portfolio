#!/usr/bin/env node
/*
 * fetch-mal.js
 * Pulls your anime + manga lists from the MyAnimeList API using MAL_CLIENT_ID
 * in .env and writes assets/anime.json (consumed by things.html, the "anime"
 * and "manga" filter tabs).
 *
 * Reading a *public* list only needs the Client ID (X-MAL-CLIENT-ID header) —
 * no OAuth/Client Secret required. Optional per-title overrides (notes, rating,
 * title) can live in assets/anime-ratings.json keyed by `anime-<id>` /
 * `manga-<id>`.
 *
 * Run:  node scripts/fetch-mal.js
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

// --- tiny .env parser (no dependency), same as fetch-steam.js ---
const envPath = path.join(__dirname, "..", ".env");
const env = {};
if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, "utf8").split(/\r?\n/).forEach(line => {
        const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (m && !line.trim().startsWith("#")) env[m[1]] = (m[2] || "").replace(/^['"]|['"]$/g, "");
    });
}
const CLIENT_ID = env.MAL_CLIENT_ID;
const USERNAME = env.MAL_USERNAME;
if (!CLIENT_ID || !USERNAME) {
    console.error("Missing MAL_CLIENT_ID or MAL_USERNAME in .env");
    process.exit(1);
}

// Display order for status groups (lower = shown first within a tab).
const STATUS_ORDER = {
    watching: 0, reading: 0,
    completed: 1,
    on_hold: 2,
    dropped: 3,
    plan_to_watch: 4, plan_to_read: 4
};

function get(url) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, { headers: { "X-MAL-CLIENT-ID": CLIENT_ID } }, (res) => {
            let data = "";
            res.on("data", c => data += c);
            res.on("end", () => {
                if (res.statusCode < 200 || res.statusCode >= 300) {
                    return reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 300)}`));
                }
                try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
            });
        });
        req.on("error", reject);
    });
}

// Pull every page of a user's anime or manga list.
async function fetchList(kind) {
    const fields = "list_status,num_episodes,num_chapters,mean,media_type";
    let url = `https://api.myanimelist.net/v2/users/${encodeURIComponent(USERNAME)}/${kind}list`
        + `?fields=${fields}&limit=1000&nsfw=false`;
    const raw = [];
    console.log(`fetching ${kind} list for ${USERNAME}...`);
    while (url) {
        const page = await get(url);
        (page.data || []).forEach(item => raw.push(item));
        url = page.paging && page.paging.next ? page.paging.next : null;
        if (url) await new Promise(r => setTimeout(r, 80)); // polite pacing
    }
    console.log(`  ${raw.length} ${kind} entries`);
    return raw;
}

function mapEntry(item, category, overrides) {
    const node = item.node || {};
    const ls = item.list_status || {};
    const id = `${category}-${node.id}`;
    const o = overrides[id] || {};
    // MAL personal score is 0–10; the site renders 0–5 stars (10/10 == 5 stars).
    const malStars = ls.score ? ls.score / 2 : 0;
    const rating = typeof o.rating === "number" ? o.rating : malStars;
    return {
        appid: `mal-${id}`,
        title: o.title_override || node.title,
        cover: (node.main_picture && node.main_picture.large) || (node.main_picture && node.main_picture.medium) || "",
        cover_fallback: (node.main_picture && node.main_picture.medium) || "",
        category,                       // "anime" | "manga"
        rating,                         // 0 means unrated -> no stars shown
        top: ls.score === 10,           // 10/10 favorites get a special indicator
        status: ls.status,              // watching/completed/dropped/plan_to_watch/...
        note: o.note || null,
        _sort: STATUS_ORDER[ls.status] != null ? STATUS_ORDER[ls.status] : 9
    };
}

async function main() {
    const ratingsPath = path.join(__dirname, "..", "assets", "anime-ratings.json");
    const overrides = fs.existsSync(ratingsPath) ? JSON.parse(fs.readFileSync(ratingsPath, "utf8")) : {};

    const [animeRaw, mangaRaw] = [await fetchList("anime"), await fetchList("manga")];

    const items = [
        ...animeRaw.map(i => mapEntry(i, "anime", overrides)),
        ...mangaRaw.map(i => mapEntry(i, "manga", overrides))
    ].sort((a, b) =>
        a._sort - b._sort
        || (b.rating || 0) - (a.rating || 0)
        || a.title.localeCompare(b.title));

    items.forEach(i => delete i._sort);

    const outPath = path.join(__dirname, "..", "assets", "anime.json");
    fs.writeFileSync(outPath, JSON.stringify(items, null, 2));
    const nAnime = items.filter(i => i.category === "anime").length;
    const nManga = items.filter(i => i.category === "manga").length;
    console.log(`wrote ${items.length} titles (${nAnime} anime, ${nManga} manga) -> assets/anime.json`);
}

main().catch(e => { console.error(e.message || e); process.exit(1); });
