// 3本目候補の再抽出（2026-09-05 時点）。candidates.json は上書きしない。
import { readFileSync, writeFileSync } from "node:fs";
const env = readFileSync("C:/Users/Tachi/projects/VODNAVI-GROUP/app-concierge/.env.local", "utf8");
const g = (k) => (env.match(new RegExp("^" + k + "=(.*)$", "m")) ?? [])[1]?.trim().replace(/^["']|["']$/g, "");
const API = g("DMM_API_ID"), AFF = g("DMM_AFFILIATE_ID");
const yen = (s) => { const m = String(s ?? "").replace(/,/g, "").match(/\d+/); return m ? Number(m[0]) : null; };

// 投稿予定日の候補（Phase 1 窓は 9/11 まで。2本目は 9/5 投稿のため 9/6 以降）
const POST_DATES = ["2026-09-06", "2026-09-07", "2026-09-08"];
// 発売2〜7日後を満たしうる発売日レンジ = 最早の投稿日+2 〜 最遅の投稿日+7
const GTE = "2026-09-08T00:00:00", LTE = "2026-09-15T23:59:59";

const all = [];
for (const off of [1, 101, 201, 301]) {
  const u = `https://api.dmm.com/affiliate/v3/ItemList?api_id=${API}&affiliate_id=${AFF}&site=FANZA&service=digital&floor=videoa`
    + `&gte_date=${GTE}&lte_date=${LTE}&sort=date&hits=100&offset=${off}&output=json`;
  const r = await fetch(u);
  if (!r.ok) { console.log("HTTP", r.status, "— 取得中断"); break; }
  const items = (await r.json()).result?.items ?? [];
  all.push(...items);
  if (items.length < 100) break;
  await new Promise(x => setTimeout(x, 500));
}
console.log(`取得 ${all.length} 件（gte_date ${GTE.slice(0, 10)} / lte_date ${LTE.slice(0, 10)}）`);
if (!all.length) { console.log("0件。API 応答を確認すること。"); process.exit(1); }

const dayDiff = (relIso, postIso) =>
  Math.round((new Date(relIso.replace(" ", "T") + "+09:00") - new Date(postIso + "T00:00:00+09:00")) / 86400000);

const rows = all.map(it => ({
  cid: it.content_id, title: it.title ?? "", date: it.date,
  price: yen(it.prices?.price), listPrice: yen(it.prices?.list_price),
  pkgLarge: it.imageURL?.large ?? null,
  actress: (it.iteminfo?.actress ?? []).map(a => a.name).join(" / "),
  maker: (it.iteminfo?.maker ?? []).map(m => m.name).join(" / "),
  volume: it.volume ?? null, url: it.URL ?? null, hasReview: !!it.review,
})).map(r => {
  // 各投稿予定日について「あとN日」を計算し、2〜7 に収まるものを valid とする
  r.options = POST_DATES.map(p => ({ post: p, days: dayDiff(r.date, p) })).filter(o => o.days >= 2 && o.days <= 7);
  // タイトル帯のはみ出し概算（fontsize 44 / 全角44px・半角22px / 26字で切詰め + boxborderw 48）
  const t = r.title.length > 26 ? r.title.slice(0, 26) + "…" : r.title;
  let w = 0; for (const ch of t) w += /[\x00-\x7F]/.test(ch) ? 22 : 44;
  r.titleShown = t; r.titleWidthPx = w + 48; r.titleOverflow = (w + 48) > 1080;
  return r;
}).filter(r => r.options.length > 0);

const band = (p) => (p != null && p >= 2000 && p < 3000 ? 0 : 1);
rows.sort((a, b) => band(a.price) - band(b.price) || (b.volume ?? 0) - (a.volume ?? 0));

const dist = {}; for (const r of rows) { const k = r.date.slice(0, 10); dist[k] = (dist[k] ?? 0) + 1; }
console.log("発売日別:", Object.entries(dist).sort().map(([k, v]) => `${k}:${v}`).join(" "));
console.log(`\n条件を満たす候補: ${rows.length} 件 / うち2,000円台: ${rows.filter(r => band(r.price) === 0).length} 件\n`);

console.log("| # | content_id | 発売日 | 投稿予定日→あとN日 | 価格 | 収録 | 女優 | メーカー | タイトル帯 |");
console.log("|---|---|---|---|---|---|---|---|---|");
rows.slice(0, 8).forEach((r, i) => {
  const opt = r.options.map(o => `${o.post.slice(5)}→あと${o.days}日`).join(" / ");
  console.log(`| ${i + 1} | \`${r.cid}\` | ${r.date.slice(0, 10)} | ${opt} | ${r.price ?? "-"}円 | ${r.volume ?? "-"}分 | ${r.actress || "-"} | ${r.maker || "-"} | ${r.titleOverflow ? `★超過 ${r.titleWidthPx}px` : `OK ${r.titleWidthPx}px`} |`);
});
writeFileSync("candidates3.json", JSON.stringify(rows, null, 1));
console.log(`\ncandidates3.json に ${rows.length} 件（candidates.json は変更していない）`);
console.log("\n上位3件のタイトル全文:");
rows.slice(0, 3).forEach((r, i) => console.log(` ${i + 1}. [${r.cid}] ${r.title}`));
