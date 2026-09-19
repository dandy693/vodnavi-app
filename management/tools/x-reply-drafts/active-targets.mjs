// 束2 リプ案生成ツール — 抽出対象リストの組み立て（純関数 + CLI）
// CSO 連絡 2026-09-19 22:2x: 抽出対象は固定リストではなく Airtable の x_targets から
//   status = 稼働 ∧ no_repropose ≠ true ∧ reply_restriction ≠ あり
// を毎回読んで組み立てる（HUMAN が稼働を増減しても追従する）。priority 3 は抽出に含めるが、案の提示は週 2 件まで（対照用）。
//
// CLI:
//   node active-targets.mjs targets.json            → 対象を priority 昇順・handle 順に 1 行 1 件（handle<TAB>type<TAB>priority）
//   node active-targets.mjs targets.json --urls     → https://x.com/<handle> の一覧（Chrome 抽出に貼る）
//   node active-targets.mjs targets.json --json     → JSON
// targets.json は Airtable MCP list_records_for_table の生出力（records[].cellValuesByFieldId）でも fields 形でもよい（generate.mjs と同じ normalizeTargets）。

import fs from "node:fs";
import { isMain } from "./parse.mjs";
import { normalizeTargets } from "./generate.mjs";

/** 抽出対象（稼働 ∧ no_repropose≠true ∧ reply_restriction≠あり）。priority 昇順（空は末尾）→ handle 昇順。 */
export function activeTargets(raw) {
  const all = normalizeTargets(raw);
  const act = all.filter((t) => t.status === "稼働" && !t.no_repropose && t.reply_restriction !== "あり");
  act.sort((a, b) => {
    const pa = a.priority ?? 99;
    const pb = b.priority ?? 99;
    if (pa !== pb) return pa - pb;
    return a.handle.toLowerCase() < b.handle.toLowerCase() ? -1 : a.handle.toLowerCase() > b.handle.toLowerCase() ? 1 : 0;
  });
  return act.map((t) => ({ handle: t.handle, type: t.type, priority: t.priority ?? null, contrast: t.priority === 3, last_reply_at: t.last_reply_at }));
}

/** 内訳（報告用）: 件数・priority 別・type 別・対照（priority 3）。 */
export function summarize(list) {
  const by = (key) => {
    const m = {};
    for (const t of list) {
      const k = String(t[key] ?? "空");
      m[k] = (m[k] ?? 0) + 1;
    }
    return m;
  };
  return { count: list.length, by_priority: by("priority"), by_type: by("type"), contrast: list.filter((t) => t.contrast).map((t) => t.handle) };
}

if (isMain(import.meta.url)) {
  const [file, ...flags] = process.argv.slice(2);
  if (!file) {
    process.stderr.write("usage: node active-targets.mjs targets.json [--urls|--json]\n");
    process.exit(2);
  }
  const list = activeTargets(JSON.parse(fs.readFileSync(file, "utf8")));
  if (flags.includes("--json")) process.stdout.write(JSON.stringify({ summary: summarize(list), targets: list }, null, 2) + "\n");
  else if (flags.includes("--urls")) process.stdout.write(list.map((t) => `https://x.com/${t.handle}`).join("\n") + "\n");
  else {
    for (const t of list) process.stdout.write(`${t.handle}\t${t.type ?? "-"}\t${t.priority ?? "-"}${t.contrast ? "\t対照（提示は週 2 件まで）" : ""}\n`);
    const s = summarize(list);
    process.stderr.write(`[active-targets] ${s.count} 件 / priority ${JSON.stringify(s.by_priority)} / type ${JSON.stringify(s.by_type)}\n`);
  }
}
