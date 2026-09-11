import {
  buildCacheKey,
  persistStaleCandidate,
  readStaleCache,
  STALE_MAX_AGE_CID_S,
  STALE_MAX_AGE_LIST_S,
} from "./stale-cache";
import type {
  DmmArticle,
  DmmErrorResponse,
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

/**
 * BRIEF_057: サイレントデス（無音窒息）監視。
 * FANZA の設定不備 / API エラーを **本番のみ** 構造化 JSON で Vercel Logs に
 * 射出し、報酬ゼロのまま放置される事故を検知可能にする。throw 自体は維持する
 * ため上流の graceful-hide 挙動は不変（BRIEF_057 §2 / 例外を素通ししない）。
 */
function logFanzaSilentDeath(
  context: string,
  error: { message: string; status?: number },
): void {
  if (process.env.NODE_ENV !== "production") return;
  console.error(
    JSON.stringify({
      level: "high",
      tag: "VODNAVI_SILENT_DEATH_GUARD",
      context,
      status: error.status ?? null,
      message: error.message,
      ts: new Date().toISOString(),
    }),
  );
}

/**
 * DMM エラーレスポンスから **安全な説明文のみ** を抽出する。
 * `request.parameters`（api_id / affiliate_id を含む）は決して読まない＝秘密値を
 * ログ/エラーに露出させない。DMM の result.message / errors[].message のみを採り、
 * 300 文字で打ち切る。これで 400 の真因（不正な api_id / 不正パラメータ等）を
 * Vercel Logs から診断可能にする（T-20260609-07）。
 */
function extractDmmErrorDetail(body: unknown): string {
  try {
    const r = (body as DmmErrorResponse | undefined)?.result;
    if (!r) return "";
    const parts: string[] = [];
    if (r.message) parts.push(r.message);
    if (Array.isArray(r.errors)) {
      for (const e of r.errors) if (e?.message) parts.push(e.message);
    }
    return parts.join(" / ").slice(0, 300);
  } catch {
    return "";
  }
}

function getCredentials(): { apiId: string; affiliateId: string } {
  const apiId = process.env.DMM_API_ID;
  const affiliateId = process.env.DMM_AFFILIATE_ID;

  if (!apiId || !affiliateId) {
    const err = new FanzaConfigError(
      "DMM_API_ID と DMM_AFFILIATE_ID を .env.local に設定してください。",
    );
    logFanzaSilentDeath("getCredentials: DMM_API_ID/DMM_AFFILIATE_ID 未設定", err);
    throw err;
  }
  return { apiId, affiliateId };
}

/**
 * 画像検証フィルタを適用するかの判定。upstream 本体とキャッシュキー生成の両方で
 * 使う（判定ロジックのドリフト防止）。
 * - 詳細ページ (cid 指定) のように単体取得時は破棄しないので既定でスキップ。
 * - hits=1 のみ取得時もスキップ（取りこぼし防止）。
 * - skipImageValidation が明示されていればそれを最優先。
 */
function shouldFilterItems(
  params: ItemListParams,
  options: FetchOptions,
): boolean {
  const isSingleItemLookup = !!params.cid || params.hits === 1;
  return options.skipImageValidation === undefined
    ? !isSingleItemLookup
    : !options.skipImageValidation;
}

/**
 * R1-b①: fetchItemList の stale-serve ラッパ（設計書
 * r1b1-stale-serve-design-20260714.md / CSO裁定 2026-07-14）。
 * 呼び出し側 6 系統は無変更でこの経路を通る。
 *   - 正常時: 応答を Supabase へ write-through（fire-and-forget・失敗無視）
 *   - FanzaApiError / ネットワーク例外時: GUARD ログは upstream 内で発火済みのまま、
 *     鮮度上限内（一覧 48h / cid 7日）の stale があれば返却し
 *     VODNAVI_STALE_SERVED を射出。無ければ現行どおり throw。
 *   - FanzaConfigError（env 未設定）は設定事故のため stale で隠蔽しない。
 */
export async function fetchItemList(
  params: ItemListParams = {},
  options: FetchOptions = {},
): Promise<DmmItemListResponse> {
  const filtered = shouldFilterItems(params, options);
  const cacheKey = buildCacheKey(
    params as unknown as Record<string, unknown>,
    filtered,
  );
  const kind = params.cid ? ("cid" as const) : ("list" as const);

  try {
    const data = await fetchItemListUpstream(params, options);
    persistStaleCandidate(cacheKey, kind, data);
    return data;
  } catch (error) {
    if (error instanceof FanzaConfigError) throw error;

    const maxAgeS =
      kind === "cid" ? STALE_MAX_AGE_CID_S : STALE_MAX_AGE_LIST_S;
    const stale = await readStaleCache(cacheKey, maxAgeS);
    if (!stale) throw error;

    console.warn(
      JSON.stringify({
        level: "warn",
        tag: "VODNAVI_STALE_SERVED",
        kind,
        cache_key: cacheKey,
        age_s: stale.ageS,
        upstream_status:
          error instanceof FanzaApiError ? error.status : null,
        ts: new Date().toISOString(),
      }),
    );
    return stale.data;
  }
}

async function fetchItemListUpstream(
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

  const res = await fetch(url, {
    next: { revalidate: options.revalidate ?? 300 },
    signal: options.signal,
  });

  if (!res.ok) {
    // DMM のエラー本文から安全な説明のみ抽出（秘密値は読まない）。body 読取失敗時も status は保持。
    let detail = "";
    try {
      detail = extractDmmErrorDetail(await res.json());
    } catch {
      /* 生 body は echo しない（request.parameters の api_id 漏洩防止） */
    }
    const err = new FanzaApiError(
      `FANZA API request failed: ${res.status} ${res.statusText}${detail ? ` — ${detail}` : ""}`,
      res.status,
    );
    logFanzaSilentDeath("fetchItemList: HTTP エラー", err);
    throw err;
  }

  const data = (await res.json()) as DmmItemListResponse;

  if (data.result?.status && data.result.status >= 400) {
    const detail = extractDmmErrorDetail(data);
    const err = new FanzaApiError(
      `FANZA API returned error status ${data.result.status}${detail ? ` — ${detail}` : ""}`,
      data.result.status,
    );
    logFanzaSilentDeath("fetchItemList: result.status >= 400", err);
    throw err;
  }

  // `content_id` 欠落の除外（CSO裁定 2026-08-15・第59便／`null` ガード案②）。
  //
  // 404 の 32.0%（直近24時間で 33件）が `/works/anime/null` 等の `null` を含む
  // パスだった（第40便）。href の生成箇所は6つあり、いずれも値をそのまま
  // テンプレートへ埋めている。**発生源は特定できていない**（本番63面を走査して
  // `/null` の href は0件・`FACT_GOVERNANCE.md` §17 で「未特定のまま受容」）が、
  // **対処は発生源の特定を前提としない**。生成箇所6つに個別のガードを置くと
  // 将来の追加箇所で漏れるため、**全経路が通る本関数の1箇所**で除外する。
  //
  // 画像フィルタ（`shouldFilterItems`）とは独立に、**常に**適用する。
  // 単体取得（cid 指定）は画像フィルタをスキップするが、本ガードは通す。
  const rawItems = data.result?.items ?? [];
  const itemsWithId = rawItems.filter((item) => !!item.content_id);
  const droppedNoContentId = rawItems.length - itemsWithId.length;
  if (droppedNoContentId > 0) {
    // 実測では 1件も観測されていない（第44便: DB・型からも出ない）。
    // 出力されること自体が「実行時に null が来ている」ことの物証になる。
    console.info(
      `[fanza-filter] no_content_id=${droppedNoContentId} in=${rawItems.length} floor=${params.floor ?? "-"} article=${params.article ?? "-"}`,
    );
  }

  // 画像の生存確認フィルタ（判定基準は shouldFilterItems に集約）。
  const shouldFilter = shouldFilterItems(params, options);

  if (shouldFilter && itemsWithId.length) {
    const filtered = await filterItemsByImage(itemsWithId, {
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

  if (droppedNoContentId > 0) {
    return {
      ...data,
      result: {
        ...data.result,
        items: itemsWithId,
        result_count: itemsWithId.length,
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
 * 画像の種別。`pickImage` が `large ?? list ?? small` の順で選ぶため、
 * 実際に採用された種別によって正常なサイズ帯がまったく異なる。
 */
export type FanzaImageKind = "large" | "list" | "small";

/**
 * プレースホルダ画像と判定する Content-Length 閾値（バイト・**種別ごと**）。
 *
 * 【2026-08-15 実測 n=100×3フロア=300作品・CSO裁定 第59便】旧コメントの
 * 「NOW PRINTING 画像は通常 10KB 未満」は **配信元によって当たり外れがある**:
 *   - `pics.dmm.co.jp/.../now_printing.jpg` = **2,732 バイト**（10KB 未満＝旧コメントどおり）
 *   - `imgsrc.dmm.com/.../now_printing.jpg?w=800&h=800` = **19,378 バイト**（10KB を大きく超える）
 * 未発売作品の `pl.jpg` は **302 で後者へ転送される**ため、
 * **サイズ判定だけでは弾けない**。名前による判定（`isPlaceholderImageUrl` を
 * リダイレクト先へ再適用）と併用して初めて機能する。
 *
 * 各種別の正常サイズ帯（2026-08-15 実測）:
 *   - large : 63,597 〜 233,645（n=277）→ 15,000 は下限の 1/4 で余裕がある
 *   - list  : 3,533 〜 8,622（n=289）→ pics 側プレースホルダ 2,732 との間に 3,000 を置く
 *   - small : 6,921 〜 20,189（n=289）→ **imgsrc 側 19,378 が正常帯の内側にあり
 *             サイズでは原理的に分離できない**。よって閾値を設定せず
 *             名前判定（C-③）のみで対応する。`list` 欠落は 0/300 のため
 *             `small` が採用される経路は実測で観測されていない。
 */
const PLACEHOLDER_SIZE_THRESHOLD_BY_KIND: Record<
  FanzaImageKind,
  number | null
> = {
  large: 15_000,
  list: 3_000,
  small: null, // サイズ判定を行わない（上記のとおり分離不能）
};

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
    .map((item) => ({
      item,
      url: pickImage(item.imageURL),
      kind: pickImageKind(item.imageURL),
    }))
    .filter(
      (entry): entry is { item: DmmItem; url: string; kind: FanzaImageKind } =>
        !!entry.url && !!entry.kind,
    );
  const droppedNoUrl = total - withUrl.length;

  // ② URL パターンによる除外（NOW PRINTING 等）
  const passPattern = withUrl.filter((e) => !isPlaceholderImageUrl(e.url));
  const droppedByPattern = withUrl.length - passPattern.length;

  // ③ HEAD 到達確認 + 種別別の Content-Length サイズ判定 + リダイレクト先の名前判定
  const {
    reachable,
    droppedBySize,
    droppedByHead,
    droppedByPlaceholderRedirect,
    droppedSamples,
  } = await probeImageUrls(
    passPattern.map((e) => ({ url: e.url, kind: e.kind })),
    options.timeoutMs,
  );
  const survived = passPattern.filter((e) => reachable.has(e.url));

  // console.info を使用: Vercel の Function Logs で確実に拾える。
  console.info(
    `[fanza-filter] in=${total} no_url=${droppedNoUrl} dropped_by_pattern=${droppedByPattern} dropped_by_size=${droppedBySize} head_fail=${droppedByHead} redirect_placeholder=${droppedByPlaceholderRedirect} out=${survived.length} took_ms=${Date.now() - startedAt} threshold=large:${PLACEHOLDER_SIZE_THRESHOLD_BY_KIND.large}/list:${PLACEHOLDER_SIZE_THRESHOLD_BY_KIND.list}/small:none`,
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

/**
 * `pickImage` が **どの種別を採用したか** を返す（種別別の閾値判定に使う）。
 * 選択順は `pickImage` と同一でなければならない（両者を同時に変更すること）。
 */
export function pickImageKind(
  imageURL: { list?: string; small?: string; large?: string } | undefined,
): FanzaImageKind | null {
  if (!imageURL) return null;
  if (imageURL.large) return "large";
  if (imageURL.list) return "list";
  if (imageURL.small) return "small";
  return null;
}

interface ProbeResult {
  /** 200 応答かつ Content-Length が閾値以上の URL */
  reachable: Set<string>;
  /** 200 応答だが Content-Length が閾値未満・取得不能・0 で弾いた件数 */
  droppedBySize: number;
  /** HEAD が非 200 / タイムアウト / ネットワークエラーで弾いた件数 */
  droppedByHead: number;
  /** リダイレクト先が NOW PRINTING 等のプレースホルダだったため弾いた件数（C-③） */
  droppedByPlaceholderRedirect: number;
  /** サイズ判定で除外された URL とそのバイト数のサンプル（ログ可視化用） */
  droppedSamples: Array<{ url: string; len: number | null }>;
}

/**
 * 与えられた画像 URL 群に対し HEAD で並列存在確認を行う。
 * - **リダイレクト先がプレースホルダなら、ステータスに関わらず droppedByPlaceholderRedirect**
 *   （C-③: `Response.url` は追跡後の最終 URL。追加リクエストは発生しない）
 * - 非 200, タイムアウト, ネットワークエラーは droppedByHead としてカウント
 * - 200 でも Content-Length が **種別ごとの閾値** 未満 / 取得不能 / 0 は droppedBySize
 *   （`small` は閾値 null＝サイズ判定を行わない）
 * - 上記のいずれにも該当しないものを reachable Set に入れる
 */
async function probeImageUrls(
  targets: Array<{ url: string; kind: FanzaImageKind }>,
  timeoutMs = 2000,
): Promise<ProbeResult> {
  const seen = new Set<string>();
  const unique = targets.filter((t) => {
    if (!t.url || seen.has(t.url)) return false;
    seen.add(t.url);
    return true;
  });
  const reachable = new Set<string>();
  const droppedSamples: Array<{ url: string; len: number | null }> = [];
  let droppedBySize = 0;
  let droppedByHead = 0;
  let droppedByPlaceholderRedirect = 0;
  await Promise.all(
    unique.map(async ({ url, kind }) => {
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
        // C-③: リダイレクト先がプレースホルダなら、ステータスに関わらず除外する。
        // 未発売作品の pl.jpg は now_printing.jpg へ 302 され、その転送先は
        // HEAD を 405 で拒否する（=res.ok は false）。!res.ok より前に置かないと
        // head_fail に吸われて「NOW PRINTING で落ちた」ことが判別できなくなる。
        if (res.url && res.url !== url && isPlaceholderImageUrl(res.url)) {
          droppedByPlaceholderRedirect++;
          return;
        }
        if (!res.ok) {
          droppedByHead++;
          return;
        }
        const threshold = PLACEHOLDER_SIZE_THRESHOLD_BY_KIND[kind];
        if (threshold === null) {
          // small: サイズでは正常帯とプレースホルダを分離できないため判定しない。
          reachable.add(url);
          return;
        }
        const lenHeader = res.headers.get("content-length");
        const size = lenHeader ? Number.parseInt(lenHeader, 10) : NaN;
        // Content-Length 未取得・0・閾値未満は NOW PRINTING 等のプレースホルダ扱い。
        if (!Number.isFinite(size) || size < threshold) {
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
  return {
    reachable,
    droppedBySize,
    droppedByHead,
    droppedByPlaceholderRedirect,
    droppedSamples,
  };
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
