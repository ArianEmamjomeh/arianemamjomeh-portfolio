#!/usr/bin/env node
/*
 * fetch-steam.js
 * Pulls owned games + achievements from Steam using the key in .env,
 * merges with assets/game-ratings.json (your personal ratings/favorites),
 * and writes assets/games.json (consumed by games.html).
 *
 * Run:  node scripts/fetch-steam.js
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

// --- tiny .env parser (no dependency) ---
const envPath = path.join(__dirname, "..", ".env");
const env = {};
if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, "utf8").split(/\r?\n/).forEach(line => {
        const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (m && !line.trim().startsWith("#")) env[m[1]] = (m[2] || "").replace(/^['"]|['"]$/g, "");
    });
}
const KEY = env.STEAM_API_KEY;
const SID = env.STEAM_ID;
if (!KEY || !SID) {
    console.error("Missing STEAM_API_KEY or STEAM_ID in .env");
    process.exit(1);
}

function get(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = "";
            res.on("data", c => data += c);
            res.on("end", () => {
                try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
            });
        }).on("error", reject);
    });
}

async function main() {
    const ownedUrl = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${KEY}&steamid=${SID}&include_appinfo=1&include_played_free_games=1`;
    console.log("fetching owned games...");
    const owned = await get(ownedUrl);
    const games = (owned.response && owned.response.games) || [];
    console.log(`  ${games.length} games`);

    const ratingsPath = path.join(__dirname, "..", "assets", "game-ratings.json");
    const ratings = fs.existsSync(ratingsPath) ? JSON.parse(fs.readFileSync(ratingsPath, "utf8")) : {};

    // Only include games that appear in game-ratings.json (ignore keys starting with "_")
    const whitelist = new Set(Object.keys(ratings).filter(k => !k.startsWith("_")));
    const filteredGames = games.filter(g => whitelist.has(String(g.appid)));
    console.log(`  ${filteredGames.length} whitelisted (of ${games.length} owned)`);

    const enriched = [];
    let i = 0;
    for (const g of filteredGames) {
        i++;
        const meta = ratings[g.appid] || {};

        let earned = null, total = null, earnedList = [], rarestPct = null;
        try {
            const achUrl = `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?key=${KEY}&steamid=${SID}&appid=${g.appid}&l=english`;
            const ach = await get(achUrl);
            if (ach.playerstats && ach.playerstats.success === false) {
                console.log(`  ! ${g.name} — ${ach.playerstats.error || "no achievement data"}`);
            }
            const list = (ach.playerstats && ach.playerstats.achievements) || [];
            total = list.length;
            const earnedRaw = list.filter(a => a.achieved === 1);
            earned = earnedRaw.length;

            // Always try to fetch global percentages if the game has achievements,
            // so we can report "% of players who completed this game" regardless of
            // whether the user has earned any themselves.
            let rarityByName = {};
            if (total > 0) {
                try {
                    const rarityUrl = `https://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/?gameid=${g.appid}&format=json`;
                    const rarityRes = await get(rarityUrl);
                    const rarityList = (rarityRes.achievementpercentages && rarityRes.achievementpercentages.achievements) || [];
                    if (!rarityList.length) {
                        console.log(`  ! ${g.name} — empty rarity response (keys: ${Object.keys(rarityRes || {}).join(",") || "none"})`);
                    }
                    rarityByName = Object.fromEntries(rarityList.map(r => [r.name, r.percent]));
                    const allPcts = rarityList.map(r => r.percent).filter(n => typeof n === "number");
                    if (allPcts.length) rarestPct = Math.min(...allPcts);
                } catch (e) {
                    console.log(`  ! ${g.name} — rarity fetch error: ${e.message}`);
                }
            }

            // Fetch schema (names/icons) for earned achievements
            if (earned > 0) {
                let byName = {};
                try {
                    const schemaUrl = `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=${KEY}&appid=${g.appid}`;
                    const schema = await get(schemaUrl);
                    const schemaList = (schema.game && schema.game.availableGameStats && schema.game.availableGameStats.achievements) || [];
                    byName = Object.fromEntries(schemaList.map(a => [a.name, a]));
                } catch (e) { /* schema unavailable */ }

                earnedList = earnedRaw.map(a => {
                    const s = byName[a.apiname] || {};
                    const pct = rarityByName[a.apiname];
                    return {
                        // Player-data values take priority (they include hidden-achievement
                        // descriptions for ones the user has unlocked); schema fills gaps.
                        name: a.name || s.displayName || a.apiname,
                        description: a.description || s.description || null,
                        icon: s.icon || null,
                        unlocked_at: a.unlocktime || null,
                        global_percent: typeof pct === "number" ? Math.round(pct * 10) / 10 : null
                    };
                }).sort((a, b) => (b.unlocked_at || 0) - (a.unlocked_at || 0));
                await new Promise(r => setTimeout(r, 60));
            }
        } catch (e) { /* some games have no achievements or profile is private */ }

        const completed = total > 0 && earned === total;
        enriched.push({
            appid: g.appid,
            title: meta.title_override || g.name,
            cover: `https://cdn.akamai.steamstatic.com/steam/apps/${g.appid}/library_600x900.jpg`,
            cover_fallback: `https://cdn.akamai.steamstatic.com/steam/apps/${g.appid}/header.jpg`,
            playtime_hours: Math.round((g.playtime_forever || 0) / 60),
            achievements_earned: earned,
            achievements_total: total,
            completed,
            global_completion_percent: typeof rarestPct === "number" ? Math.round(rarestPct * 10) / 10 : null,
            earned_achievements: earnedList,
            rating: meta.rating || 0,
            favorite_achievement: meta.favorite_achievement || null,
            note: meta.note || null
        });
        if (i % 5 === 0) console.log(`  ${i}/${filteredGames.length}`);
        await new Promise(r => setTimeout(r, 60)); // polite pacing
    }

    // Rated games first (by rating desc), then by playtime desc
    enriched.sort((a, b) => (b.rating || 0) - (a.rating || 0) || b.playtime_hours - a.playtime_hours);

    const outPath = path.join(__dirname, "..", "assets", "games.json");
    fs.writeFileSync(outPath, JSON.stringify(enriched, null, 2));
    console.log(`wrote ${enriched.length} games -> assets/games.json`);
}

main().catch(e => { console.error(e); process.exit(1); });
