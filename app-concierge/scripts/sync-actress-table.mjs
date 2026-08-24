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
 * 【厳守・恒久手順（§13-8）】**`--write` の前に必ず dry-run を実行し、解決件数を目視すること。**
 * **解決件数が 0 または想定を大きく下回る場合は書き込まない。** 外部 API が停止していると
 * 女優名を1件も解決できず、**生成される表が空になり `g12` が全通しになる**（2026-08-24 実測）。
 *
 * 【測定ログ・第107便】**両経路で `VODNAVI_ACTRESS_SYNC` を1行出力する。**
 * **判定も拒否もしない。** ガードの閾値を決めるための分布を貯めることだけが目的である
 * （§13-8 のガードは案C主+案A砦で仮採用されたが、**平常時の `U/T` 分布が未測定**）。
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
  if (items.length === 0) {
    return { names: [], note: "FANZA から取得できない（result_count=0）", reason: "fetch_zero" };
  }
  return {
    names: (items[0].iteminfo?.actress ?? []).map((a) => a?.name).filter(Boolean),
    note: null,
    reason: null,
  };
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
  // **T（解決を試みた行数）。** `skipped` は登録基準を満たさず API を呼んでいないため
  // 分母に入れない。**分母を「入力レコード数」にすると、対象外の行が増えるだけで
  // 失敗率が下がって見える**（§15-2 軸5＝機会の数）。
  let attempted = 0;

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
    attempted += 1;
    const { names, note, reason } = await actressesOf(cid);
    await sleep(120);
    if (note) { unresolved.push([f["管理ID"], cid, note, reason]); continue; }
    if (names.length === 0) { unresolved.push([f["管理ID"], cid, "iteminfo.actress が空", "actress_empty"]); continue; }

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

  // ────────────────────────────────────────────────────────────────
  // 測定ログ（第107便 タスクA・**判定も拒否もしない**）
  //
  // 【なぜ判定を入れないか】§13-8 のガードは案C（解決失敗率）を主に据える方向で
  // 仮採用されたが、**閾値の根拠となる「平常時の U/T 分布」を1度も測っていない。**
  // 勘で閾値を置くと、誤検知で運用が止まるか、見逃して表が壊れるかのどちらかになる。
  // **本ブロックは分布を貯めるためだけに存在する。**
  //
  // 【`u_fetch` と `u_empty` を分けている理由】`unresolved` は原因が2種類ある。
  //   - `u_fetch` … FANZA が作品を返さない（**API 停止でも、B8 のような恒久 404 でも起きる**）
  //   - `u_empty` … 作品は返るが `iteminfo.actress` が空（**anime 等では正常な状態**）
  // **合算した率で閾値を引くと、正常な `u_empty` が多い期間に誤検知する。**
  // **どちらを分子にするかは閾値と同時に裁定する必要があるため、両方を出す。**
  //
  // 【dry-run / --write の双方で出す】`--write` の早期 return より前に置いてある。
  // **測定が `--write` のときだけ出ると、dry-run 先行の手順（§13-8）で分布が貯まらない。**
  const uFetch = unresolved.filter((u) => u[3] === "fetch_zero").length;
  const uEmpty = unresolved.filter((u) => u[3] === "actress_empty").length;
  const rate = (n) => (attempted === 0 ? null : Math.round((n / attempted) * 10000) / 10000);
  console.info(JSON.stringify({
    tag: "VODNAVI_ACTRESS_SYNC",
    ts: new Date().toISOString(),
    mode: WRITE ? "write" : "dry-run",
    records_in: records.length,          // 入力レコード総数
    skipped: skipped.length,             // 登録基準を満たさず API を呼んでいない行
    t_attempted: attempted,              // T … 解決を試みた行数（分母）
    u_total: unresolved.length,          // U … 解決できなかった行数
    u_fetch: uFetch,                     // うち FANZA が作品を返さなかった
    u_empty: uEmpty,                     // うち actress が空だった
    r_resolved: attempted - unresolved.length,
    u_rate: rate(unresolved.length),     // U / T
    u_fetch_rate: rate(uFetch),          // u_fetch / T ← 案C の分子候補
    n_new: Object.keys(sortedLast).length,   // 生成される女優名の数
    n_cur: Object.keys(CURRENT_LAST).length, // 現行表の女優名の数
    n_added: added.length,
    n_changed: changed.length,
    n_removed: removed.length,           // ← 案B（相対比較）の材料。案B 自体は不採用
    src_new: Object.keys(entrySource).length,
    src_cur: Object.keys(CURRENT_SRC).length,
  }));
  // ────────────────────────────────────────────────────────────────

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
