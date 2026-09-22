#!/usr/bin/env node
// 承認直前の再照合（`ROUTINE_CHECKLISTS.md` §3 固定ステップ4 / `generate-t1.mjs` の注記どおり2回目）。
//
// 【2026-09-23 改訂・W11-05 本文事故を受けて】
// 旧版（`management/_metrics/2026-W38/refill-20260917/reguard-before-approve.mjs`）は
// **ガードを「生成時の JSON」に対して実行していた**。そのため、Airtable 側で本文が
// 書き換わっていても、ガードは生成時の正常な本文を見て PASS する。
// 本版は **Airtable から読み戻した値（投稿文・リンクURL・名称）をガードに渡す**。
// これにより g22（本文＝名称）/ g23（本文が内部ラベル）が承認直前に実際に効く。
//
// 【厳守・本スクリプトの限界】検出できるのは「承認直前の時点で壊れていること」だけである。
// **W11-05 の事故は承認直前（2026-09-17 22:24:48 JST）の時点では正常であり、その後に壊れた。**
// したがって本版でも当該事故は検出できない。承認後〜配信前の再検査は別途要る（CSO 裁定事項）。
//
// 使い方:
//   node management/tools/x-post-refill/reguard-before-approve.mjs <readback.json> <generated.json> <posts_dump.json>
//     readback.json   … MCP `list_records_for_table` の生結果（`.records[].cellValuesByFieldId`）
//     generated.json  … `generate-t1.mjs` の出力（`.posts`）
//     posts_dump.json … 同日件数の分母に使う既存行（`.records[].fields`）
import { readFileSync } from "node:fs";
import { runGuardsAsync } from "../../../app-concierge/scripts/x-post-generator.mjs";

const F = {
  name: "fldSFgqqf40w8D2hQ",        // Name（旧名 管理ID）
  text: "fldFMfnZXxnhSviDr",        // 投稿文
  linkUrl: "fldkk8CfCKXyqPNFO",     // リンクURL
  type: "fldWn1DLzKGacDC26",        // タイプ
  status: "fldiGogHs9F7w5t2q",      // ステータス
  linkKind: "fldohCPGnEjkTQRV6",    // リンク種別
  scheduled: "fldDrNzqVRb9LxxqD",   // 予約日時
  postId: "fldLdjZEjuCqGt0UH",      // ポストID
};

const [readbackPath, genPath, dumpPath] = process.argv.slice(2);
if (!readbackPath || !genPath || !dumpPath) {
  console.error("usage: reguard-before-approve.mjs <readback.json> <generated.json> <posts_dump.json>");
  process.exit(2);
}
const rb = JSON.parse(readFileSync(readbackPath, "utf8")).records;
const gen = JSON.parse(readFileSync(genPath, "utf8")).posts;
const dump = JSON.parse(readFileSync(dumpPath, "utf8")).records;

// ── ① 読み戻し照合（生成 JSON と Airtable の値が一致するか）──
let mismatch = 0;
const byName = Object.fromEntries(rb.map((r) => [r.cellValuesByFieldId?.[F.name], r]));
for (const p of gen) {
  const r = byName[p.name];
  const f = r?.cellValuesByFieldId ?? {};
  const checks = {
    text: f[F.text] === p.text,
    link: f[F.linkUrl] === p.linkUrl,
    type: f[F.type]?.name === "T1改",
    status: f[F.status]?.name === "ストック",
    linkKind: f[F.linkKind]?.name === "サイト",
    schedEmpty: f[F.scheduled] == null,
    postIdEmpty: f[F.postId] == null,
  };
  const bad = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);
  if (!r || bad.length) { mismatch++; console.log("MISMATCH", p.name, r ? bad : "not found"); }
  else console.log("OK", r.id, p.name);
}
console.log(`readback: ${gen.length} generated / ${rb.length} read / mismatch ${mismatch}`);

// ── ② ガード再実行。**ガードに渡す値は Airtable の読み戻し値**（本スクリプトの要点）──
const existing = dump.map((r) => ({
  linkUrl: r.fields?.["リンクURL"] ?? null,
  scheduledUtc: r.fields?.["予約日時"] ?? null,
}));
const posts = gen.map((p) => {
  const r = byName[p.name];
  const f = r?.cellValuesByFieldId ?? {};
  return {
    ...p,
    recordId: r?.id,
    // 読み戻し値で上書きする。読み戻せない場合は生成値のまま（①で MISMATCH として既に出ている）。
    name: f[F.name] ?? p.name,
    text: f[F.text] ?? p.text,
    linkUrl: f[F.linkUrl] ?? p.linkUrl,
  };
});
const sourceOfText = posts.map((p) => ({
  name: p.name,
  textFrom: byName[p.name]?.cellValuesByFieldId?.[F.text] != null ? "airtable" : "generated",
}));
const { pass, failures } = await runGuardsAsync(posts, existing);
console.log(JSON.stringify({
  tag: "REGUARD_BEFORE_APPROVE",
  ts: new Date().toISOString(),
  n: posts.length,
  existing: existing.length,
  guardInputText: sourceOfText,
  readbackMismatch: mismatch,
  pass,
  failures,
}));
process.exit(pass && mismatch === 0 ? 0 : 1);
