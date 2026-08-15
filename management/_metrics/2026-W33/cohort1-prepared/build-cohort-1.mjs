/**
 * BRIEF_128 コホート1 — 抽出スクリプト【実装準備版・rev1】
 *
 *   CSO承認 2026-08-15（第59便）/ 準備 2026-08-16（第61便 タスクD-2）
 *
 * 【厳守】本スクリプトは 2026-08-21 かつ β/α の判定完了より前に実行しない。
 * 【厳守】本ファイルは現在 `management/_metrics/2026-W33/cohort1-prepared/` に置いてある。
 *         実装時に `app-concierge/scripts/build-cohort-1.mjs` へ移すこと。
 *         いま `app-concierge/` 配下に置かないのは、`ignoreCommand` が
 *         production ビルドを起こし、**null ガードの効果測定窓
 *         （2026-08-15 23:31 〜 2026-08-16 23:31）にデプロイを挟まないため**である
 *         （スクリプト自体はアプリから import されず挙動は不変だが、
 *           測定窓に不要な変更を入れない）。
 *
 * 仕様（BRIEF_128 rev7 §6-4）:
 *   - 対象期間  : lte_date = 2026-07-31T23:59:59（下限なし）
 *   - 対象フロア: videoa のみ（非収録率 videoa 98% / amateur 81% に対し
 *                 anime 0% / nikkatsu 0%）
 *   - 層化配分  : 〜399=1,500 / 400〜999=1,500 / 1,000〜1,999=800 /
 *                 2,000〜2,999=800 / 3,000〜=400  合計 5,000
 *   - API コール: 約50〜70回（帯境界の探索込みでも100未満の見込み）
 *
 * 出力: `status='staged'` の INSERT 文を **標準出力へ吐くだけ**。
 *       DB へは接続しない（`cohort_writer` の鍵はこのプロセスに渡さない）。
 *       § FACT_GOVERNANCE §12 の思想（スクリプトが検証してから INSERT する）に合わせ、
 *       生成物を人が確認してから適用する。
 *
 * 実行: node --env-file=.env.local build-cohort-1.mjs > cohort1.sql
 */

const API_ID = process.env.DMM_API_ID;
const AFFILIATE_ID = process.env.DMM_AFFILIATE_ID;
if (!API_ID || !AFFILIATE_ID) {
  console.error("DMM_API_ID / DMM_AFFILIATE_ID が未設定です");
  process.exit(1);
}

const LTE_DATE = "2026-07-31T23:59:59";
const FLOOR = "videoa";
const HITS = 100;
const COHORT_NO = 1;

/** 帯の定義（下限含む・上限含む）。抽出順とソート方向を持つ。 */
const BANDS = [
  { band: "3000+", min: 3000, max: Infinity, target: 400, sort: "price" },
  { band: "2000-2999", min: 2000, max: 2999, target: 800, sort: "price" },
  { band: "1000-1999", min: 1000, max: 1999, target: 800, sort: "price" },
  { band: "400-999", min: 400, max: 999, target: 1500, sort: "-price" },
  { band: "0-399", min: 0, max: 399, target: 1500, sort: "-price" },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** FANZA の price 文字列（"1,980円" 等）を数値へ。取れなければ null。 */
function parsePrice(item) {
  const raw =
    item?.prices?.price ?? item?.prices?.list_price ?? item?.price ?? null;
  if (!raw) return null;
  const n = Number.parseInt(String(raw).replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) ? n : null;
}

async function fetchPage(sort, offset) {
  const u =
    `https://api.dmm.com/affiliate/v3/ItemList?api_id=${API_ID}` +
    `&affiliate_id=${AFFILIATE_ID}&site=FANZA&service=digital&floor=${FLOOR}` +
    `&lte_date=${encodeURIComponent(LTE_DATE)}&sort=${sort}` +
    `&hits=${HITS}&offset=${offset}&output=json`;
  const res = await fetch(u);
  const json = await res.json();
  if (json?.result?.status && Number(json.result.status) >= 400) {
    throw new Error(`FANZA API status=${json.result.status}`);
  }
  return json?.result?.items ?? [];
}

/** 既に main / archive に収録済みの content_id（重複投入の回避）。 */
async function loadExistingIds() {
  const ids = new Set();
  for (const url of [
    "https://app.vodnavi.jp/sitemap.xml",
    "https://app.vodnavi.jp/sitemap-archive.xml",
  ]) {
    const xml = await (await fetch(url)).text();
    for (const m of xml.matchAll(/\/works\/\w+\/([^<]+)<\/loc>/g)) ids.add(m[1]);
  }
  return ids;
}

async function main() {
  const existing = await loadExistingIds();
  console.error(`[cohort1] 既収録 content_id: ${existing.size} 件`);

  const picked = new Map(); // content_id -> row
  let calls = 0;

  for (const b of BANDS) {
    let offset = 1;
    let got = 0;
    // 帯を外れた連続ページ数。帯を通り過ぎたら打ち切る。
    let consecutiveOut = 0;

    while (got < b.target && offset <= 50_000 && consecutiveOut < 3) {
      const items = await fetchPage(b.sort, offset);
      calls++;
      if (items.length === 0) break;

      let inBand = 0;
      for (const it of items) {
        const price = parsePrice(it);
        if (price === null) continue;
        if (price < b.min || price > b.max) continue;
        inBand++;
        const cid = it.content_id;
        // null ガード（第59便と同じ思想）と重複除外
        if (!cid || existing.has(cid) || picked.has(cid)) continue;
        picked.set(cid, {
          content_id: cid,
          cohort_no: COHORT_NO,
          floor_code: FLOOR,
          released_at: it.date ? it.date.replace(" ", "T") : null,
          price_band: b.band,
          price,
          has_large: !!it.imageURL?.large,
          actress_ids: (it.iteminfo?.actress ?? [])
            .map((a) => a?.id)
            .filter((x) => x != null),
        });
        got++;
        if (got >= b.target) break;
      }
      consecutiveOut = inBand === 0 ? consecutiveOut + 1 : 0;
      offset += HITS;
      await sleep(120);
    }
    console.error(`[cohort1] ${b.band}: ${got}/${b.target} 件（累計コール ${calls}）`);
  }

  const rows = [...picked.values()];
  console.error(`[cohort1] 合計 ${rows.length} 件 / API コール ${calls} 回`);

  // 標準出力へ INSERT 文を吐く（DB へは接続しない）
  console.log("-- BRIEF_128 コホート1 投入 SQL（自動生成・要人手確認）");
  console.log(`-- 生成件数: ${rows.length} / API コール: ${calls}`);
  console.log("begin;");
  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500);
    console.log(
      "insert into public.sitemap_cohort " +
        "(content_id, cohort_no, floor_code, released_at, price_band, price, has_large) values",
    );
    console.log(
      chunk
        .map(
          (r) =>
            `  ('${r.content_id}', ${r.cohort_no}, '${r.floor_code}', ` +
            `${r.released_at ? `'${r.released_at}'` : "null"}, '${r.price_band}', ` +
            `${r.price ?? "null"}, ${r.has_large})`,
        )
        .join(",\n") + "\non conflict (content_id) do nothing;",
    );
  }
  // 事後検算（§10 回避手順3）
  console.log(`do $$
declare v int;
begin
  select count(*) into v from public.sitemap_cohort where cohort_no = ${COHORT_NO};
  if v <> ${rows.length} then
    raise exception '検算失敗: 投入件数が % で期待 ${rows.length} と一致しない', v;
  end if;
  if exists (select 1 from public.sitemap_cohort where cohort_no = ${COHORT_NO} and status <> 'staged') then
    raise exception '検算失敗: status が staged でない行がある';
  end if;
  raise notice '検算OK: ${rows.length} 件が staged で投入された';
end $$;`);
  console.log("commit;");
}

main().catch((e) => {
  console.error("[cohort1] 失敗:", e);
  process.exit(1);
});
