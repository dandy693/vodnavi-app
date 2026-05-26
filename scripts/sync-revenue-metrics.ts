/**
 * scripts/sync-revenue-metrics.ts — 日次報酬推移の自動同期 (PLACEHOLDER)
 *
 * AGENT_PROTOCOLS.md §週次データ駆動 PDCA ルーティン の延長として、
 * Saturday Review で手集計している報酬データを日次で Looker Studio /
 * Google Sheets に流し込めるよう、配置場所と契約 (contract) のみ先取りする。
 *
 * **本ファイルは雛形 (placeholder) であり、実装は段階的に行う。**
 * 現状の `process.exit(0)` で no-op として安全に走り終わる。
 *
 * 走らせ方:
 *   node --experimental-strip-types scripts/sync-revenue-metrics.ts            # 既定: dry-run
 *   node --experimental-strip-types scripts/sync-revenue-metrics.ts --push     # シート/Looker への push を有効化 (未実装)
 *
 * 想定する取り込みソース (フェーズ毎):
 *   - フェーズ 1: FANZA Affiliate Reporting (HTML スクレイプ or CSV エクスポート)
 *     - 既存 reference: [[reference_google_accounts]] (moterist.com@gmail.com / authuser=2)
 *   - フェーズ 2: GA4 Data API の `ai_affiliate_click` event count とクロス集計
 *     - 既存 reference: scripts/pull-ga4.ts (同 GA4 認証経路を流用)
 *   - フェーズ 3: 他 ASP (DMM TV / U-NEXT 等) 解放時の asp_name 別ファネル分割
 *     - 既存 reference: [[project_gtm_n6zdk9lr_is_fake]] (asp_name custom dimension は登録済)
 *
 * 想定する出力 sink:
 *   - Google Sheets API v4 push: spreadsheet_id を env で受ける、サービスアカウント JWT
 *   - Looker Studio: Sheets を datasource にすればコネクタ追加不要 (推奨)
 *   - JSON snapshot を management/_metrics/<YYYY-WW>/revenue-<YYYY-MM-DD>.json に保存
 *     (pull-ga4.ts と同形式、Saturday Review の手集計と diff 可能)
 *
 * 出力スキーマ (フェーズ 1 想定):
 *   {
 *     date: "2026-05-26",
 *     totals: { gross_jpy: number, click_count: number, conversion_count: number },
 *     by_asp: { fanza: { gross_jpy, clicks, conversions } },
 *     by_source: { moterist: {...}, brand: {...}, default: {...}, app_detail: {...} },
 *     by_floor: { videoa: {...}, vr: {...}, anime: {...} }
 *   }
 *
 * 関連監査メモ:
 *   - source=moterist のファネル疎通は ops/verify-concierge-sources で 18 assertion PASS 済
 *   - CCO 側 article.md の CTA URL 健全性は scripts/verify-cco-cta-urls.mjs で監視中
 *   - 本スクリプトは「ファネル下流 (報酬発生時点) の数字」を引き上げる役割
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

// ---------- 型定義 (contract) ----------

export interface RevenueDailySnapshot {
  /** ISO 日付 (YYYY-MM-DD)。集計対象日 (JST)。 */
  date: string;
  /** 全 ASP・全流入元の合算。 */
  totals: {
    gross_jpy: number;
    click_count: number;
    conversion_count: number;
  };
  /** ASP 別内訳。フェーズ 1 は "fanza" のみ。 */
  by_asp: Record<string, RevenueBucket>;
  /** 流入元 (ConciergeSource) 別内訳。 */
  by_source: Record<string, RevenueBucket>;
  /** FANZA floor 別内訳 (videoa / vr / anime / ...)。 */
  by_floor: Record<string, RevenueBucket>;
}

export interface RevenueBucket {
  gross_jpy: number;
  clicks: number;
  conversions: number;
}

// ---------- main ----------

const SELF = fileURLToPath(import.meta.url);
const REPO_ROOT = resolve(SELF, "..", "..");
const METRICS_DIR = resolve(REPO_ROOT, "management", "_metrics");

const args = new Set(process.argv.slice(2));
const PUSH = args.has("--push");

async function main(): Promise<void> {
  console.log("[sync-revenue-metrics] start");
  console.log(`  mode=${PUSH ? "push" : "dry-run"} (実装は段階的に追加予定)`);

  // TODO(phase-1): FANZA Affiliate Reporting からの取得 or CSV 取り込み
  // TODO(phase-2): GA4 Data API で ai_affiliate_click / product_click のクロス集計
  // TODO(phase-3): Google Sheets / Looker Studio への push

  // 安全な no-op: スキーマ contract を holderingしただけで終わる。
  // 上流の cron / GitHub Actions がこのスクリプトを叩いても副作用ゼロ。
  void METRICS_DIR;
  void mkdir;
  void writeFile;
  void dirname;

  console.log("[sync-revenue-metrics] placeholder — no data fetched, no sink pushed");
  console.log("  next steps: 認証経路の整備後、phase-1 (FANZA 取り込み) から実装");
}

main().catch((err: unknown) => {
  console.error("[sync-revenue-metrics] failed:", err);
  process.exit(1);
});
