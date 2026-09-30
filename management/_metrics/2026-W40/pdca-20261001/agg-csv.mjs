// 木曜PDCA 2026-10-01 項目7: X Analytics CSV（9/17〜9/30・HUMAN 提供）の週次集計
// 投稿ID(snowflake)→JST、自投稿とリプ（本文が @ で始まる）を分け、ラベル前（9/17〜9/26 JST）／後（9/27〜）で別集計。
// 書き出し時点から 24 時間未満の投稿は中央値から外し件数のみ示す。
import fs from "node:fs";
const [,, csvPath, exportedJst] = process.argv;
const t = fs.readFileSync(csvPath, "utf8");
const rows = []; let cur = [], f = "", q = false;
for (let i = 0; i < t.length; i++) { const c = t[i];
  if (q) { if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
  else if (c === '"') q = true; else if (c === ",") { cur.push(f); f = ""; }
  else if (c === "\n") { cur.push(f.replace(/\r$/, "")); rows.push(cur); cur = []; f = ""; } else f += c; }
const H = rows.shift(); const ix = (n) => H.indexOf(n);
const exported = new Date(exportedJst.replace(" ", "T") + "+09:00").getTime();
const posts = rows.filter((r) => r.length >= H.length).map((r) => {
  const id = r[ix("ポストID")]; const ms = Number((BigInt(id) >> 22n) + 1288834974657n);
  const jst = new Date(ms + 9 * 3600e3).toISOString().slice(0, 16).replace("T", " ");
  const n = (k) => Number(r[ix(k)] || 0);
  return { id, jst, day: jst.slice(0, 10), kind: r[ix("ポスト本文")].trimStart().startsWith("@") ? "リプ" : "自投稿",
    imp: n("インプレッション数"), likes: n("いいね"), replies: n("返信"), url: n("URLのクリック数"), prof: n("プロフィールへのアクセス数"), follows: n("新しいフォロー"),
    young: exported - ms < 24 * 3600e3 };
});
const med = (xs) => { if (!xs.length) return null; const s = [...xs].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const out = [];
for (const kind of ["自投稿", "リプ"]) for (const [lab, lo, hi] of [["ラベル前 9/17〜9/26", "2026-09-17", "2026-09-26"], ["ラベル後 9/27〜10/1", "2026-09-27", "2026-10-01"]]) {
  const all = posts.filter((p) => p.kind === kind && p.day >= lo && p.day <= hi);
  const ok = all.filter((p) => !p.young);
  const sum = (k) => all.reduce((a, p) => a + p[k], 0);
  out.push({ kind, period: lab, n: all.length, n_median: ok.length, young_excluded: all.length - ok.length,
    imp_median: med(ok.map((p) => p.imp)), imp_max: all.length ? Math.max(...all.map((p) => p.imp)) : null,
    url_clicks: sum("url"), profile_visits: sum("prof"), new_follows: sum("follows"), likes: sum("likes"), replies: sum("replies") });
}
fs.writeFileSync(csvPath.replace(/\.csv$/, ".posts.json"), JSON.stringify(posts, null, 1));
console.log(JSON.stringify({ exported: exportedJst, total: posts.length, range: [posts.map(p=>p.jst).sort()[0], posts.map(p=>p.jst).sort().at(-1)], out }, null, 1));
