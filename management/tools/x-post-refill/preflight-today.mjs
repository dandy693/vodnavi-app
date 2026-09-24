#!/usr/bin/env node
// 配信前再検査（CSO裁定 2026-09-23・承認後〜配信前）。
//
// 【何をするか】posts から読み戻した「当日予約行」に対し、**Airtable の現在値**でガード23件を再実行する。
// 承認直前の再照合（`reguard-before-approve.mjs`）は投入〜承認の区間しか守らない。
// 本スクリプトは**配信当日の朝 06:00**に 1 点だけ検査を置き、承認〜配信の区間を部分的に塞ぐ。
//
// 【厳守・残差】**当日朝以降（06:00〜21:00）の書き換えは検知できない。**
// W11-05 の書き換え窓（2026-09-17 22:24:48 〜 09-22 21:00 JST）の型であれば捕捉できるが、
// 配信直前の書き換えは残る（FACT_GOVERNANCE §13-5-1）。
//
// 【厳守】本スクリプトは読み取りと検査のみ。**`posts` の本文・ステータスは書かない。**
// NG が出たら「🔴配信前NG」として提示し、承認を外すか本文を直すのは HUMAN。
//
// 使い方:
//   node management/tools/x-post-refill/preflight-today.mjs --readback <posts_readback.json> [--date YYYY-MM-DD] [--dump <posts_dump.json>] [--json <out.json>]
//     --readback … MCP `list_records_for_table` の生結果（`.records[].cellValuesByFieldId`）
//     --date     … 対象の JST 暦日（既定＝実行日の JST）
//     --dump     … 同日件数の分母に使う既存行（`.records[].fields`）。**当日予約行を悉皆で読み戻していれば不要**
//     --json     … 機械可読の結果を書き出す
// 終了コード: 0＝全件 PASS / 1＝NG あり / 2＝引数不正
import { readFileSync, writeFileSync } from "node:fs";
import { runGuardsAsync, jstDate, toHinban, TG_LAST_USED } from "../../../app-concierge/scripts/x-post-generator.mjs";

const F = {
  name: "fldSFgqqf40w8D2hQ",        // Name（旧名 管理ID）
  text: "fldFMfnZXxnhSviDr",        // 投稿文
  type: "fldWn1DLzKGacDC26",        // タイプ
  status: "fldiGogHs9F7w5t2q",      // ステータス
  linkUrl: "fldkk8CfCKXyqPNFO",     // リンクURL
  linkKind: "fldohCPGnEjkTQRV6",    // リンク種別
  scheduled: "fldDrNzqVRb9LxxqD",   // 予約日時（UTC 格納）
  postId: "fldLdjZEjuCqGt0UH",      // ポストID
  errorDetail: "fldvwbyc1oosQ1k23", // エラー詳細
};

// Airtable の `タイプ` 実在値 → 生成器の `kind`。
// 【厳守】T6TV / リンクなし に **"T1" 以外の値**を必ず入れる。`kind` を空にすると
// g1 / g2 / g10 / g22 / g23 が「T1改 とみなす」側へ倒れ、品番の無い投稿で誤発火する。
const KIND_BY_TYPE = {
  "T1改": "T1",
  "T3セール": "T3",
  "T5コンシェルジュ": "T5",
  "TG": "TG",
  "T6TV": "T6",       // 生成器の分岐には現れない＝すべての種別別ガードを素通りする
  "リンクなし": "NOLINK", // 同上
};

// 生成時にしか存在しないメタを要求するガード。**readback だけでは判定できない**ため、
// 失敗しても「検査不能」へ振り分け、🔴配信前NG には出さない。
// 【厳守】ここを空にして「全ガード PASS」と書かないこと。**毎朝必ず赤が出る検査は、
// 本当の違反を隠す**（FACT_GOVERNANCE §8 の「常に陽性を返す検査条件」と同型）。
const META_DEPENDENT = {
  g9_utc_iso: "intendedJst（生成時の意図時刻）",
  g12_actress_not_recent: "actressNames（posts に出演女優の列が無い）",
  g19_t3_deadline: "material.ends_at（T3 の生成材料）",
  g20_t3_template: "material（T3 の生成材料）",
  g21_t3_not_reported: "material.campaign_title（T3 の生成材料）",
};

function arg(name, fallback = null) {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
function todayJst() {
  const d = new Date(Date.now() + 9 * 3600e3);
  return d.toISOString().slice(0, 10);
}
/** `https://app.vodnavi.jp/works/videoa/mimk00271` → `mimk00271`（正規表現を使わない） */
function contentIdFromLink(linkUrl) {
  try {
    const seg = new URL(linkUrl).pathname.split("/").filter(Boolean);
    return seg[0] === "works" && seg.length >= 3 ? seg[2] : null;
  } catch { return null; }
}

const readbackPath = arg("--readback");
if (!readbackPath) {
  console.error("usage: preflight-today.mjs --readback <posts_readback.json> [--date YYYY-MM-DD] [--dump <posts_dump.json>] [--json <out.json>]");
  process.exit(2);
}
const date = arg("--date", todayJst());
const dumpPath = arg("--dump");
const jsonOut = arg("--json");

const records = JSON.parse(readFileSync(readbackPath, "utf8")).records ?? [];
const dump = dumpPath ? (JSON.parse(readFileSync(dumpPath, "utf8")).records ?? []) : [];

// ── ① 当日予約行の抽出（予約日時は UTC 格納・JST 暦日で判定）──
const rows = [];
for (const r of records) {
  const f = r.cellValuesByFieldId ?? {};
  const sched = f[F.scheduled];
  if (!sched) continue;
  let d;
  try { d = jstDate(sched); } catch { continue; }
  if (d !== date) continue;
  rows.push({ id: r.id, f, sched });
}
rows.sort((a, b) => String(a.sched).localeCompare(String(b.sched)));

// ── ② ガード入力の組み立て（**Airtable の現在値のみ**から復元する）──
const unrecovered = [];
const posts = rows.map(({ id, f, sched }) => {
  const typeName = f[F.type]?.name ?? null;
  const kind = typeName ? (KIND_BY_TYPE[typeName] ?? null) : null;
  const linkUrl = f[F.linkUrl] ?? null;
  const contentId = kind === "T1" ? contentIdFromLink(linkUrl) : null;
  if (typeName && !(typeName in KIND_BY_TYPE)) unrecovered.push(`${f[F.name]}: 未知のタイプ「${typeName}」→ kind なしで検査`);
  if (kind === "T1" && !contentId) unrecovered.push(`${f[F.name]}: リンクURL から content_id を復元できない`);
  return {
    recordId: id,
    name: f[F.name] ?? null,
    text: f[F.text] ?? null,
    linkUrl,
    kind,
    typeName,
    statusName: f[F.status]?.name ?? null,
    linkKindName: f[F.linkKind]?.name ?? null,
    postId: f[F.postId] ?? null,
    errorDetail: f[F.errorDetail] ?? null,
    scheduledUtc: sched,
    contentId,
    hinban: contentId ? toHinban(contentId) : null,
    // 【復元不能】出演女優は posts に列が無い。g12（30日以内の再登場）は空配列で必ず通る＝**検査していない**。
    actressNames: [],
  };
});

const existing = dump.map((r) => ({
  linkUrl: r.fields?.["リンクURL"] ?? null,
  scheduledUtc: r.fields?.["予約日時"] ?? null,
}));

// ── ③ ガード再実行 ──
const { failures } = await runGuardsAsync(posts, existing);
const byPost = {};   // 本当の NG（readback の値だけで判定できたもの）
const skipped = {};  // メタ欠落で判定できなかったもの
// 【CSO裁定 2026-09-25 朝】g16 は「自レコードの予約日」を比較対象から除外する。
// TG_LAST_USED は予約済みも登録するため、当日の再検査では自分自身の予約日（=当日）と衝突する（2026-09-25 W9-15 の誤検知）。
// 表の値が自レコードの予約日（JST）と一致する場合は自己登録とみなし NG にしない。表には最新 1 件しか無いため、
// それより前の使用日はこの検査では見えない（=自己登録除外の行は「前回使用は未検査」と併記する）。
const selfExcluded = [];
for (const fl of failures) {
  if (fl.guard === "g16_article_interval") {
    const p = posts.find((x) => x.name === fl.post);
    let slug = null;
    try { slug = new URL(p?.linkUrl ?? "").pathname.replace("/articles/", ""); } catch { /* URL 解析不可はそのまま NG */ }
    if (p && slug && TG_LAST_USED[slug] && TG_LAST_USED[slug] === jstDate(p.scheduledUtc)) {
      selfExcluded.push({ post: p.name, slug, date: TG_LAST_USED[slug] });
      continue;
    }
  }
  if (META_DEPENDENT[fl.guard]) (skipped[fl.post] ??= []).push(fl);
  else (byPost[fl.post] ??= []).push(fl);
}

// ── ④ 出力（NG を先頭・🔴配信前NG）──
const ng = posts.filter((p) => (byPost[p.name] ?? []).length > 0);
const ok = posts.filter((p) => (byPost[p.name] ?? []).length === 0);

console.log(`=== 配信前再検査（対象日 ${date} JST・posts 読み戻し値で全ガード再実行）===`);
console.log(`対象 ${posts.length} 件` + (posts.length ? `（${posts.map((p) => `${p.statusName ?? "―"}/${p.typeName ?? "―"}`).join(" , ")}）` : ""));
for (const p of ng) {
  console.log(`\n🔴配信前NG  ${p.name}  ${p.recordId}  予約 ${jstString(p.scheduledUtc)} JST  ${p.statusName ?? "―"}`);
  for (const fl of byPost[p.name]) console.log(`    ${fl.guard}: ${fl.ng}`);
  console.log(`    本文: ${JSON.stringify(p.text)}`);
}
for (const p of ok) {
  const sk = skipped[p.name] ?? [];
  console.log(`PASS  ${p.name}  予約 ${jstString(p.scheduledUtc)} JST  ${p.statusName ?? "―"}`
    + (sk.length ? `  （検査不能 ${sk.length}: ${sk.map((f) => f.guard).join(" / ")}）` : ""));
}

console.log(`\n【検査不能（生成時メタが posts に無い）】` + Object.entries(META_DEPENDENT).map(([g, why]) => `${g}＝${why}`).join(" / "));
console.log(`【同日件数の上限（g6 / g11 / g18）】当日予約行を__悉皆で__読み戻していれば、既存行 0 でも正しく数えられる（当日分はすべて検査対象側にあるため）。`
  + (dumpPath ? ` --dump を併用した（既存 ${existing.length} 行）。` : ` --dump は渡していない。`));
console.log(`【未検証】TG の記事間隔（g16）は、当日行に TG が無い日には確認できない。TG の予約がある日に挙動を確かめること。`);
if (selfExcluded.length) console.log(`【g16 自己登録除外（CSO裁定 2026-09-25）】${selfExcluded.map((x) => `${x.post}＝TG_LAST_USED[${x.slug}]=${x.date} は自レコードの予約日のため比較対象外（それ以前の使用日は表に無く未検査）`).join(" / ")}`);
for (const u of unrecovered) console.log(`【メタ復元不能】${u}`);
console.log(`\n【厳守・残差】本検査は__対象日の実行時刻__の値を見ている。以後（配信までの間）の書き換えは検知できない（FACT_GOVERNANCE §13-5-1）。`);
console.log(`【厳守】NG の是正（承認を外す／本文を直す）は HUMAN。CTO は posts を書かない。`);

if (jsonOut) {
  writeFileSync(jsonOut, JSON.stringify({
    tag: "PREFLIGHT_TODAY", ts: new Date().toISOString(), date,
    n: posts.length, ngCount: ng.length,
    unrecovered, selfExcluded,
    dumpUsed: Boolean(dumpPath), existingRows: existing.length,
    metaDependent: META_DEPENDENT,
    posts: posts.map((p) => ({ ...p, failures: byPost[p.name] ?? [], skipped: skipped[p.name] ?? [] })),
  }, null, 2) + "\n", "utf8");
  console.log(`\nJSON: ${jsonOut}`);
}
process.exit(ng.length ? 1 : 0);

function jstString(utcIso) {
  try {
    const j = new Date(new Date(utcIso).getTime() + 9 * 3600e3);
    const p = (n) => String(n).padStart(2, "0");
    return `${j.getUTCFullYear()}-${p(j.getUTCMonth() + 1)}-${p(j.getUTCDate())} ${p(j.getUTCHours())}:${p(j.getUTCMinutes())}`;
  } catch { return String(utcIso); }
}
