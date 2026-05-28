/**
 * DMM/FANZA 商品情報API v3.0 の型定義
 * https://affiliate.dmm.com/api/v3/itemlist.html
 */

export type DmmSite = "DMM.com" | "FANZA";

export type DmmSort =
  | "rank"
  | "price"
  | "-price"
  | "date"
  | "-date"
  | "review"
  | "match";

export type DmmArticle =
  | "actress"
  | "author"
  | "genre"
  | "series"
  | "maker";

export interface DmmImageURL {
  list?: string;
  small?: string;
  large?: string;
}

export interface DmmSampleImageGroup {
  image?: string[];
}

export interface DmmSampleImageURL {
  sample_s?: DmmSampleImageGroup;
  sample_l?: DmmSampleImageGroup;
}

export interface DmmSampleMovieURL {
  size_476_306?: string;
  size_560_360?: string;
  size_644_414?: string;
  size_720_480?: string;
  pc_flag?: number;
  sp_flag?: number;
}

export interface DmmDelivery {
  type: string;
  price: string;
  list_price?: string;
}

export interface DmmPrices {
  price?: string;
  list_price?: string;
  deliveries?: {
    delivery: DmmDelivery[];
  };
}

export interface DmmNamedId {
  id: number;
  name: string;
  ruby?: string;
}

export interface DmmItemInfo {
  genre?: DmmNamedId[];
  series?: DmmNamedId[];
  maker?: DmmNamedId[];
  actress?: DmmNamedId[];
  actor?: DmmNamedId[];
  director?: DmmNamedId[];
  label?: DmmNamedId[];
  keyword?: DmmNamedId[];
  author?: DmmNamedId[];
}

export interface DmmReview {
  count: number;
  average: string;
}

export interface DmmCampaign {
  date_begin: string;
  date_end: string;
  title: string;
}

export interface DmmItem {
  service_code: string;
  service_name: string;
  floor_code: string;
  floor_name: string;
  category_name: string;
  content_id: string;
  product_id: string;
  title: string;
  volume?: string;
  number?: number;
  review?: DmmReview;
  URL: string;
  affiliateURL: string;
  imageURL?: DmmImageURL;
  sampleImageURL?: DmmSampleImageURL;
  sampleMovieURL?: DmmSampleMovieURL;
  prices?: DmmPrices;
  date?: string;
  iteminfo?: DmmItemInfo;
  campaign?: DmmCampaign[];
  isbn?: string;
  jancode?: string;
  maker_product?: string;
  stock?: string;
}

export interface DmmRequest {
  parameters: Record<string, string>;
}

export interface DmmItemListResult {
  status: number;
  result_count: number;
  total_count: number;
  first_position: number;
  items: DmmItem[];
}

export interface DmmItemListResponse {
  request: DmmRequest;
  result: DmmItemListResult;
}

export interface DmmErrorResponse {
  request: DmmRequest;
  result: {
    status: number;
    message?: string;
    errors?: { message: string }[];
  };
}

/**
 * FANZA フロア定義（よく使う動画系を中心に）
 * floor_code: API 用のフロアコード
 */
export interface FanzaFloor {
  code: string;       // URL・UI識別用
  label: string;      // UI表示用
  service: string;    // API送信用サービス
  apiFloor?: string;  // 【新規】指定時はFANZA APIのfloorパラメータとして上書き送信
  injectKeyword?: string; // 【新規】指定時は裏側で検索キーワードとして強制結合
}

export const FANZA_FLOORS: FanzaFloor[] = [
  { code: "videoa", label: "動画", service: "digital" },
  {
    code: "amateur",
    label: "素人",
    service: "digital",
    apiFloor: "videoa",
    injectKeyword: "素人",
  }, // 需要激高の「素人」を2番手にスピード配置
  { code: "anime", label: "アニメ", service: "digital" },
  { code: "nikkatsu", label: "成人映画", service: "digital" },
];

/**
 * 内部 URL の `/works/[floor]/[id]` セグメントを **必ず `FANZA_FLOORS.code`**
 * に正規化する。`item.floor_code` (FANZA API レスポンスの値) を URL に直接埋め
 * 込むと、ごく稀に FANZA_FLOORS の `code` リストに無い値 (廃止された floor の
 * 残骸、未対応の新フロア等) が混入し、詳細ページ (works/[floor]/[id]) で fall-
 * through → notFound() → 404 化する。GSC で 2026-05-28 に観測された 289 件の
 * 「見つかりませんでした (404)」の構造発生源を、UI 全域で同一ロジックで遮断
 * する。
 *
 * 一致基準:
 *   1. `FANZA_FLOORS.code` に完全一致 → そのまま返す
 *   2. `FANZA_FLOORS.apiFloor` に一致 → 対応する `code` を返す
 *      (例: API レスポンス `floor_code=videoa` を `amateur` UI に紐付けたい
 *       ケースは存在しないので 1 のパスで吸収される)
 *   3. それ以外 → `FANZA_FLOORS[0].code` (= "videoa") にフォールバック
 *      → 詳細ページ着地時に `apiFloor` 経由で再 fetch される
 */
export function normalizeFloorForUrl(floorCode: string | null | undefined): string {
  const fallback = FANZA_FLOORS[0].code;
  if (!floorCode) return fallback;
  const byCode = FANZA_FLOORS.find((f) => f.code === floorCode);
  if (byCode) return byCode.code;
  const byApi = FANZA_FLOORS.find((f) => f.apiFloor === floorCode);
  if (byApi) return byApi.code;
  return fallback;
}

export const FANZA_SORT_OPTIONS: { value: DmmSort; label: string }[] = [
  { value: "date", label: "新着順" },
  { value: "rank", label: "人気順" },
  { value: "review", label: "レビュー順" },
  { value: "-price", label: "価格が高い順" },
  { value: "price", label: "価格が安い順" },
];
