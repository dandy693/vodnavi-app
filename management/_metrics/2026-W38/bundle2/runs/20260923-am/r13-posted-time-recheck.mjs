// CSO裁定 2026-09-23 朝 ④ の検証: 改訂後ガードを本日朝の 11 案へ再適用する（記録・投稿はしない）。
// 実行: node management/_metrics/2026-W38/bundle2/runs/20260923-am/r13-posted-time-recheck.mjs
import { readFileSync } from "node:fs";
import { guardReply, loadConfig } from "../../../../../tools/x-reply-drafts/guards.mjs";
const here = (f) => new URL(f, import.meta.url);
const d = JSON.parse(readFileSync(here("drafts.json"), "utf8"));
const parsed = JSON.parse(readFileSync(here("parsed.json"), "utf8")).lines;
const know = JSON.parse(readFileSync(here("knowledge.json"), "utf8"));
const posted = JSON.parse(readFileSync(here("posted.json"), "utf8"));
const byLine = Object.fromEntries(parsed.map((l) => [l.lineNo, l]));
const config = loadConfig();

console.log("=== 生成された 11 案への再適用（旧ガードでは 11/11 PASS）===");
let n = 0, ng = 0;
for (const it of d.items) {
  const line = byLine[it.lineNo];
  const k = know[String(it.lineNo)] ?? null;
  for (const [type, dr] of Object.entries(it.drafts ?? {})) {
    if (!dr?.text) continue;
    n++;
    const g = guardReply(dr.text, {
      type, body: line?.body, knowledge: k, names: k?.actress ?? [],
      sources: [line?.body, k ? JSON.stringify(k) : ""],
      targetType: it.target?.type ?? null, displayName: it.target?.display_name ?? null,
      postedAtJst: it.postedAtJst ?? null, config,
    });
    if (g.failures.length) ng++;
    console.log(`${g.failures.length ? "NG  " : "PASS"} [${it.handle} ${type}] ${dr.text.slice(0, 30)}…`);
    for (const f of g.failures) console.log(`      ${f.rule}: ${f.detail}`);
  }
}
console.log(`\n合計 ${n} 案 / 改訂後 NG ${ng} 案`);

console.log("\n=== 投稿した本文（手直し後）への再適用 ===");
for (const it of d.items) {
  const text = posted[it.handle];
  if (!text) continue;
  const line = byLine[it.lineNo];
  const k = know[String(it.lineNo)] ?? null;
  const g = guardReply(text, {
    type: "A", body: line?.body, knowledge: k, names: k?.actress ?? [],
    sources: [line?.body, k ? JSON.stringify(k) : ""],
    targetType: it.target?.type ?? null, displayName: it.target?.display_name ?? null,
    postedAtJst: it.postedAtJst ?? null, config,
  });
  console.log(`${g.failures.length ? "NG  " : "PASS"} [${it.handle}] ${text.slice(0, 40)}…`);
  for (const f of g.failures) console.log(`      ${f.rule}: ${f.detail}`);
}
