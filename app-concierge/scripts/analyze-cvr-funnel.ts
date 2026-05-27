/**
 * Sprint 3 武器: CVR 自動パトロール — ファネル集計スケルトン。
 *
 * 目的:
 *   要塞化された 27 拠点 (CCO_TARGET_CIDS) に対し、Search Console / GA4 /
 *   DMM アフィリエイト売上レポートの 3 ソースを横断して「検索クリック →
 *   詳細ページ閲覧 → VODNAVI Review 描画 → アフィリ CTA クリック → 売上」
 *   の各遷移を **同じテーブル上で並べる**ためのデータ層を準備する。
 *
 * 現フェーズ (スケルトン):
 *   - データソース未投入。`loadFunnelMetrics()` は CCO_TARGET_CIDS から
 *     空指標を生成して返す（NaN や 0 でファイルが汚れないよう undefined で
 *     未計測を表現）。
 *   - 集計ロジック (`computeCvrs`) と整形ロジック (`renderMarkdownReport`)
 *     は本フェーズで完成させ、データ投入後すぐ可動状態にする。
 *
 * 将来フェーズ:
 *   1. SC: GSC CSV を `data/funnel-sources/sc-clicks.csv` に置けば
 *      `loadSearchConsoleClicks()` が読み出す。
 *   2. GA4: `data/funnel-sources/ga4-pageviews.csv` で page_path × pageviews
 *      / sessions / engagement_seconds を読む。`ai_affiliate_click` /
 *      `concierge_entry_click` の event_params 集計値も同 dir で受け取る。
 *   3. DMM: アフィリ管理画面 export を `data/funnel-sources/dmm-sales.csv`
 *      に置けば content_id × gross / commission を読む。
 *
 * 走らせ方:
 *   cd app-concierge
 *   node --experimental-strip-types --no-warnings scripts/analyze-cvr-funnel.ts
 *
 *   # 将来: 出力を markdown で _metrics に書き出す
 *   node --experimental-strip-types --no-warnings scripts/analyze-cvr-funnel.ts \
 *     > ../management/_metrics/cvr-funnel-$(date +%F).md
 *
 * 設計原則 (CTO 内部メモ):
 *   - 数値はすべて optional。「未計測 (undefined)」と「実測 0」を構造的に区別。
 *   - 派生 CVR は分母 0 / undefined のとき undefined を返す（誤って ∞ や
 *     NaN を出さない、レポートに「-」と表示することで「データ不足」を可視化）。
 *   - 出力は markdown 1 ファイル想定。GitHub Issues / PR に貼れる形に。
 */

import { CCO_TARGET_CIDS } from "./cco-target-cids.ts";

// ============================================================================
// データ構造（CSO 仕様: 「TypeScript インターフェースを厳格に定義」）
// ============================================================================

/**
 * 1 cid 分の生指標。すべて optional で「未計測」を構造的に表現する。
 * - SC: Search Console 自然検索流入
 * - GA4: Google Analytics 4 ページ・イベント
 * - DMM: アフィリエイト売上
 */
export interface FunnelMetricsRaw {
  /** FANZA content_id（CCO_TARGET_CIDS と一致）。集計の主キー。 */
  readonly contentId: string;

  // ---- Search Console（自然検索ファネル入口）---------------------------
  /** SC クリック数（自然検索 → /works/{floor}/{cid} 着地）。 */
  readonly scClicks?: number;
  /** SC 表示回数（検索結果に出た回数）。 */
  readonly scImpressions?: number;
  /** SC CTR（scClicks / scImpressions）。SC が直接提供する値を採用。 */
  readonly scCtr?: number;
  /** SC 平均掲載順位。 */
  readonly scAveragePosition?: number;

  // ---- GA4（詳細ページ閲覧・エンゲージメント）-------------------------
  /** /works/{cid} の screen_view 数。 */
  readonly ga4PageViews?: number;
  /** 同セッション数。 */
  readonly ga4Sessions?: number;
  /** 平均エンゲージメント時間（秒）。 */
  readonly ga4AvgEngagementSec?: number;

  // ---- GA4 イベント（中間 KPI）---------------------------------------
  /**
   * VODNAVI Review セクションが SSR 描画された描画到達数。
   * 将来的に `data-work-review-source` 属性へ Web Vitals 計測を載せて
   * `review_impression` イベントを emit する想定（現状未実装、undefined）。
   */
  readonly reviewImpressions?: number;
  /**
   * `product_click` event の placement=detail_main_cta 発火数。
   * FANZA メイン CTA への遷移コミット。
   */
  readonly ga4AffiliateClicks?: number;
  /**
   * `concierge_entry_click` event の source=app_direct 発火数。
   * 検索直接着地ユーザーがコンシェルジュへ回遊した数。
   */
  readonly ga4ConciergeClicks?: number;

  // ---- DMM 売上（ファネル終点）---------------------------------------
  /** DMM アフィリエイト管理画面の gross 売上（円）。 */
  readonly dmmGrossSales?: number;
  /** DMM 計上コミッション（円）。 */
  readonly dmmCommission?: number;
  /** DMM 計上件数。 */
  readonly dmmOrderCount?: number;
}

/**
 * 1 cid 分の派生 CVR 指標。分母 0 / undefined では結果を undefined にする
 * （誤って NaN / Infinity を出さない方針）。
 */
export interface FunnelCvrs {
  readonly contentId: string;

  /** scClicks → ga4PageViews 到達率。理論上 1.0 に近い（同一着地のため）。 */
  readonly scClickToPageView?: number;
  /** ga4PageViews → ga4AffiliateClicks 直通率（最重要 CVR）。 */
  readonly pageViewToAffiliate?: number;
  /** ga4PageViews → ga4ConciergeClicks 回遊率。 */
  readonly pageViewToConcierge?: number;
  /** ga4AffiliateClicks → dmmOrderCount 売上化率（FANZA 側 CVR）。 */
  readonly affiliateToOrder?: number;
  /** scClicks → dmmCommission 単価（円 / SC クリック）。 */
  readonly scClickToCommissionYen?: number;
}

export interface FunnelReportRow {
  readonly raw: FunnelMetricsRaw;
  readonly cvrs: FunnelCvrs;
}

export type FunnelReport = ReadonlyArray<FunnelReportRow>;

// ============================================================================
// データロード（現フェーズはスケルトン、CSV 投入で本動作）
// ============================================================================

/**
 * 各データソースが投入された際に CCO_TARGET_CIDS を主キーで突合する組合せ。
 * 現フェーズでは生指標を空で返し、テーブル上に「-」を並べる土台だけ用意する。
 */
function loadFunnelMetrics(): ReadonlyArray<FunnelMetricsRaw> {
  return CCO_TARGET_CIDS.map((t) => ({
    contentId: t.contentId,
    // cco-target-cids.ts に既に SC 監査値が入っていればその時点で採用。
    // 0 (未計測プロキシ) は SC source 投入時に上書きされる。
    scClicks: t.scClicks > 0 ? t.scClicks : undefined,
    scImpressions: t.scImpressions > 0 ? t.scImpressions : undefined,
    // 他のフィールドは今フェーズでは undefined のまま (CSV ロードで埋める)
  }));
}

// ============================================================================
// 派生計算
// ============================================================================

function safeRatio(num: number | undefined, denom: number | undefined): number | undefined {
  if (num == null || denom == null) return undefined;
  if (denom === 0) return undefined;
  return num / denom;
}

export function computeCvrs(raw: FunnelMetricsRaw): FunnelCvrs {
  return {
    contentId: raw.contentId,
    scClickToPageView: safeRatio(raw.ga4PageViews, raw.scClicks),
    pageViewToAffiliate: safeRatio(raw.ga4AffiliateClicks, raw.ga4PageViews),
    pageViewToConcierge: safeRatio(raw.ga4ConciergeClicks, raw.ga4PageViews),
    affiliateToOrder: safeRatio(raw.dmmOrderCount, raw.ga4AffiliateClicks),
    scClickToCommissionYen: safeRatio(raw.dmmCommission, raw.scClicks),
  };
}

// ============================================================================
// 出力（markdown table）
// ============================================================================

function fmtInt(n: number | undefined): string {
  return n == null ? "-" : Math.round(n).toLocaleString("en-US");
}

function fmtPct(r: number | undefined): string {
  return r == null ? "-" : `${(r * 100).toFixed(1)}%`;
}

function fmtYen(n: number | undefined): string {
  return n == null ? "-" : `¥${Math.round(n).toLocaleString("en-US")}`;
}

function renderMarkdownReport(report: FunnelReport): string {
  const lines: string[] = [];
  lines.push("# CVR Funnel — Canonical 27 cids");
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Source rows: ${report.length}`);
  lines.push("");
  lines.push(
    "| cid | sc_clicks | pv | aff_clicks | conc_clicks | orders | pv/aff CVR | aff/order CVR | ¥/sc_click |",
  );
  lines.push(
    "|---|---:|---:|---:|---:|---:|---:|---:|---:|",
  );
  for (const row of report) {
    const { raw, cvrs } = row;
    lines.push(
      `| \`${raw.contentId}\` | ${fmtInt(raw.scClicks)} | ${fmtInt(raw.ga4PageViews)} | ${fmtInt(raw.ga4AffiliateClicks)} | ${fmtInt(raw.ga4ConciergeClicks)} | ${fmtInt(raw.dmmOrderCount)} | ${fmtPct(cvrs.pageViewToAffiliate)} | ${fmtPct(cvrs.affiliateToOrder)} | ${fmtYen(cvrs.scClickToCommissionYen)} |`,
    );
  }
  return lines.join("\n");
}

// ============================================================================
// main
// ============================================================================

function main(): void {
  const raws = loadFunnelMetrics();
  const report: FunnelReport = raws.map((raw) => ({ raw, cvrs: computeCvrs(raw) }));
  const md = renderMarkdownReport(report);
  process.stdout.write(`${md}\n`);
}

main();
