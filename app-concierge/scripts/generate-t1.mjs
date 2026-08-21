/**
 * T1改（作品紹介）の原稿生成ドライバ — 第80便タスクF / 第82便タスクD(3)
 *
 * `x-post-generator.mjs` は**モジュールのみで CLI 入口を持たない**ため、
 * 候補抽出 → 原稿生成 → ガード17件 の3工程を繋ぐドライバを分離して置く。
 * **判断はモジュール側に集約したまま、ここには入出力と手順だけを書く。**
 *
 * 【このドライバがやらないこと】
 *   - **Airtable への書き込みはしない。** `AIRTABLE_PAT` は未発行（実測 2026-08-21・
 *     `.env.local` に存在しない）であり、**PAT の発行は HUMAN 枠**（`audit-posts.mjs`
 *     と同じ制約）。書き込みは MCP 経由で行い、**`ステータス=ストック` 固定**＋
 *     **読み戻し検算**（§10）を別工程で実施する。
 *   - **予約日時の設定はしない。** `--slots` は**ガード評価のための想定枠**であって、
 *     書き込む値ではない。承認・予約は CSO 裁定を要する別工程（§13-1）。
 *   - **ステータスを書かない。** 本ファイルに `承認済` の文字列は存在しない。
 *
 * 【ガードは2回走らせること】モジュールの `runGuardsAsync` の注記どおり、
 *   **書き込み前**と**承認・予約日時の設定前**の両方で実行する。
 *   B8 は 7/19 作成 → 8/17 配信予定の間に FANZA 側から取得できなくなった実例がある。
 *
 * 使い方:
 *   node --env-file=.env.local scripts/generate-t1.mjs \
 *     --slots "2026-08-23 21:00,2026-08-24 21:00" --id-prefix W8 [--recent X1,X5] \
 *     [--existing dump.json] [--pages 3] [--floor videoa] [--json out.json]
 */

import { readFileSync, writeFileSync } from "node:fs";
import {
  TEMPLATES, pickTemplate, postedText, weightedLength,
  toHinban, isHinbanVerifiable, hasPostedActress, ACTRESS_EXCLUDE_DAYS,
  jstToUtcIso, jstDate, runGuardsAsync, STOCK_STATUS,
} from "./x-post-generator.mjs";

const argv = process.argv.slice(2);
const arg = (k, dflt = null) => {
  const i = argv.indexOf(k);
  return i === -1 || i + 1 >= argv.length ? dflt : argv[i + 1];
};

const SLOTS = (arg("--slots") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
const ID_PREFIX = arg("--id-prefix");
/**
 * 管理IDの開始連番。**既存の管理IDと衝突させないために必須の入力**。
 * 実例（2026-08-21）: `W8-01`〜`W8-03` は既に Airtable に存在したため、既定の 1 で
 * 生成すると重複する。**発番前に Airtable の既存 ID を必ず確認すること。**
 */
const START_SEQ = Number(arg("--start-seq", "1"));
const RECENT = (arg("--recent") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
const EXISTING_PATH = arg("--existing");
const PAGES = Number(arg("--pages", "3"));
const FLOOR = arg("--floor", "videoa");
const JSON_OUT = arg("--json");
const HITS = 100;

if (SLOTS.length === 0 || !ID_PREFIX) {
  console.error("--slots と --id-prefix は必須。--slots \"2026-08-23 21:00,...\" --id-prefix W8");
  process.exit(1);
}
const API_ID = process.env.DMM_API_ID;
const AFFILIATE_ID = process.env.DMM_AFFILIATE_ID;
if (!API_ID || !AFFILIATE_ID) {
  console.error("DMM_API_ID / DMM_AFFILIATE_ID が未設定");
  process.exit(1);
}

/** 今日（JST）。間隔判定の既定基準日。 */
const todayJst = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchPage(offset) {
  const u =
    `https://api.dmm.com/affiliate/v3/ItemList?api_id=${API_ID}` +
    `&affiliate_id=${AFFILIATE_ID}&site=FANZA&service=digital&floor=${FLOOR}` +
    `&sort=rank&hits=${HITS}&offset=${offset}&output=json`;
  const res = await fetch(u);
  const json = await res.json();
  if (json?.result?.status && Number(json.result.status) >= 400) {
    throw new Error(`FANZA API status=${json.result.status}`);
  }
  return json?.result?.items ?? [];
}

/**
 * 候補の要件。**5テンプレートすべてが組み立てられる候補だけを通す。**
 *
 * 【なぜ全テンプレート分の項目を要求するか】`pickTemplate` はテンプレートを LRU で選ぶが、
 * **選ばれたテンプレートが必要とする項目を候補が持っているかは見ない**。ここで欠けた候補を
 * 落としておかないと、`X3` が選ばれた瞬間に `c.rating.toFixed` が落ちる。
 * **テンプレート選択のロジックはモジュール側の正であり、ここで分岐させない。**
 */
function toCandidate(it) {
  const contentId = it.content_id;
  if (!contentId) return { skip: "content_id なし" };
  if (!isHinbanVerifiable(contentId)) return { skip: `品番を検証できない: ${contentId}` };

  const actresses = (it.iteminfo?.actress ?? []).map((a) => a?.name).filter(Boolean);
  if (actresses.length === 0) return { skip: "出演者情報なし" };

  const maker = (it.iteminfo?.maker ?? [])[0]?.name;
  if (!maker) return { skip: "メーカー情報なし（X5 が組めない）" };

  const minutes = Number(it.volume);
  if (!Number.isFinite(minutes) || minutes <= 0) return { skip: "収録時間なし（X2/X4/X5 が組めない）" };

  const rc = Number(it.review?.count);
  const rating = Number(it.review?.average);
  if (!Number.isFinite(rc) || rc < 1 || !Number.isFinite(rating)) {
    return { skip: "レビューなし（X3 が組めない）" };
  }

  return {
    c: {
      contentId,
      floor: FLOOR,
      title: it.title ?? "",
      actress: actresses[0],
      actressNames: actresses,
      hinban: toHinban(contentId),
      minutes,
      rc,
      rating,
      maker,
      genresRaw: (it.iteminfo?.genre ?? []).map((g) => g?.name).filter(Boolean),
    },
  };
}

async function main() {
  const existing = EXISTING_PATH
    ? JSON.parse(readFileSync(EXISTING_PATH, "utf8")).records?.map((r) => ({
        linkUrl: r.fields?.["リンクURL"] ?? null,
        scheduledUtc: r.fields?.["予約日時"] ?? null,
      })) ?? []
    : [];
  console.log(`[t1] 既存行（同日件数の分母）: ${existing.length} 件` +
    (EXISTING_PATH ? "" : "  ※ --existing 未指定＝g6/g11 は今回分のみで判定される"));

  // ── 候補抽出 ─────────────────────────────────────────
  const raw = [];
  for (let p = 0; p < PAGES; p++) {
    raw.push(...(await fetchPage(1 + p * HITS)));
    await sleep(120);
  }
  console.log(`[t1] FANZA から ${raw.length} 件取得（floor=${FLOOR} / sort=rank / ${PAGES}ページ）`);

  const skipped = {};
  const pool = [];
  for (const it of raw) {
    const r = toCandidate(it);
    if (r.skip) { skipped[r.skip.replace(/:.*$/, "")] = (skipped[r.skip.replace(/:.*$/, "")] ?? 0) + 1; continue; }
    // g12 の先取り（掲出日基準で判定するため、最初のスロットを暫定基準にする）
    const ref = SLOTS[0] ? SLOTS[0].slice(0, 10) : todayJst;
    if (r.c.actressNames.some((n) => hasPostedActress([n], ref, ACTRESS_EXCLUDE_DAYS))) {
      skipped[`${ACTRESS_EXCLUDE_DAYS}日以内に登場済みの女優`] =
        (skipped[`${ACTRESS_EXCLUDE_DAYS}日以内に登場済みの女優`] ?? 0) + 1;
      continue;
    }
    pool.push(r.c);
  }
  console.log("[t1] 候補プール:", pool.length, "件");
  for (const [k, v] of Object.entries(skipped).sort((a, b) => b[1] - a[1])) {
    console.log(`[t1]   除外 ${v} 件 … ${k}`);
  }

  // ── 原稿生成 ─────────────────────────────────────────
  // **1スロット1件。同一女優が同一バッチ内で重複しないようにする**（g12 は既存分しか見ない）。
  const usedActresses = new Set();
  const recentIds = [...RECENT];
  const posts = [];
  for (let i = 0; i < SLOTS.length; i++) {
    const jst = SLOTS[i];
    const scheduledUtc = jstToUtcIso(jst);
    if (!scheduledUtc) { console.error(`[t1] --slots の書式が不正: ${jst}（"YYYY-MM-DD HH:mm"）`); process.exit(1); }

    const c = pool.find((x) => !x._used && !x.actressNames.some((n) => usedActresses.has(n)));
    if (!c) { console.error(`[t1] スロット ${jst} に割り当てられる候補が尽きた`); break; }
    c._used = true;
    c.actressNames.forEach((n) => usedActresses.add(n));

    const tpl = pickTemplate(c, recentIds);
    recentIds.push(tpl);
    posts.push({
      id: `${ID_PREFIX}-${String(START_SEQ + i).padStart(2, "0")}`,
      name: `${ID_PREFIX}-${String(START_SEQ + i).padStart(2, "0")} T1改 ${c.actress} ${c.hinban}`,
      kind: "T1",
      template: tpl,
      text: TEMPLATES[tpl].build(c),
      linkUrl: `https://app.vodnavi.jp/works/${c.floor}/${c.contentId}`,
      contentId: c.contentId,
      hinban: c.hinban,
      actressNames: c.actressNames,
      scheduledUtc,          // ★ ガード評価のための想定枠。書き込む値ではない
      intendedJst: jst,
      referenceJstDate: todayJst,
      status: STOCK_STATUS,  // ★ モジュールの定数のみ。ここで文字列を書かない
    });
  }

  // ── ガード17件 ───────────────────────────────────────
  const { pass, failures } = await runGuardsAsync(posts, existing);

  console.log("\n──────── 生成した原稿 ────────");
  for (const p of posts) {
    console.log(`\n【${p.name}】 テンプレート=${p.template} / 重み=${weightedLength(postedText(p))}/280`);
    console.log(`  想定枠(ガード評価用): ${p.intendedJst} JST = ${p.scheduledUtc}`);
    console.log(`  リンクURL: ${p.linkUrl}`);
    console.log(`  ステータス: ${p.status}`);
    console.log("  --- 投稿文 ---");
    console.log(p.text.split("\n").map((l) => `  ${l}`).join("\n"));
  }

  console.log("\n──────── ガード17件 ────────");
  if (pass) {
    console.log(`全 ${posts.length} 件が PASS。`);
  } else {
    console.log(`FAIL ${failures.length} 件:`);
    for (const f of failures) console.log(`  ✗ ${f.post} / ${f.guard}: ${f.ng}`);
  }

  if (JSON_OUT) {
    writeFileSync(JSON_OUT, JSON.stringify({ generatedAtJst: todayJst, pass, failures, posts }, null, 2));
    console.log(`\nJSON を書き出した: ${JSON_OUT}`);
  }

  console.log(
    "\n【書き込みは行っていない】AIRTABLE_PAT は未発行（HUMAN 枠）。" +
    `書き込みは MCP 経由で ステータス=${STOCK_STATUS} 固定 + 読み戻し検算（§10）で行うこと。` +
    "\n【予約日時は設定しない】--slots はガード評価のための想定枠であって書き込む値ではない。" +
    "承認・予約日時の設定の直前に、ガードをもう一度走らせること。",
  );
  if (!pass) process.exit(2);
}

main().catch((e) => { console.error("[t1] 失敗:", e); process.exit(1); });
