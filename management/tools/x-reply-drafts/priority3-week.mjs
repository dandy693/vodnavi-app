#!/usr/bin/env node
// priority 3（対照用）の「週 2 件まで」を x_replies から機械的に数える。
//
// 【なぜ機械化したか】2026-09-23 夜、CTO が週起点を 9/22（火）と誤認し「今週 0 / 2」と報告した。
// 実際の週起点は 9/21（月）で、同日の 2 件（S1_No1_Style 08:03 / shinnakanodream 22:28）により
// **既に 2 / 2 に到達していた**（CSO 指摘・2026-09-23）。手で数えるかぎり同じ誤りが再発する。
//
// 規則（CSO判定 2026-09-19 22:5x / 2026-09-21 朝 / 2026-09-22 朝）:
//   - priority 3 の案の提示は **週 2 件まで**。
//   - 週は **月曜〜日曜**（JST）。
//   - **引用ポスト（draft_used = Q）はこのカウントの対象外**（CSO裁定 2026-09-22 朝 ②）。
//
// 使い方:
//   node management/tools/x-reply-drafts/priority3-week.mjs --replies <replies.json> --targets <targets.json> [--today YYYY-MM-DD] [--json <out.json>]
//     --replies … x_replies（MCP 生出力でも fields 形でもよい）。reply_key / posted_at / draft_used を読む
//     --targets … x_targets（同上）。handle → priority の対応に使う
//     --today   … 基準日（JST 暦日・既定＝実行時の JST）
// 終了コード: 0＝残枠あり / 1＝上限到達 / 2＝引数不正
import { readFileSync, writeFileSync } from "node:fs";
import { normalizeTargets } from "./generate.mjs";

const F = { replyKey: "fld63cUuOti14Vlnj", postedAt: "fldACpFxznVDTtmWu", draftUsed: "fldeXo1Hzlb5xytfv" };
const LIMIT = 2;

function arg(name, fallback = null) {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
/** JST 暦日（YYYY-MM-DD）。 */
function jstDay(iso) {
  return new Date(Date.parse(iso) + 9 * 3600e3).toISOString().slice(0, 10);
}
/** その日を含む週（月曜起点）の月曜と日曜を返す。JST 暦日で計算する。 */
export function weekRangeMonday(day) {
  const d = new Date(day + "T00:00:00Z");
  const dow = d.getUTCDay();            // 0=日 … 6=土
  const back = dow === 0 ? 6 : dow - 1; // 月曜までの戻り日数（日曜は 6 日戻る）
  const mon = new Date(d.getTime() - back * 86400000);
  const sun = new Date(mon.getTime() + 6 * 86400000);
  return { from: mon.toISOString().slice(0, 10), to: sun.toISOString().slice(0, 10) };
}
/** `20260921-S1_No1_Style` / `20260922-Q-honnaka_NN` → { ymd, isQuote, handle } */
export function parseReplyKey(key) {
  const s = String(key ?? "");
  const i = s.indexOf("-");
  if (i < 0) return null;
  const ymd = s.slice(0, i);
  let rest = s.slice(i + 1);
  let isQuote = false;
  if (rest.startsWith("Q-")) { isQuote = true; rest = rest.slice(2); }
  return { ymd, isQuote, handle: rest };
}
/** x_replies の生出力 / fields 形のどちらからも { replyKey, postedAt, draftUsed } を取り出す。 */
export function normalizeReplies(raw) {
  const recs = raw?.records ?? (Array.isArray(raw) ? raw : []);
  return recs.map((r) => {
    const c = r.cellValuesByFieldId ?? null;
    const f = r.fields ?? null;
    return {
      replyKey: c ? c[F.replyKey] : f?.reply_key ?? null,
      postedAt: c ? c[F.postedAt] : f?.posted_at ?? null,
      draftUsed: c ? (c[F.draftUsed]?.name ?? null) : (f?.draft_used ?? null),
    };
  });
}
/** 週内で priority 3 に消費した件数と該当行。 */
export function countPriority3(replies, targets, today) {
  const week = weekRangeMonday(today);
  const prio = {};
  for (const t of normalizeTargets(targets)) prio[String(t.handle).replace(/^@/, "").toLowerCase()] = t.priority ?? null;
  const rows = [];
  for (const r of normalizeReplies(replies)) {
    const k = parseReplyKey(r.replyKey);
    if (!k || !r.postedAt) continue;
    const day = jstDay(r.postedAt);
    if (day < week.from || day > week.to) continue;
    const p = prio[k.handle.toLowerCase()] ?? null;
    if (p !== 3) continue;
    // 引用（Q）はカウント対象外（CSO裁定 2026-09-22 朝 ②）
    const isQuote = k.isQuote || r.draftUsed === "Q";
    rows.push({ replyKey: r.replyKey, handle: k.handle, postedAtJst: new Date(Date.parse(r.postedAt) + 9 * 3600e3).toISOString().replace("T", " ").slice(0, 19), day, draftUsed: r.draftUsed, counted: !isQuote });
  }
  rows.sort((a, b) => a.postedAtJst.localeCompare(b.postedAtJst));
  const used = rows.filter((r) => r.counted).length;
  return { week, limit: LIMIT, used, remaining: Math.max(0, LIMIT - used), rows };
}

const repliesPath = arg("--replies");
const targetsPath = arg("--targets");
if (!repliesPath || !targetsPath) {
  console.error("usage: priority3-week.mjs --replies <replies.json> --targets <targets.json> [--today YYYY-MM-DD] [--json <out.json>]");
  process.exit(2);
}
const today = arg("--today", new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10));
const out = countPriority3(
  JSON.parse(readFileSync(repliesPath, "utf8")),
  JSON.parse(readFileSync(targetsPath, "utf8")),
  today,
);

console.log(`=== priority 3（対照用）の週カウント ===`);
console.log(`基準日 ${today}（JST） / 週 ${out.week.from}（月）〜 ${out.week.to}（日）`);
console.log(`消費 ${out.used} / ${out.limit}  → 残り ${out.remaining}`);
if (out.rows.length === 0) console.log(`（週内に priority 3 への記録なし）`);
for (const r of out.rows) {
  console.log(`  ${r.counted ? "計上" : "対象外"}  ${r.postedAtJst} JST  ${r.replyKey}  draft_used=${r.draftUsed ?? "-"}` + (r.counted ? "" : "（引用 Q はカウント対象外）"));
}
const jsonOut = arg("--json");
if (jsonOut) { writeFileSync(jsonOut, JSON.stringify({ tag: "PRIORITY3_WEEK", ts: new Date().toISOString(), today, ...out }, null, 2) + "\n", "utf8"); console.log(`\nJSON: ${jsonOut}`); }
process.exit(out.remaining > 0 ? 0 : 1);
