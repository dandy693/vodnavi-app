/**
 * B'系 フレーム構築（第116便 補遺19 裁定2）
 *
 * 【裁定4 準拠】本スクリプトと出力は `management/` 配下（git 管理）に置く。
 * scratchpad には実験資産を置かない（B系はこれを怠り OS のクリーンアップで
 * フレームを失った）。
 *
 * 【決定的であること】sitemap → 面の選定 → 面内 works の選定まで、すべて
 * `md5(url + SEED)` の昇順で決める。同じ sitemap と同じシードなら同じ集合になる。
 * **ただし sitemap も面の内容も時間で変わるため、出力そのものを永続化する**
 * （§23-3 の cohort1 方式）。
 *
 * 使い方: node build-frame.mjs
 * 出力  : bprime-frame-<日付>.json （URL 全リスト + 生成条件）
 */
import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";

const SEED = "bprime-20260905";
const FACES_PER_KIND = 9;   // actresses 9 / genres 9 = 18面（B系と同じ面数）
const WORKS_PER_FACE = 3;   // 面ごと3本（B系と同じ層化）
const UA = "Mozilla/5.0 (compatible; VodnaviAudit/1.0)";
const BASE = "https://app.vodnavi.jp";

const md5 = (s) => createHash("md5").update(s).digest("hex");
const jst = () => new Date(Date.now() + 9 * 3600e3).toISOString().replace("T", " ").slice(0, 19) + " JST";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

console.log(`=== B'系 フレーム構築 開始 ${jst()} ===`);
console.log(`シード: ${SEED}`);

// 1) sitemap から面を決定的に選ぶ
const smRes = await fetch(`${BASE}/sitemap.xml`, { headers: { "User-Agent": UA } });
const sm = await smRes.text();
const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
console.log(`sitemap: HTTP ${smRes.status} / <loc> ${locs.length}`);

const pick = (arr, n) =>
  [...arr].sort((a, b) => (md5(a + SEED) < md5(b + SEED) ? -1 : 1)).slice(0, n);

const actressFaces = pick(locs.filter((u) => /\/actresses\/\d+$/.test(u)), FACES_PER_KIND);
const genreFaces = pick(locs.filter((u) => /\/genres\/\d+$/.test(u)), FACES_PER_KIND);
const faces = [...actressFaces, ...genreFaces];
console.log(`面: actresses ${actressFaces.length} / genres ${genreFaces.length} = ${faces.length}`);

// 2) 各面を1回だけ取得し、works リンクを抽出（自前リクエスト = 面数のみ）
const frame = [];
const faceStats = [];
for (const face of faces) {
  let works = [];
  let code = 0;
  try {
    const r = await fetch(face, { headers: { "User-Agent": UA } });
    code = r.status;
    const html = await r.text();
    works = [...new Set(
      [...html.matchAll(/href="(\/works\/[a-z]+\/[a-zA-Z0-9_]+)"/g)].map((m) => BASE + m[1]),
    )];
  } catch { code = -1; }
  const chosen = pick(works, WORKS_PER_FACE);
  faceStats.push({ face, code, found: works.length, chosen: chosen.length });
  for (const u of chosen) frame.push({ face, url: u });
  process.stdout.write(".");
  await sleep(500);
}
console.log(`\n面の取得完了 ${jst()}`);

// 3) 重複除去（複数面に同じ works が出る場合がある）
const seen = new Set();
const unique = [];
for (const row of frame) {
  if (seen.has(row.url)) continue;
  seen.add(row.url);
  unique.push(row);
}

const out = {
  name: "B'系 間欠404 特性測定フレーム",
  ruling: "第116便 補遺19 裁定2",
  seed: SEED,
  generated_at_jst: jst(),
  method: {
    faces: `sitemap.xml の /actresses/{id} と /genres/{id} から md5(url+SEED) 昇順で各 ${FACES_PER_KIND} 面`,
    works: `各面の HTML から href="/works/{floor}/{cid}" を抽出し md5(url+SEED) 昇順で先頭 ${WORKS_PER_FACE} 本`,
    dedupe: "複数面に重複した works は先着1件のみ残す",
    strata: "無し（旧34件『バースト経験あり』は復元不能のため層を設けない・裁定2③）",
  },
  sitemap_loc_count: locs.length,
  face_count: faces.length,
  n: unique.length,
  faces: faceStats,
  frame: unique,
};
const file = `bprime-frame-20260905.json`;
writeFileSync(file, JSON.stringify(out, null, 1));
console.log(`\n出力: ${file}`);
console.log(`  面 ${faces.length} / 抽出 ${frame.length} → 重複除去後 n = ${unique.length}`);
console.log(`  面ごとの取得: ${faceStats.filter((f) => f.code === 200).length}/${faceStats.length} が HTTP 200`);
const bad = faceStats.filter((f) => f.code !== 200);
if (bad.length) for (const b of bad) console.log(`  ** ${b.code} ${b.face}`);
