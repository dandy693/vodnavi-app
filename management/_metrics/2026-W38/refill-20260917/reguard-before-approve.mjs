// 承認直前のガード再実行（generate-t1.mjs の注記どおり2回目）。
// 入力: 読み戻し JSON（MCP list_records_for_table の生結果）＋ 生成 JSON ＋ posts dump（同日件数の分母）
import { readFileSync } from "node:fs";
import { runGuardsAsync } from "../../../../app-concierge/scripts/x-post-generator.mjs";
const [readbackPath, genPath, dumpPath] = process.argv.slice(2);
const rb = JSON.parse(readFileSync(readbackPath, "utf8")).records;
const gen = JSON.parse(readFileSync(genPath, "utf8")).posts;
const dump = JSON.parse(readFileSync(dumpPath, "utf8")).records;
// ── 読み戻し照合 ──
let mismatch = 0;
const byName = Object.fromEntries(rb.map((r) => [r.cellValuesByFieldId.fldSFgqqf40w8D2hQ, r]));
for (const p of gen) {
  const r = byName[p.name];
  const f = r?.cellValuesByFieldId ?? {};
  const checks = {
    text: f.fldFMfnZXxnhSviDr === p.text,
    link: f.fldkk8CfCKXyqPNFO === p.linkUrl,
    type: f.fldWn1DLzKGacDC26?.name === "T1改",
    status: f.fldiGogHs9F7w5t2q?.name === "ストック",
    linkKind: f.fldohCPGnEjkTQRV6?.name === "サイト",
    schedEmpty: f.fldDrNzqVRb9LxxqD == null,
    postIdEmpty: f.fldLdjZEjuCqGt0UH == null,
  };
  const bad = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);
  if (!r || bad.length) { mismatch++; console.log("MISMATCH", p.name, r ? bad : "not found"); }
  else console.log("OK", r.id, p.name);
}
console.log(`readback: ${gen.length} generated / ${rb.length} read / mismatch ${mismatch}`);
// ── ガード再実行（承認直前）──
const existing = dump.map((r) => ({ linkUrl: r.fields?.["リンクURL"] ?? null, scheduledUtc: r.fields?.["予約日時"] ?? null }));
const posts = gen.map((p) => ({ ...p, recordId: byName[p.name]?.id }));
const { pass, failures } = await runGuardsAsync(posts, existing);
console.log(JSON.stringify({ tag: "REGUARD_BEFORE_APPROVE", ts: new Date().toISOString(), n: posts.length, existing: existing.length, pass, failures }));
