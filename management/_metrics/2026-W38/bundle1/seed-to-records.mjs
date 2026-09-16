// 束1: x_targets 初期投入の取り込み用コンバータ（読み取りのみ・Airtable へは書かない）
// 入力: x_targets_seed_20260917.json / 出力: (a) CSV（HUMAN 目視用）(b) Airtable create_records 用 JSON（10 件ずつのバッチ）
// 使い方: node seed-to-records.mjs  → 同ディレクトリに x_targets_seed_20260917.csv と x_targets_seed_20260917.batches.json を書く
// 【厳守】status は全件「候補」で固定（§13 の一層防御と同じ考え方＝書く箇所を 1 箇所に限定）。followers は空。source は「Grok調査」。
import { readFileSync, writeFileSync } from "node:fs";
const here = new URL(".", import.meta.url);
const seed = JSON.parse(readFileSync(new URL("./x_targets_seed_20260917.json", here), "utf8"));
const STATUS = "候補";
const SOURCE = seed.meta.source_value;
const HANDLE_RE = /^@[A-Za-z0-9_]{1,15}$/;
const FORBIDDEN = /https?:|vodnavi|af_id|moterist-\d{3}/i; // 束2 ガードと同じ語を seed にも適用（URL・af_id を持ち込まない）

const records = seed.records.map((r) => {
  if (!HANDLE_RE.test(r.handle)) throw new Error(`handle 形式が不正: ${r.handle}`);
  if (FORBIDDEN.test(JSON.stringify(r))) throw new Error(`禁止語を含む: ${r.handle}`);
  const fields = {
    handle: r.handle,
    display_name: r.display_name,
    type: r.type,
    status: STATUS,
    source: SOURCE,
    note: r.note,
  };
  fields.reply_restriction = "不明"; // 実査前は全件「不明」（CSO 追記 2026-09-17）
  if (r.no_repropose) fields.no_repropose = true; // 非稼働・再提案しない（status は候補のまま）
  if (r.priority != null) fields.priority = r.priority;
  if (r.genres?.length) fields.genres = r.genres;
  return { fields };
});
const dup = records.map((x) => x.fields.handle.toLowerCase()).filter((h, i, a) => a.indexOf(h) !== i);
if (dup.length) throw new Error(`handle 重複: ${dup.join(",")}`);

// (a) CSV
const cols = ["handle", "display_name", "type", "priority", "status", "source", "reply_restriction", "no_repropose", "genres", "note"];
const esc = (v) => (v == null ? "" : `"${String(Array.isArray(v) ? v.join("|") : v).replace(/"/g, '""')}"`);
const csv = [cols.join(","), ...records.map((x) => cols.map((c) => esc(x.fields[c])).join(","))].join("\n") + "\n";
writeFileSync(new URL("./x_targets_seed_20260917.csv", here), csv);

// (b) 10 件ずつのバッチ（Airtable の create は 1 回 10 件まで）
const batches = [];
for (let i = 0; i < records.length; i += 10) batches.push(records.slice(i, i + 10));
writeFileSync(new URL("./x_targets_seed_20260917.batches.json", here), JSON.stringify({ table: "x_targets", status_fixed: STATUS, count: records.length, batches }, null, 2));

const by = (k) => records.reduce((m, x) => { const v = x.fields[k] ?? "（空）"; m[v] = (m[v] || 0) + 1; return m; }, {});
const active = records.filter((x) => !x.fields.no_repropose);
const byA = (k) => active.reduce((m, x) => { const v = x.fields[k] ?? "（空）"; m[v] = (m[v] || 0) + 1; return m; }, {});
console.log(JSON.stringify({ count: records.length, active: active.length, activeByType: byA("type"), activeByPriority: byA("priority"), excluded: seed.meta.excluded.length, byType: by("type"), byPriority: by("priority"), genresUsed: [...new Set(records.flatMap((x) => x.fields.genres ?? []))].sort(), batches: batches.length }, null, 2));
