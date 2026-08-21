/**
 * BRIEF_128 コホート1 — 抽出スクリプト【rev2・案C】
 *
 *   CSO承認 2026-08-15（第59便）/ 準備 2026-08-16（第61便 タスクD-2）
 *   rev2 2026-08-21（第81便・CSO裁定「案C を採用」）
 *
 * 【rev1 の欠陥と rev2 の修正】
 *   rev1 は **帯ごとに offset を1へリセット**し、`consecutiveOut < 3`
 *   （帯外が3ページ連続で打ち切り）を持っていた。
 *   実測（2026-08-21）: `sort=price` は**価格の高い順**（offset=1 で 11,000円 /
 *   offset=1001 でまだ 3,480円）、`sort=-price` は**安い順**（offset=1 で 60円 /
 *   offset=1501 でまだ 99円）。したがって中間帯（2000-2999 / 1000-1999 / 400-999）は
 *   走査開始位置から帯へ到達する前に3ページ連続で帯外となり、**即座に打ち切られていた**。
 *   結果は 1,900/5,000（3000+ 400 / 0-399 1,500 / 中間3帯 0）。
 *
 *   rev2（案C）: **走査方向ごとに単一パス**とし、取得した各アイテムを価格に応じて
 *   該当帯へ振り分ける。**帯ごとの offset リセットを廃止**する。価格順に連続するため、
 *   1回の走査で担当帯をすべてカバーできる。
 *     - `sort=price`（高い順）  … 3000+ / 2000-2999 / 1000-1999
 *     - `sort=-price`（安い順） … 0-399 / 400-999
 *   打ち切りは「そのパスの担当範囲を完全に通り過ぎた」ときのみ（価格順なので戻らない）。
 *
 * 仕様（BRIEF_128 rev7 §6-4）:
 *   - 対象期間  : lte_date = 2026-07-31T23:59:59（下限なし）
 *   - 対象フロア: videoa のみ
 *   - 層化配分  : 〜399=1,500 / 400〜999=1,500 / 1,000〜1,999=800 /
 *                 2,000〜2,999=800 / 3,000〜=400  合計 5,000
 *   - API コール: rev1 の見積りは「約50〜70回」。**rev2 は帯が充足した後も
 *                 次の帯へ到達するまで走査を続けるため、実測して報告する。**
 *
 * 出力: `status='staged'` の INSERT 文を **標準出力へ吐くだけ**。
 *       DB へは接続しない（`cohort_writer` の鍵はこのプロセスに渡さない）。
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
/** 暴走防止。到達したら警告して打ち切り、実測値として報告する。 */
const MAX_CALLS = 600;

/** 帯の定義（下限含む・上限含む）。 */
const BANDS = [
  { band: "3000+", min: 3000, max: Infinity, target: 400 },
  { band: "2000-2999", min: 2000, max: 2999, target: 800 },
  { band: "1000-1999", min: 1000, max: 1999, target: 800 },
  { band: "400-999", min: 400, max: 999, target: 1500 },
  { band: "0-399", min: 0, max: 399, target: 1500 },
];

/**
 * 走査パス。**帯ごとではなく走査方向ごとに1パス**（案C）。
 *   `beyond` … そのパスの担当範囲を通り過ぎたかの判定。価格順なので一度出たら戻らない。
 */
const PASSES = [
  {
    sort: "price", // 価格の高い順（2026-08-21 実測）
    label: "高い順",
    bands: ["3000+", "2000-2999", "1000-1999"],
    beyond: (price) => price < 1000,
  },
  {
    sort: "-price", // 価格の安い順（2026-08-21 実測）
    label: "安い順",
    bands: ["0-399", "400-999"],
    beyond: (price) => price > 999,
  },
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

  const byBand = new Map(BANDS.map((b) => [b.band, b]));
  const counts = Object.fromEntries(BANDS.map((b) => [b.band, 0]));
  /** 帯が充足した後に「その帯だから」という理由で捨てた件数（到達はしている証拠）。 */
  const overflow = Object.fromEntries(BANDS.map((b) => [b.band, 0]));
  const picked = new Map(); // content_id -> row
  let calls = 0;
  let capped = false;

  for (const p of PASSES) {
    const targets = p.bands.map((n) => byBand.get(n));
    const done = () => targets.every((b) => counts[b.band] >= b.target);
    let offset = 1;
    let beyondPages = 0;
    const t0 = Date.now();
    const callsAtStart = calls;

    while (!done() && offset <= 50_000) {
      if (calls >= MAX_CALLS) {
        capped = true;
        console.error(`[cohort1] ⚠ MAX_CALLS=${MAX_CALLS} に到達したため打ち切った`);
        break;
      }
      const items = await fetchPage(p.sort, offset);
      calls++;
      if (items.length === 0) break;

      let priced = 0;
      let beyond = 0;
      for (const it of items) {
        const price = parsePrice(it);
        if (price === null) continue;
        priced++;
        if (p.beyond(price)) {
          beyond++;
          continue;
        }
        const b = targets.find((x) => price >= x.min && price <= x.max);
        if (!b) continue;
        if (counts[b.band] >= b.target) {
          overflow[b.band]++; // 到達しているが帯は充足済み
          continue;
        }
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
        counts[b.band]++;
      }

      // ページ全件が担当範囲の外＝価格順なので以降も戻らない。2ページ連続で打ち切る。
      if (priced > 0 && beyond === priced) {
        beyondPages++;
        if (beyondPages >= 2) {
          console.error(`[cohort1] ${p.label}: 担当範囲を通過したため打ち切り（offset=${offset}）`);
          break;
        }
      } else {
        beyondPages = 0;
      }
      offset += HITS;
      await sleep(120);
    }

    const sec = ((Date.now() - t0) / 1000).toFixed(1);
    console.error(
      `[cohort1] パス「${p.label}」(${p.sort}): コール ${calls - callsAtStart} 回 / ${sec}秒 / ` +
        p.bands.map((n) => `${n}=${counts[n]}/${byBand.get(n).target}`).join(" "),
    );
  }

  const rows = [...picked.values()];
  console.error("[cohort1] ── 帯別の結果 ──");
  for (const b of BANDS) {
    const reached = counts[b.band] + overflow[b.band] > 0;
    const note =
      counts[b.band] >= b.target
        ? "充足"
        : reached
          ? `未充足（走査は到達している・充足後の破棄 ${overflow[b.band]} 件）`
          : "未充足（走査が到達していない／該当データが無い）";
    console.error(`[cohort1]   ${b.band}: ${counts[b.band]}/${b.target} … ${note}`);
  }
  console.error(
    `[cohort1] 合計 ${rows.length} 件 / API コール ${calls} 回${capped ? "（MAX_CALLS で打ち切り）" : ""}`,
  );

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
