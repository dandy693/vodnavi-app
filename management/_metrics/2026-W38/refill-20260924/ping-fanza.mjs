// FANZA API 疎通確認（§13-8-1 の恒久手順 ①）。値は出力しない。HTTP ステータスと件数のみ。
const u = new URL("https://api.dmm.com/affiliate/v3/ItemList");
u.searchParams.set("api_id", process.env.DMM_API_ID ?? "");
u.searchParams.set("affiliate_id", process.env.DMM_AFFILIATE_ID ?? "");
u.searchParams.set("site", "FANZA");
u.searchParams.set("service", "digital");
u.searchParams.set("floor", "videoa");
u.searchParams.set("sort", "rank");
u.searchParams.set("hits", "1");
u.searchParams.set("output", "json");
const t0 = Date.now();
const res = await fetch(u);
const ms = Date.now() - t0;
let count = null;
try { const j = await res.json(); count = j?.result?.result_count ?? null; } catch {}
console.log(`[ping] HTTP ${res.status} / result_count=${count} / ${ms}ms / ${new Date(Date.now() + 9 * 3600e3).toISOString().replace("T", " ").slice(0, 19)} JST`);
process.exit(res.status === 200 ? 0 : 1);
