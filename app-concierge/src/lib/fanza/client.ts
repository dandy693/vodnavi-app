import type {
  DmmArticle,
  DmmItem,
  DmmItemListResponse,
  DmmSite,
  DmmSort,
} from "./types";

const BASE_URL = "https://api.dmm.com/affiliate/v3";

export class FanzaConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FanzaConfigError";
  }
}

export class FanzaApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "FanzaApiError";
  }
}

export interface ItemListParams {
  site?: DmmSite;
  service?: string;
  floor?: string;
  hits?: number;
  offset?: number;
  sort?: DmmSort;
  keyword?: string;
  cid?: string;
  article?: DmmArticle;
  article_id?: string;
  gte_date?: string;
  lte_date?: string;
  mono_stock?: "stock" | "reserve" | "reserve_empty" | "mono_lottery";
}

interface FetchOptions {
  revalidate?: number;
  signal?: AbortSignal;
  /**
   * 画像 URL の到達可能性検証をスキップする。
   * 詳細ページ（cid 指定）など、画像が壊れていても作品自体は表示したい用途で true にする。
   * 未指定の場合は cid 指定なら自動的にスキップする。
   */
  skipImageValidation?: boolean;
  /** HEAD 検証のタイムアウト（既定 2000ms） */
  imageValidationTimeoutMs?: number;
}

function getCredentials(): { apiId: string; affiliateId: string } {
  const apiId = process.env.DMM_API_ID;
  const affiliateId = process.env.DMM_AFFILIATE_ID;

  if (!apiId || !affiliateId) {
    throw new FanzaConfigError(
      "DMM_API_ID と DMM_AFFILIATE_ID を .env.local に設定してください。",
    );
  }
  return { apiId, affiliateId };
}

export async function fetchItemList(
  params: ItemListParams = {},
  options: FetchOptions = {},
): Promise<DmmItemListResponse> {
  const { apiId, affiliateId } = getCredentials();

  const url = new URL(`${BASE_URL}/ItemList`);
  url.searchParams.set("api_id", apiId);
  url.searchParams.set("affiliate_id", affiliateId);
  url.searchParams.set("site", params.site ?? "FANZA");
  url.searchParams.set("output", "json");

  for (const [key, value] of Object.entries(params)) {
    if (key === "site" || value == null || value === "") continue;
    url.searchParams.set(key, String(value));
  }

  // 一時: フィルタ動作を本番で観測するためキャッシュ無効化。
  // 動作確認後は { next: { revalidate: options.revalidate ?? 300 } } に戻す。
  const res = await fetch(url, {
    cache: "no-store",
    signal: options.signal,
  });

  if (!res.ok) {
    throw new FanzaApiError(
      `FANZA API request failed: ${res.status} ${res.statusText}`,
      res.status,
    );
  }

  const data = (await res.json()) as DmmItemListResponse;

  if (data.result?.status && data.result.status >= 400) {
    throw new FanzaApiError(
      `FANZA API returned error status ${data.result.status}`,
      data.result.status,
    );
  }

  // 画像の生存確認フィルタ。
  // - 詳細ページ (cid 指定) のように単体取得時は破棄しないので既定でスキップ。
  // - hits=1 のみ取得時もスキップ（取りこぼし防止）。
  // - skipImageValidation が明示されていればそれを最優先。
  const isSingleItemLookup = !!params.cid || params.hits === 1;
  const shouldFilter = options.skipImageValidation === undefined
    ? !isSingleItemLookup
    : !options.skipImageValidation;

  if (shouldFilter && data.result?.items?.length) {
    const filtered = await filterItemsByImage(data.result.items, {
      timeoutMs: options.imageValidationTimeoutMs,
    });
    return {
      ...data,
      result: {
        ...data.result,
        items: filtered,
        result_count: filtered.length,
      },
    };
  }

  return data;
}

/**
 * プレースホルダ画像（「NOW PRINTING」等）の URL パターン。
 * これらは HEAD で 200 を返してしまうため URL 文字列で弾く必要がある。
 */
const PLACEHOLDER_IMAGE_PATTERNS = [
  "now_printing",
  "n_printing",
  "no_image",
] as const;

/**
 * 画像 URL が FANZA のプレースホルダ（NOW PRINTING など）かを判定する。
 * 大文字小文字を無視して部分一致。
 */
export function isPlaceholderImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return PLACEHOLDER_IMAGE_PATTERNS.some((p) => lower.includes(p));
}

/**
 * プレースホルダ画像と判定する Content-Length 閾値（バイト）。
 * NOW PRINTING 画像は通常 10KB 未満で、正規のパッケージ画像は数十 KB 以上。
 * 15KB を境界にすることで誤検出を避けつつプレースホルダを確実に弾く。
 */
const PLACEHOLDER_SIZE_THRESHOLD = 15_000;

/**
 * 画像が「存在しない」「プレースホルダ」「アクセス不能」な作品を除外する共通フィルタ。
 * ① pickImage が null を返すもの（imageURL 自体欠落）を除外
 * ② URL に NOW PRINTING 等のプレースホルダパターンを含むものを除外
 * ③ 残りに対し並列 HEAD で 200 応答かつ Content-Length が閾値以上のみ通す
 *
 * 各段階のドロップ件数を console.log で出力する（タグ: [fanza-filter]）。
 */
export async function filterItemsByImage(
  items: DmmItem[],
  options: { timeoutMs?: number } = {},
): Promise<DmmItem[]> {
  const total = items.length;
  const startedAt = Date.now();

  // ① URL 欠落の即時除外（軽量、ネットワーク不要）
  const withUrl = items
    .map((item) => ({ item, url: pickImage(item.imageURL) }))
    .filter((entry): entry is { item: DmmItem; url: string } => !!entry.url);
  const droppedNoUrl = total - withUrl.length;

  // ② URL パターンによる除外（NOW PRINTING 等）
  const passPattern = withUrl.filter((e) => !isPlaceholderImageUrl(e.url));
  const droppedByPattern = withUrl.length - passPattern.length;

  // ③ HEAD 到達確認 + Content-Length サイズ判定
  const { reachable, droppedBySize, droppedByHead, droppedSamples } =
    await probeImageUrls(passPattern.map((e) => e.url), options.timeoutMs);
  const survived = passPattern.filter((e) => reachable.has(e.url));

  // console.info を使用: Vercel の Function Logs で確実に拾える。
  console.info(
    `[fanza-filter] in=${total} no_url=${droppedNoUrl} dropped_by_pattern=${droppedByPattern} dropped_by_size=${droppedBySize} head_fail=${droppedByHead} out=${survived.length} took_ms=${Date.now() - startedAt} threshold=${PLACEHOLDER_SIZE_THRESHOLD}`,
  );
  // サイズで弾いたサンプルを 5 件まで出力（プレースホルダ検出の物証）。
  if (droppedSamples.length) {
    console.info(
      `[fanza-filter] dropped_by_size_samples=${JSON.stringify(droppedSamples.slice(0, 5))}`,
    );
  }

  return survived.map((e) => e.item);
}

export function formatPrice(price: string | undefined | null): string | null {
  if (!price) return null;
  const cleaned = price.replace(/[^\d~〜]/g, "");
  if (!cleaned) return price;
  return `¥${cleaned}`;
}

export function isNewItem(dateStr: string | undefined, daysWindow = 14): boolean {
  if (!dateStr) return false;
  const itemTime = new Date(dateStr.replace(" ", "T")).getTime();
  if (Number.isNaN(itemTime)) return false;
  const threshold = Date.now() - daysWindow * 24 * 60 * 60 * 1000;
  return itemTime >= threshold;
}

export function pickImage(
  imageURL: { list?: string; small?: string; large?: string } | undefined,
): string | null {
  if (!imageURL) return null;
  return imageURL.large ?? imageURL.list ?? imageURL.small ?? null;
}

interface ProbeResult {
  /** 200 応答かつ Content-Length が閾値以上の URL */
  reachable: Set<string>;
  /** 200 応答だが Content-Length が閾値未満・取得不能・0 で弾いた件数 */
  droppedBySize: number;
  /** HEAD が非 200 / タイムアウト / ネットワークエラーで弾いた件数 */
  droppedByHead: number;
  /** サイズ判定で除外された URL とそのバイト数のサンプル（ログ可視化用） */
  droppedSamples: Array<{ url: string; len: number | null }>;
}

/**
 * 与えられた画像 URL 群に対し HEAD で並列存在確認を行う。
 * - 非 200, タイムアウト, ネットワークエラーは droppedByHead としてカウント
 * - 200 でも Content-Length が PLACEHOLDER_SIZE_THRESHOLD 未満 / 取得不能 / 0 は droppedBySize としてカウント
 * - 上記のいずれにも該当しないものを reachable Set に入れる
 */
async function probeImageUrls(
  urls: string[],
  timeoutMs = 2000,
): Promise<ProbeResult> {
  const unique = Array.from(new Set(urls.filter(Boolean)));
  const reachable = new Set<string>();
  const droppedSamples: Array<{ url: string; len: number | null }> = [];
  let droppedBySize = 0;
  let droppedByHead = 0;
  await Promise.all(
    unique.map(async (url) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        // cache: no-store: HEAD 結果もキャッシュさせない（プレースホルダ画像は後で本物に差し変わる
        // ことがあるため、Next.js のキャッシュに「不到達」を保存しない）。
        const res = await fetch(url, {
          method: "HEAD",
          cache: "no-store",
          signal: controller.signal,
        });
        if (!res.ok) {
          droppedByHead++;
          return;
        }
        const lenHeader = res.headers.get("content-length");
        const size = lenHeader ? Number.parseInt(lenHeader, 10) : NaN;
        // Content-Length 未取得・0・閾値未満は NOW PRINTING 等のプレースホルダ扱い。
        if (!Number.isFinite(size) || size < PLACEHOLDER_SIZE_THRESHOLD) {
          droppedBySize++;
          droppedSamples.push({
            url,
            len: Number.isFinite(size) ? size : null,
          });
          return;
        }
        reachable.add(url);
      } catch {
        droppedByHead++;
      } finally {
        clearTimeout(timer);
      }
    }),
  );
  return { reachable, droppedBySize, droppedByHead, droppedSamples };
}

export function joinNames(
  list: { name: string }[] | undefined,
  max = 3,
): string {
  if (!list || list.length === 0) return "";
  return list
    .slice(0, max)
    .map((entry) => entry.name)
    .join(" / ");
}
