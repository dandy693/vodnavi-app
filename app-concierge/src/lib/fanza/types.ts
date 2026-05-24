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
  code: string;
  label: string;
  service: string;
}

export const FANZA_FLOORS: FanzaFloor[] = [
  { code: "videoa", label: "動画", service: "digital" },
  { code: "videoc", label: "素人", service: "digital" }, // FANZA API 受理確認 (200 OK / 在庫0受領)
  { code: "anime", label: "アニメ", service: "digital" },
  { code: "nikkatsu", label: "成人映画", service: "digital" }, // FANZA API 受理確認 (200 OK / 30件取得)
];

export const FANZA_SORT_OPTIONS: { value: DmmSort; label: string }[] = [
  { value: "date", label: "新着順" },
  { value: "rank", label: "人気順" },
  { value: "review", label: "レビュー順" },
  { value: "-price", label: "価格が高い順" },
  { value: "price", label: "価格が安い順" },
];
