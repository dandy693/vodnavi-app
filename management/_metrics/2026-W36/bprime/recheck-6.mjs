/**
 * B'系 第1回で 404 だった6件の追観測（2026-09-09 裁定1(a)）
 *
 * 目的: **6件が「恒久404」か「間欠404の長時間型」かを分ける。**
 *   - 第1回（9/9 16:16）で 404、数秒後の対測定でも 404 だった。
 *   - これまで観測されてきた間欠404は約40分〜数時間で自然回復していた（§24-1）。
 *   - **時間を空けた再測定でしか区別できない**（§10 の「n回反復は持続性の証拠ではない」）。
 *
 * 読み方（裁定1(b) で事前固定・データを見る前に確定）:
 *   - **2日連続で404** → 「恒久404（配信終了作品の可能性大）」。**フレーム鮮度交絡の実証**として記録
 *   - **回復していれば** → 「間欠404の長時間型」。**§24-1 の回復時間記述を更新**
 *
 * 【厳守】判定は CSO 裁定。本スクリプトは事実の記録のみ。
 * 【負荷】1回あたり 6 リクエスト（逐次 500ms）。追加サンプリングはしない。
 *
 * 使い方: node recheck-6.mjs "<ラベル>"
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const GAP_MS = 500;
const UA = "Mozilla/5.0 (compatible; VodnaviAudit/1.0)";
const BASE = "https://app.vodnavi.jp";

/** 第1回（2026-09-09 16:16:22〜16:17:19 JST）で 404 だった6件。変更しない。 */
const TARGETS = [
  "/works/nikkatsu/5342gp14809",
  "/works/videoa/1sbp00418",
  "/works/videoa/13dsvr01667",
  "/works/videoa/1vspds00345ai",
  "/works/videoa/mmpb00137",
  "/works/videoa/mida00625",
];

const label = process.argv[2] ?? "(ラベル未指定)";
const jstNow = () => new Date(Date.now() + 9 * 3600e3).toISOString().replace("T", " ").slice(0, 19);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

console.log(`=== 6件 追観測 「${label}」 ===`);
console.log(`開始 ${jstNow()} JST / 逐次 ${GAP_MS}ms / 対象 ${TARGETS.length} 件`);

const rows = [];
for (const path of TARGETS) {
  const at = jstNow();
  let h;
  try {
    const r = await fetch(BASE + path, { headers: { "User-Agent": UA }, redirect: "manual" });
    h = {
      status: r.status,
      cache: r.headers.get("x-vercel-cache"),
      age: r.headers.get("age"),
      cc: r.headers.get("cache-control"),
    };
  } catch (e) {
    h = { status: -1, error: String(e).slice(0, 80) };
  }
  rows.push({ at, path, ...h });
  console.log(`  ${h.status}  ${h.cache ?? "-"}/age=${h.age ?? "-"}  ${path}`);
  await sleep(GAP_MS);
}
console.log(`完了 ${jstNow()} JST`);

const n404 = rows.filter((r) => r.status === 404).length;
const n200 = rows.filter((r) => r.status === 200).length;
console.log(`\n**404: ${n404} / 200: ${n200} / その他: ${rows.length - n404 - n200}**`);
if (n200 > 0) {
  console.log("**回復した URL**");
  for (const r of rows.filter((x) => x.status === 200)) console.log(`  ${r.path}`);
}
console.log("【厳守】判定しない。読み方は裁定1(b) で事前固定済み。判定は CSO。");

const f = "bprime-recheck6.json";
const store = existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : { note: "第1回で404だった6件の追観測（裁定1(a)）", runs: [] };
store.runs.push({ label, started_jst: rows[0]?.at, finished_jst: jstNow(), count_404: n404, count_200: n200, rows });
writeFileSync(f, JSON.stringify(store, null, 1));
console.log(`\n${f} へ追記（通算 ${store.runs.length} 回目）`);
