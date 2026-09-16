// x_targets の followers 暫定記入（CSO 指示 2026-09-17）— 読み戻し済みの現 note を基準に更新ペイロードを生成する
// 入力: x_targets_grok_followers_20260917.tsv / x_targets_readback_notes_20260917.json（list_records の転記）
// 出力: x_targets_followers_update_20260917.byid.json（update_records_for_table 用・フィールド ID キー）
import fs from "node:fs";
const D = new URL("./", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
const F = { handle: "fldaWVD2Hs0AeWURb", followers: "fldECZiqBvFOJnY49", note: "fldjxdAebj2DK8lwu" };
const TODAY = "2026-09-17";
const CUTOFF = "2026-09-10"; // 最終投稿がこれより前＝7 日超（9/17 − 9/10 = 7 日は「超」ではない）
const rows = fs.readFileSync(D + "x_targets_grok_followers_20260917.tsv", "utf8").trim().split("\n").slice(1)
  .map(l => { const [handle, followers, last_post, grok_date, kind] = l.split("\t"); return { handle, followers: Number(followers), last_post, grok_date, kind }; });
const cur = JSON.parse(fs.readFileSync(D + "x_targets_readback_notes_20260917.json", "utf8")); // [{id, handle, note}]
const byHandle = new Map(cur.map(r => [r.handle, r]));
const FORBIDDEN = /https?:|vodnavi|af_id|moterist-\d{3}/i;
const out = []; const flagged = [];
for (const r of rows) {
  const c = byHandle.get(r.handle); if (!c) throw new Error("not in table: " + r.handle);
  if (!Number.isInteger(r.followers) || r.followers <= 0) throw new Error("bad followers: " + r.handle);
  const head = r.kind === "today"
    ? `followers=Grok ${TODAY}`
    : `followers=Grok ${r.grok_date}（概数・seed note から ${TODAY} 転記）`;
  let lp;
  if (r.last_post === "不明") { lp = "最終投稿 不明（Grok）・要HUMAN確認"; flagged.push([r.handle, "不明"]); }
  else if (r.last_post === "未取得") { lp = "最終投稿 未取得（9/16 Grok 取得分に日付なし）・要HUMAN確認"; flagged.push([r.handle, "未取得"]); }
  else if (r.last_post < CUTOFF) { lp = `最終投稿 ${r.last_post}・要HUMAN確認`; flagged.push([r.handle, r.last_post]); }
  else { lp = `最終投稿 ${r.last_post}（${r.kind === "today" ? "Grok" : "CSO 追記 2026-09-17"}）`; }
  const note = `${head}｜${lp}｜${c.note}`;
  if (FORBIDDEN.test(note)) throw new Error("forbidden token in note: " + r.handle);
  out.push({ id: c.id, fields: { [F.followers]: r.followers, [F.note]: note } });
}
fs.writeFileSync(D + "x_targets_followers_update_20260917.byid.json", JSON.stringify({ tableId: "tblStC3L57aJh22sD", count: out.length, records: out }, null, 2));
console.log("records:", out.length, "flagged:", flagged.length); for (const f of flagged) console.log("  ", f.join("\t"));
