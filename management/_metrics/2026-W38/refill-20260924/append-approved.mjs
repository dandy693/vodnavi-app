// 承認後の dump（sync-actress-table の「予約済み」登録用）。W12 7 件を読み戻し値で追加し、
// 予約日時の JST 換算が想定枠と一致することを機械検算する（§13 の最重要ガード）。
import { readFileSync, writeFileSync } from "node:fs";
const base = JSON.parse(readFileSync("posts_dump_20260924.json", "utf8"));
const gen = JSON.parse(readFileSync("w12-t1-generated.json", "utf8")).posts;
const added = [
  ["rec1Ipk9CaVCvIqJK", "W12-01 T1改 石川澪 MIDV-229", "https://app.vodnavi.jp/works/videoa/midv00229", "2026-09-26T12:00:00.000Z"],
  ["recJMBq6PD0znkCu4", "W12-02 T1改 河北彩花（河北彩伽） SNOS-377", "https://app.vodnavi.jp/works/videoa/snos00377", "2026-09-27T12:00:00.000Z"],
  ["rec1qLnx6QPiVYU4f", "W12-03 T1改 希望みう SNOS-299", "https://app.vodnavi.jp/works/videoa/snos00299", "2026-09-28T12:00:00.000Z"],
  ["recL6QGC8yrcmcoUG", "W12-04 T1改 九野ひなの MIDV-855", "https://app.vodnavi.jp/works/videoa/midv00855", "2026-09-29T12:00:00.000Z"],
  ["recla1McN4uCpaVW0", "W12-05 T1改 二葉エマ ROYD-170", "https://app.vodnavi.jp/works/videoa/royd00170", "2026-09-30T12:00:00.000Z"],
  ["recdDbsffixEc3NL4", "W12-06 T1改 美谷朱音（美谷朱里） HNDB-221", "https://app.vodnavi.jp/works/videoa/hndb00221", "2026-10-01T12:00:00.000Z"],
  ["rec9goZ2IC3zigTyo", "W12-07 T1改 七沢みあ MIDV-174", "https://app.vodnavi.jp/works/videoa/midv00174", "2026-10-02T12:00:00.000Z"],
];
let ng = 0;
for (const [id, name, linkUrl, sched] of added) {
  const g = gen.find((p) => p.name === name);
  if (!g) { console.log(`🔴 生成 JSON に無い: ${name}`); ng++; continue; }
  if (!/Z$/.test(sched)) { console.log(`🔴 Z 終端でない: ${name} ${sched}`); ng++; }
  const jst = new Date(Date.parse(sched) + 9 * 3600e3).toISOString().slice(0, 16).replace("T", " ");
  const ok = jst === g.intendedJst && linkUrl === g.linkUrl && sched === g.scheduledUtc;
  console.log(`${ok ? "一致" : "🔴不一致"} ${name} | ${sched} = ${jst} JST | 想定枠 ${g.intendedJst}`);
  if (!ok) ng++;
  base.records.push({ id, createdTime: null, fields: { "管理ID": name, "タイプ": { name: "T1改" }, "ステータス": { name: "承認済" }, "リンクURL": linkUrl, "リンク種別": { name: "サイト" }, "予約日時": sched } });
}
if (ng) { console.log(`\n🔴 不一致 ${ng} 件。after dump は書かない。`); process.exit(1); }
base.fetched_at_jst = new Date(Date.now() + 9 * 3600e3).toISOString();
writeFileSync("posts_dump_20260924_after.json", JSON.stringify(base, null, 1));
console.log(`\nposts_dump_20260924_after.json total=${base.records.length}`);
