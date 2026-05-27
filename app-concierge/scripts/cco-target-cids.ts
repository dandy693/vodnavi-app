/**
 * CCO 自動レビュー注入の **物理監査ベース TOP 10 品番**。
 *
 * 出典: 2026-05-27 物理監査 (Chrome MCP) — Search Console
 * sc-domain:vodnavi.jp の「ページ」レポート (3 ヶ月)、上位 10 URL を
 * https://app.vodnavi.jp/works/videoa/ から接続。検索エンジンの直接着地
 * 流入が最も集中している = CVR を破壊的に引き上げる費用対効果が最も高い
 * セグメント。
 *
 * 注意:
 *   - フロア (floor) は本リスト時点で全件 `videoa` (FANZA Web 動画 一般)。
 *     新しい SC 監査で別フロアが出てきたら明示的に拡張する。
 *   - 順序は SC クリック数の降順。再生成バッチは先頭から走らせれば、
 *     最高優先度の品番から順次レビューが配備される。
 */

export type CcoTargetCid = {
  contentId: string;
  floor: "videoa";
  scClicks: number;
  scImpressions: number;
  /** 2026-05-27 監査時点で SC ランキング上に出ていた品番タイトルメモ。CCO への文脈ヒントに使う。 */
  knownTitleHint?: string;
};

export const CCO_TARGET_CIDS: ReadonlyArray<CcoTargetCid> = [
  { contentId: "gkok00002", floor: "videoa", scClicks: 81, scImpressions: 1105, knownTitleHint: "制服マ○コ拡張少女 鳥羽みもり" },
  { contentId: "snos00233", floor: "videoa", scClicks: 70, scImpressions: 1008 },
  { contentId: "savr00978", floor: "videoa", scClicks: 43, scImpressions: 934 },
  { contentId: "mkmp00726", floor: "videoa", scClicks: 28, scImpressions: 671 },
  { contentId: "dvmm00393", floor: "videoa", scClicks: 27, scImpressions: 511 },
  { contentId: "ofje00630", floor: "videoa", scClicks: 21, scImpressions: 158 },
  { contentId: "evis00624", floor: "videoa", scClicks: 18, scImpressions: 168 },
  { contentId: "gqhb00024", floor: "videoa", scClicks: 17, scImpressions: 400 },
  { contentId: "h_1724m794g00002", floor: "videoa", scClicks: 17, scImpressions: 364 },
  { contentId: "1asex00014", floor: "videoa", scClicks: 17, scImpressions: 128 },
] as const;
