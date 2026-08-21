/**
 * セール価格のスナップショット取得（CTO ローカルバッチ・**ランタイムでは使わない**）。
 *
 * 【なぜ取るか】価格は時系列であり、**取り逃した日は永久に復元できない**。
 * 競合の価格追跡ツール（FANZA価格検索 / Fanza Analyzer）は価格履歴を持つが、
 * 当サイトは `sitemap_cohort.price` に投入時点の1点しか持たない
 * （`FACT_GOVERNANCE` §5-4 (6)）。**まず取り始める**ことだけを目的とする。
 *
 * 【面からは参照しない】出力は `management/_metrics/price-history/` に置く。
 * `/sale` はこのファイルを読まない。「最安値」表示は現時点の資産では成立しないため
 * （履歴の蓄積量が足りない）。DB 化するかは裁定事項で、本スクリプトは決めない。
 *
 * 【方式＝keyword 悉皆】ランタイムの `/sale`（rank 走査・上位のみ）と違い、
 * こちらは**全件を取る**のが目的なので keyword 方式を使う。
 * 名称は先に rank 走査で発見するため、**定数として持たない**
 * （名称を固定すると、変わったときに 0件で正常終了する＝静かな失敗）。
 *
 * 【af_id】API 呼び出しの認証は `DMM_AFFILIATE_ID`（990 系）。
 * 人間導線の href 用 `NEXT_PUBLIC_FANZA_AFFILIATE_ID`（004）とは用途が別で、
 * 本スクリプトは href を生成しない。
 *
 * 実行: node --env-file=.env.local scripts/snapshot-sale-prices.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const API_ID = process.env.DMM_API_ID;
const AFFILIATE_ID = process.env.DMM_AFFILIATE_ID;
if (!API_ID || !AFFILIATE_ID) {
  console.error("DMM_API_ID / DMM_AFFILIATE_ID が未設定（.env.local を読ませること）");
  process.exit(1);
}

const FLOORS = ["videoa", "anime", "nikkatsu", "videoc"];
/** 名称発見の走査。第92便の実測では offset=1 のみだと 30%OFF を取りこぼした。 */
const DISCOVERY_OFFSETS = [1, 101, 201, 301, 401, 501, 1001, 2001];
const OUT_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "management",
  "_metrics",
  "price-history",
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const yen = (s) => {
  const d = String(s ?? "").replace(/[^\d]/g, "");
  if (!d) return null;
  const n = Number.parseInt(d, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
};

let calls = 0;
async function itemList(params) {
  const q = new URLSearchParams({
    api_id: API_ID,
    affiliate_id: AFFILIATE_ID,
    site: "FANZA",
    service: "digital",
    output: "json",
    ...params,
  });
  const res = await fetch(`https://api.dmm.com/affiliate/v3/ItemList?${q}`);
  calls++;
  await sleep(130);
  const json = await res.json();
  return json?.result?.items ?? [];
}

/** キャンペーン名を発見する。**定数で持たない。** */
async function discoverCampaignNames() {
  const names = new Set();
  for (const floor of FLOORS) {
    for (const offset of DISCOVERY_OFFSETS) {
      const items = await itemList({
        floor,
        sort: "rank",
        hits: "100",
        offset: String(offset),
      });
      for (const it of items) {
        for (const c of it.campaign ?? []) if (c?.title) names.add(c.title);
      }
    }
  }
  return [...names];
}

/** 発見した名称で悉皆取得する。 */
async function collectByName(names) {
  const rows = new Map();
  for (const name of names) {
    for (const floor of FLOORS) {
      for (let offset = 1; offset <= 1000; offset += 100) {
        const items = await itemList({
          floor,
          hits: "100",
          offset: String(offset),
          keyword: name,
        });
        for (const it of items) {
          if (!it.campaign?.[0]) continue;
          rows.set(it.content_id, {
            cid: it.content_id,
            floor,
            price: yen(it.prices?.price),
            list_price: yen(it.prices?.list_price),
            campaign: it.campaign[0].title,
            begin: it.campaign[0].date_begin,
            end: it.campaign[0].date_end,
            date: it.date ?? null,
          });
        }
        if (items.length < 100) break;
      }
    }
  }
  return [...rows.values()];
}

const nowJst = new Date(Date.now() + 9 * 3600e3);
const stamp = nowJst.toISOString().slice(0, 10).replace(/-/g, "");
const takenAt = nowJst.toISOString().replace("T", " ").slice(0, 19);

const names = await discoverCampaignNames();
console.error(`[snapshot] 発見したキャンペーン名 ${names.length} 件: ${names.join(" / ")}`);
if (names.length === 0) {
  // **0件で静かに成功させない。** セールが本当に無いのか、走査が届かなかったのかを
  // 呼び出し側が区別できるよう、非ゼロで終了する。
  console.error("[snapshot] キャンペーンを1件も発見できなかった。走査範囲か API の応答を確認すること。");
  process.exit(2);
}

const rows = await collectByName(names);
mkdirSync(OUT_DIR, { recursive: true });
const out = join(OUT_DIR, `snapshot-${stamp}.json`);
writeFileSync(
  out,
  JSON.stringify({
    taken_at_jst: takenAt,
    source: "DMM affiliate API v3 ItemList (rank discovery + keyword collection)",
    api_calls: calls,
    campaigns: names,
    count: rows.length,
    rows,
  }),
);
console.error(`[snapshot] ${rows.length} 件 / API ${calls} コール → ${out}`);
