/**
 * `ACTRESS_LAST_POSTED` / `ACTRESS_ENTRY_SOURCE` の自動生成 — 第84便タスクB
 *
 * 【なぜ自動化するか】本表は 2026-08-13 に手で作られて以降 更新されず、
 * **その後に実配信された3件（純白彩永 8/17 / 紫堂るい 8/18 / 吉永塔子 8/21）が欠落**していた。
 * **g12 はこの表だけを見るため、表が古いと直近に登場した女優が検査を素通りする。**
 * 第82便で手動更新したが、**手動更新では欠落が繰り返される**（CSO裁定 2026-08-21・第84便(2)）。
 *
 * 【登録基準（第82便で明文化・本スクリプトが機械化する）】
 *   - **配信済み** … `ステータス=投稿済` **かつ `ポストID` を持つ**
 *     ※ §13「`ステータス=投稿済` は X 上の実在を保証しない。配信の実在を判定できる
 *        唯一の機械的手掛かりは `ポストID` の有無である」に従う。
 *   - **予約済み** … `ステータス=承認済` **かつ `予約日時` を持つ**
 *   - **上記以外（予約日時を持たないストック等）は登録しない**
 *     ※ B8 の教訓＝**存在しない配信を記録しない**。
 *
 * 【女優名の解決】**管理ID の自由記述を解析しない。** `リンクURL` の `content_id` を
 * FANZA API に問い合わせ、`iteminfo.actress` を正とする。管理ID の表記揺れに依存しない。
 *
 * 【`ACTRESS_ENTRY_SOURCE`】**まだ配信されていない行（＝予約済み）** の record id を登録する。
 * その行自身を g12 で検査するとき、自分の登録で自分をブロックしないようにするため。
 * **配信済みの行は登録しない**（他の行から見ても自分から見ても通常の履歴であるため）。
 *
 * 使い方:
 *   node --env-file=.env.local scripts/sync-actress-table.mjs --input dump.json          # 差分表示のみ
 *   node --env-file=.env.local scripts/sync-actress-table.mjs --input dump.json --write  # モジュールを書き換える
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  postKind, jstDate,
  ACTRESS_LAST_POSTED as CURRENT_LAST,
  ACTRESS_ENTRY_SOURCE as CURRENT_SRC,
} from "./x-post-generator.mjs";

const argv = process.argv.slice(2);
const arg = (k, d = null) => { const i = argv.indexOf(k); return i === -1 || i + 1 >= argv.length ? d : argv[i + 1]; };
const INPUT = arg("--input");
const WRITE = argv.includes("--write");

if (!INPUT) { console.error("--input <dump.json> は必須（AIRTABLE_PAT は未発行＝HUMAN 枠）"); process.exit(1); }
const API_ID = process.env.DMM_API_ID;
const AFFILIATE_ID = process.env.DMM_AFFILIATE_ID;
if (!API_ID || !AFFILIATE_ID) { console.error("DMM_API_ID / DMM_AFFILIATE_ID が未設定"); process.exit(1); }

const MODULE_PATH = join(dirname(fileURLToPath(import.meta.url)), "x-post-generator.mjs");
const BEGIN = "// <<<AUTOGEN:ACTRESS_TABLE:BEGIN>>>";
const END = "// <<<AUTOGEN:ACTRESS_TABLE:END>>>";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** 単体取得。`iteminfo.actress` を正とする。 */
async function actressesOf(contentId) {
  const u =
    `https://api.dmm.com/affiliate/v3/ItemList?api_id=${API_ID}` +
    `&affiliate_id=${AFFILIATE_ID}&site=FANZA&service=digital&floor=videoa` +
    `&cid=${encodeURIComponent(contentId)}&hits=1&output=json`;
  const j = await (await fetch(u)).json();
  const items = j?.result?.items ?? [];
  if (items.length === 0) return { names: [], note: "FANZA から取得できない（result_count=0）" };
  return { names: (items[0].iteminfo?.actress ?? []).map((a) => a?.name).filter(Boolean), note: null };
}

/** 登録基準の判定。戻り値 null は「登録しない」。 */
function classify(f) {
  const status = typeof f["ステータス"] === "object" ? f["ステータス"]?.name : f["ステータス"];
  const postId = f["ポストID"];
  const sched = f["予約日時"];
  if (status === "投稿済" && postId) return { kind: "delivered", sched };
  if (status === "承認済" && sched) return { kind: "scheduled", sched };
  return null;
}

async function main() {
  const dump = JSON.parse(readFileSync(INPUT, "utf8"));
  const records = dump.records ?? [];
  console.log(`[sync] 入力レコード: ${records.length} 件`);

  const last = {};          // 女優名 -> "YYYY-MM-DD"（最大）
  const entrySource = {};   // 女優名 -> record id（未配信の行のみ）
  const skipped = [];
  const unresolved = [];

  for (const r of records) {
    const f = r.fields ?? {};
    const linkUrl = f["リンクURL"] ?? null;
    if (postKind(linkUrl) !== "workIntro") { skipped.push([f["管理ID"], "作品紹介ではない"]); continue; }

    const cls = classify(f);
    if (!cls) {
      const status = typeof f["ステータス"] === "object" ? f["ステータス"]?.name : f["ステータス"];
      skipped.push([f["管理ID"], `登録基準を満たさない（${status}${f["予約日時"] ? "" : "・予約日時なし"}${f["ポストID"] ? "" : "・ポストIDなし"}）`]);
      continue;
    }

    const cid = new URL(linkUrl).pathname.split("/").pop();
    const { names, note } = await actressesOf(cid);
    await sleep(120);
    if (note) { unresolved.push([f["管理ID"], cid, note]); continue; }
    if (names.length === 0) { unresolved.push([f["管理ID"], cid, "iteminfo.actress が空"]); continue; }

    const day = jstDate(cls.sched);
    for (const n of names) {
      if (!last[n] || last[n] < day) last[n] = day;
      // 未配信（予約済み）の行のみ、自分自身をブロックしないための出所を記録する
      if (cls.kind === "scheduled") entrySource[n] = r.id;
      else if (entrySource[n] === r.id) delete entrySource[n];
    }
  }

  const sortedLast = Object.fromEntries(Object.entries(last).sort((a, b) => a[1].localeCompare(b[1]) || a[0].localeCompare(b[0])));

  // ── 差分（現行のモジュール値との比較） ──
  const added = [], removed = [], changed = [];
  for (const [n, d] of Object.entries(sortedLast)) {
    if (!(n in CURRENT_LAST)) added.push([n, d]);
    else if (CURRENT_LAST[n] !== d) changed.push([n, CURRENT_LAST[n], d]);
  }
  for (const n of Object.keys(CURRENT_LAST)) if (!(n in sortedLast)) removed.push([n, CURRENT_LAST[n]]);

  console.log(`\n[sync] 生成: ${Object.keys(sortedLast).length} 名 / 現行: ${Object.keys(CURRENT_LAST).length} 名`);
  console.log(`[sync] 一致: ${Object.keys(sortedLast).length - added.length - changed.length} 名`);
  if (added.length) { console.log("\n── 追加される ──"); added.forEach(([n, d]) => console.log(`  + ${n}: ${d}`)); }
  if (changed.length) { console.log("\n── 日付が変わる ──"); changed.forEach(([n, o, d]) => console.log(`  ~ ${n}: ${o} → ${d}`)); }
  if (removed.length) { console.log("\n── 削除される（登録基準を満たさない）──"); removed.forEach(([n, d]) => console.log(`  - ${n}: ${d}`)); }

  console.log("\n── ACTRESS_ENTRY_SOURCE ──");
  console.log("  生成:", JSON.stringify(entrySource), "／ 現行:", JSON.stringify(CURRENT_SRC));

  if (skipped.length) { console.log("\n── 登録しなかった行 ──"); skipped.forEach(([id, why]) => console.log(`  · ${id} … ${why}`)); }
  if (unresolved.length) { console.log("\n── 女優名を解決できなかった行（要確認）──"); unresolved.forEach(([id, cid, why]) => console.log(`  ! ${id} (${cid}) … ${why}`)); }

  if (!WRITE) { console.log("\n--write が無いため書き換えていない。"); return; }

  const src = readFileSync(MODULE_PATH, "utf8");
  const b = src.indexOf(BEGIN), e = src.indexOf(END);
  if (b === -1 || e === -1) { console.error(`\nマーカーが見つからない（${BEGIN} / ${END}）`); process.exit(1); }

  const fmt = (o) => Object.entries(o).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`).join("\n");
  const body =
    `${BEGIN}\n` +
    `// 自動生成（scripts/sync-actress-table.mjs）。**手で編集しないこと。**\n` +
    `// 生成元＝Airtable の実レコード。女優名は FANZA API の iteminfo.actress を正とする。\n` +
    `export const ACTRESS_LAST_POSTED = {\n${fmt(sortedLast)}\n};\n` +
    `export const ACTRESS_ENTRY_SOURCE = {\n${fmt(entrySource)}\n};\n`;

  writeFileSync(MODULE_PATH, src.slice(0, b) + body + src.slice(e), "utf8");
  console.log(`\nモジュールを書き換えた: ${MODULE_PATH}`);
}

main().catch((e) => { console.error("[sync] 失敗:", e); process.exit(1); });
