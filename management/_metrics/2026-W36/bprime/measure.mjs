/**
 * B'系 間欠404 特性測定（第116便 補遺19 裁定2④ — 測定要領は §24-4 を引き継ぐ）
 *
 * 【裁定4 準拠】本スクリプトと結果は `management/` 配下（git 管理）に置く。
 *
 * 固定条件（B系から引き継ぐ・変更しない）:
 *   - 逐次・1件あたり 500ms
 *   - 記録項目: 時刻 / status / x-vercel-cache / age / cache-control
 *   - 404 を観測したら、数秒以内に1回だけ再リクエストし両方のヘッダを対で記録
 *   - 404 観測時の追加サンプリングは上限 20 リクエスト
 *   - 悉皆検査は禁止（フレームの n を超えて広げない）
 *
 * 使い方: node measure.mjs <ラベル>
 *   例: node measure.mjs "第1回・窓内(9/6 16:xx)"
 * 結果は bprime-results.json へ追記する。
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const GAP_MS = 500;              // 事前固定値。変更しない
const RETRY_DELAY_MS = 3000;     // 404 時の対測定までの待ち（「数秒以内」）
const EXTRA_SAMPLING_LIMIT = 20; // 404 時の追加サンプリング上限
const UA = "Mozilla/5.0 (compatible; VodnaviAudit/1.0)";

const label = process.argv[2] ?? "(ラベル未指定)";
const jstNow = () => new Date(Date.now() + 9 * 3600e3).toISOString().replace("T", " ").slice(0, 19);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const frameFile = "bprime-frame-20260905.json";
const frame = JSON.parse(readFileSync(frameFile, "utf8"));
console.log(`=== B'系 測定 「${label}」 ===`);
console.log(`フレーム: ${frameFile} / シード ${frame.seed} / n = ${frame.n}`);
console.log(`開始 ${jstNow()} JST / 逐次 ${GAP_MS}ms`);

const hdr = (r) => ({
  status: r.status,
  cache: r.headers.get("x-vercel-cache"),
  age: r.headers.get("age"),
  cc: r.headers.get("cache-control"),
});

const rows = [];
let requests = 0;
for (const { url, face } of frame.frame) {
  let h;
  const at = jstNow();
  try {
    const r = await fetch(url, { headers: { "User-Agent": UA }, redirect: "manual" });
    requests++;
    h = hdr(r);
  } catch (e) {
    requests++;
    h = { status: -1, cache: null, age: null, cc: null, error: String(e).slice(0, 80) };
  }
  const row = { at, url, face, ...h };
  // 404 の対測定（補遺5 B(2)）
  if (h.status === 404) {
    await sleep(RETRY_DELAY_MS);
    try {
      const r2 = await fetch(url, { headers: { "User-Agent": UA }, redirect: "manual" });
      requests++;
      row.retry = { at: jstNow(), ...hdr(r2) };
    } catch (e) {
      requests++;
      row.retry = { at: jstNow(), status: -1, error: String(e).slice(0, 80) };
    }
  }
  rows.push(row);
  process.stdout.write(h.status === 200 ? "." : `[${h.status}]`);
  await sleep(GAP_MS);
}
console.log(`\n完了 ${jstNow()} JST`);

const n404 = rows.filter((r) => r.status === 404).length;
const nOther = rows.filter((r) => r.status !== 200 && r.status !== 404).length;
console.log(`200: ${rows.filter((r) => r.status === 200).length} / 404: ${n404} / その他: ${nOther}`);
console.log(`自前リクエスト総数: ${requests}（本体 ${frame.n} + 404対測定 ${requests - frame.n}）`);
if (n404 > 0) {
  console.log(`\n**404 を観測した URL**`);
  for (const r of rows.filter((x) => x.status === 404)) {
    console.log(`  ${r.url}  初回 ${r.status}/${r.cache}/age=${r.age}  対測定 ${r.retry?.status}/${r.retry?.cache}`);
  }
  console.log(`【厳守】追加サンプリングは上限 ${EXTRA_SAMPLING_LIMIT} リクエスト。本スクリプトは自動では行わない。`);
} else {
  console.log("404 は 0 件。対測定・追加サンプリングとも発動していない。");
}
const combos = {};
for (const r of rows) {
  const k = `${r.status} / ${r.cache} / age=${r.age}`;
  combos[k] = (combos[k] ?? 0) + 1;
}
console.log("\nヘッダの組合せ:");
for (const [k, v] of Object.entries(combos).sort((a, b) => b[1] - a[1])) console.log(`  ${k} : ${v}件`);
console.log("cache-control のユニーク値:", [...new Set(rows.map((r) => r.cc))].length, "種");

const store = existsSync("bprime-results.json")
  ? JSON.parse(readFileSync("bprime-results.json", "utf8"))
  : { runs: [] };
store.runs.push({
  label, seed: frame.seed, n: frame.n,
  started_jst: rows[0]?.at, finished_jst: jstNow(),
  gap_ms: GAP_MS, requests,
  count_200: rows.filter((r) => r.status === 200).length,
  count_404: n404, count_other: nOther,
  header_combos: combos,
  rows,
});
writeFileSync("bprime-results.json", JSON.stringify(store, null, 1));
console.log(`\nbprime-results.json へ追記（通算 ${store.runs.length} 回目）`);
console.log("【厳守】判定しない。H-obs の判定は測定完了後・CSO 裁定である。");
