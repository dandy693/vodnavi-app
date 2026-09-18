// 束2 リプ案生成ツール — 作品知識（Supabase 読み取りのみ・実行は Claude Code の Supabase MCP）
// 設計書 §2・§10-1 B: buildCacheKey を再現して fanza_response_cache を PK 照会（実測 8〜11 ms）。
// 品番のみのときは sitemap_works_archive から content_id を解決してから PK 照会。全走査（22 秒/件）は生成しない。
// 本ファイルはネットワークに触れない。SQL 文字列と抽出結果（JSON）を扱うだけ。
//
// CLI:
//   node knowledge.mjs --sql parsed.json            → 行ごとの SQL（MCP execute_sql に貼る）を JSON で出力
//   node knowledge.mjs --extract rows.json          → execute_sql の結果（配列）から知識 JSON を生成
//   node knowledge.mjs --key <cid> [floor]          → cache_key を表示（検算用）

import { createHash } from "node:crypto";
import fs from "node:fs";
import { isMain } from "./parse.mjs";

/** app-concierge/src/lib/fanza/stale-cache.ts buildCacheKey の写し（同一アルゴリズム・2026-09-18 に 2 件で PK 一致を確認）。 */
export function buildCacheKey(params, filtered) {
  const entries = Object.entries(params)
    .filter(([, v]) => v != null && v !== "")
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([k, v]) => [k, String(v)]);
  entries.push(["__filtered", String(filtered)]);
  return createHash("sha256").update(JSON.stringify(entries)).digest("hex");
}

export const FLOORS = ["videoa", "nikkatsu", "anime"]; // §2-3 の試行順

/** works 詳細 getWork と同じ params（cid 指定は filtered=false）。 */
export function cacheKeyForCid(cid, floor) {
  return buildCacheKey({ site: "FANZA", service: "digital", floor, cid, hits: 1 }, false);
}

/** 品番 → sitemap_works_archive の照合用 suffix（SONE-682 → sone00682）。 */
export function hinbanToSuffix(hinban) {
  const m = String(hinban).toUpperCase().match(/^([A-Z]{2,6})-(\d{3,5})$/);
  if (!m) return null;
  return m[1].toLowerCase() + m[2].padStart(5, "0");
}

function q(s) {
  return "'" + String(s).replace(/'/g, "''") + "'";
}

/** content_id（floor 不明なら 3 フロア）の PK 照会 SQL。 */
export function sqlForCid(cid, floor = null) {
  const floors = floor ? [floor] : FLOORS;
  const keys = floors.map((f) => ({ floor: f, key: cacheKeyForCid(cid, f) }));
  const sql =
    "select cache_key, fetched_at, payload->'result'->'items'->0 as item from fanza_response_cache where cache_key in (" +
    keys.map((k) => q(k.key)).join(", ") +
    ")";
  return { cid, keys, sql };
}

/** 品番 → content_id 候補（含有一致。後方一致だと `…00345ai` 型の末尾付き id を取りこぼすため）。 */
export function sqlForHinban(hinban) {
  const suffix = hinbanToSuffix(hinban);
  if (!suffix) return null;
  return {
    hinban,
    suffix,
    sql: `select content_id, floor_code, released_at from sitemap_works_archive where content_id like ${q("%" + suffix + "%")} order by content_id limit 20`,
  };
}

/** parse.mjs の出力から、行ごとの SQL 計画を作る。 */
export function planFromParsed(parsed) {
  const plans = [];
  for (const line of parsed.lines ?? []) {
    if (!line.ok || !line.work) continue;
    if (line.work.kind === "content_id") plans.push({ lineNo: line.lineNo, handle: line.handle, step: "cid", ...sqlForCid(line.work.contentId, line.work.floor) });
    else if (line.work.kind === "hinban") plans.push({ lineNo: line.lineNo, handle: line.handle, step: "hinban", ...sqlForHinban(line.work.hinban) });
  }
  return plans;
}

const names = (arr) => (Array.isArray(arr) ? arr.map((x) => x?.name).filter(Boolean) : []);

/**
 * DMM item → リプ生成に渡す知識（§2-5 の許可フィールドのみ）。
 * 渡さない: affiliateURL / URL / imageURL / sampleImageURL / sampleMovieURL（§26-5・R1/R3 のため）。
 * prices / campaign は裁定 D（出典があれば価格・セール言及可）に従い、fetched_at（時点）と併せて渡す。
 */
export function extractKnowledge(item, fetchedAt = null) {
  if (!item || typeof item !== "object") return null;
  const info = item.iteminfo ?? {};
  const k = {
    content_id: item.content_id ?? null,
    floor_code: item.floor_code ?? null,
    title: item.title ?? null,
    date: item.date ?? null,
    volume: item.volume ?? null,
    actress: names(info.actress),
    genre: names(info.genre),
    maker: names(info.maker),
    label: names(info.label),
    series: names(info.series),
    director: names(info.director),
    review: item.review ? { count: item.review.count ?? null, average: item.review.average ?? null } : null,
    price: item.prices?.price ?? null,
    list_price: item.prices?.list_price ?? null,
    campaign: Array.isArray(item.campaign) ? item.campaign.map((c) => ({ title: c.title, date_begin: c.date_begin, date_end: c.date_end })) : [],
    fetched_at: fetchedAt,
  };
  // 念のため URL 系が混入していないことを機械検査（§8 / 束1 FORBIDDEN と同型）
  const s = JSON.stringify(k);
  if (/https?:|af_id|moterist-\d{3}|imageURL|sampleImageURL|sampleMovieURL/i.test(s)) throw new Error("knowledge に URL/af_id 系が混入");
  return k;
}

/** execute_sql の結果行（cache_key / fetched_at / item）→ 知識。ヒットが無ければ null。 */
export function knowledgeFromRows(rows) {
  const r = (rows ?? []).find((x) => x && x.item);
  if (!r) return null;
  const item = typeof r.item === "string" ? JSON.parse(r.item) : r.item;
  return extractKnowledge(item, r.fetched_at ?? null);
}

if (isMain(import.meta.url)) {
  const [, , mode, arg, arg2] = process.argv;
  if (mode === "--sql") {
    const parsed = JSON.parse(fs.readFileSync(arg, "utf8"));
    process.stdout.write(JSON.stringify(planFromParsed(parsed), null, 2) + "\n");
  } else if (mode === "--extract") {
    // 入力: { "<lineNo>": [rows...] } または rows 配列（1 行分）
    const raw = JSON.parse(fs.readFileSync(arg, "utf8"));
    const out = Array.isArray(raw) ? knowledgeFromRows(raw) : Object.fromEntries(Object.entries(raw).map(([k, rows]) => [k, knowledgeFromRows(rows)]));
    process.stdout.write(JSON.stringify(out, null, 2) + "\n");
  } else if (mode === "--key") {
    const floors = arg2 ? [arg2] : FLOORS;
    for (const f of floors) process.stdout.write(`${f}\t${cacheKeyForCid(arg, f)}\n`);
  } else {
    process.stderr.write("usage: node knowledge.mjs --sql parsed.json | --extract rows.json | --key <cid> [floor]\n");
    process.exit(2);
  }
}
