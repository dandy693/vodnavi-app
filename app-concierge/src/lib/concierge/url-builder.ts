/**
 * STRATEGY_BRIEF_003 PHASE 2 — アフィリエイト URL の抽象化ビルダ。
 *
 * 単一の作品詳細 URL だけでなく、404（配信終了）時のフォールバックとして
 * 「女優名 / 型番 / キーワードによる FANZA 内検索結果一覧 URL」を併せて発行する。
 * 多 ASP 解放（DMM TV / U-NEXT）を見据え、ASP ごとに振り分けられる構造に統一。
 *
 *   const { primaryUrl, fallbackUrl } = buildAffiliateURL({
 *     asp: "fanza",
 *     contentId: "abcd00123",
 *     actressOrSku: "西伽奈",
 *   });
 *
 * 環境変数:
 *   - DMM_AFFILIATE_ID            — サーバー側で使用（API 呼び出し時）
 *   - NEXT_PUBLIC_FANZA_AFFILIATE_ID — クライアントバンドル可（URL 直書き用）
 */

import { DEFAULT_ASP, safeAspName, type AspName } from "./asp";

export type { AspName } from "./asp";

export interface BuildAffiliateURLInput {
  /** 提案元 ASP。未指定または不明値はフェーズ 1 既定の `"fanza"`。 */
  asp?: AspName | string;
  /** FANZA の content_id（例: "abcd00123"）。詳細リンクの生成に使用。 */
  contentId: string;
  /** 出演女優名 / SKU / 型番。検索フォールバック URL の主入力。 */
  actressOrSku?: string | null;
  /** 補助キーワード列（actressOrSku が空の場合に結合して検索クエリへ）。 */
  keywords?: ReadonlyArray<string>;
  /**
   * Affiliate ID 上書き（テスト・SSR 経路で env を直接読めない場合）。
   * 通常は省略し、環境変数から自動解決する。
   */
  affiliateIdOverride?: string;
  /**
   * S2: 作品のフロア（`FANZA_FLOORS.code`）。詳細 URL のパスをフロア別に
   * 出し分けるために使う。未指定時は従来どおり av 面のパス。
   */
  floor?: string | null;
}

export interface AffiliateURLs {
  /** 作品詳細ページへの直接アフィリエイト URL。 */
  primaryUrl: string;
  /**
   * 配信終了・404 時に視線を逃さないためのフォールバック URL。
   * 女優名 / SKU / キーワードで FANZA 内を検索した結果一覧へのアフィリエイトリンク。
   */
  fallbackUrl: string;
  /** 実際に採用された ASP。判定の透明性のために返す。 */
  asp: AspName;
  /** Affiliate ID が解決できた場合に true。false の場合 URL は生 URL（追跡無し）。 */
  affiliateResolved: boolean;
}

const DMM_AFFILIATE_BASE = "https://al.dmm.co.jp/";
/**
 * S2(2026-07-31 CSO承認): 旧実装は全フロアで `digital/videoa/-/detail/=/cid=` 固定
 * だったため、anime / nikkatsu の作品でも videoa のパスを出力していた（2026-07-31
 * 実測: works 詳細 anime/nikkatsu の 004 リンクが videoa パスで配信されていた）。
 * FANZA API が返す正規 URL のパスはフロアごとに異なるため、同じ形へ出し分ける。
 *   videoa / amateur(=API では videoa) → video.dmm.co.jp/av/content/?id=
 *   anime                              → video.dmm.co.jp/anime/content/?id=
 *   nikkatsu                           → video.dmm.co.jp/cinema/content/?id=
 * 本修正は af_id 990 の件とは独立の是正（対象は 004 リンクの着地先）。
 */
const FANZA_CONTENT_BASE: Record<string, string> = {
  videoa: "https://video.dmm.co.jp/av/content/?id=",
  amateur: "https://video.dmm.co.jp/av/content/?id=",
  anime: "https://video.dmm.co.jp/anime/content/?id=",
  nikkatsu: "https://video.dmm.co.jp/cinema/content/?id=",
};
/** フロア未指定・未知フロア時の既定（従来と同じ av 面）。 */
const FANZA_CONTENT_DEFAULT = FANZA_CONTENT_BASE.videoa;

function detailTargetFor(contentId: string, floor?: string | null): string {
  const base =
    (floor && FANZA_CONTENT_BASE[floor]) || FANZA_CONTENT_DEFAULT;
  return `${base}${encodeURIComponent(contentId)}`;
}
const FANZA_SEARCH_BASE =
  "https://www.dmm.co.jp/digital/videoa/-/list/search/=/searchstr=";

/**
 * Vercel / Next.js のクライアントバンドルでは `process.env.NEXT_PUBLIC_*` のみ
 * 静的に読み取れる。サーバー側 SSR 経路では `DMM_AFFILIATE_ID` を優先。
 * いずれも未定義の場合は affiliate トラッキング無しの生 URL を返す（盾の方針）。
 */
function resolveAffiliateId(asp: AspName, override?: string): string | null {
  if (override && override.length > 0) return override;
  if (asp === "fanza") {
    return (
      process.env.NEXT_PUBLIC_FANZA_AFFILIATE_ID ??
      process.env.DMM_AFFILIATE_ID ??
      null
    );
  }
  // dmm_tv / u_next はフェーズ 2 で実装。現状は環境変数が無いため null。
  return null;
}

function wrapWithDmmAffiliate(targetUrl: string, affiliateId: string): string {
  const lurl = encodeURIComponent(targetUrl);
  const af = encodeURIComponent(affiliateId);
  return `${DMM_AFFILIATE_BASE}?lurl=${lurl}&af_id=${af}&ch=link_tool&ch_id=link`;
}

function deriveSearchQuery(input: BuildAffiliateURLInput): string {
  const fragments: string[] = [];
  if (input.actressOrSku && input.actressOrSku.trim().length > 0) {
    fragments.push(input.actressOrSku.trim());
  }
  if (input.keywords && input.keywords.length > 0) {
    for (const kw of input.keywords) {
      if (kw && kw.trim().length > 0) fragments.push(kw.trim());
    }
  }
  if (fragments.length === 0) {
    // 最終フォールバック: contentId を検索クエリに使う（SKU 検索的に効くケースが多い）。
    fragments.push(input.contentId);
  }
  // FANZA は AND 検索。半角スペース区切りで 2 語以内が現実的（tools.ts と方針統一）。
  return fragments.slice(0, 2).join(" ");
}

/**
 * 多 ASP 対応アフィリエイト URL ビルダ。
 *
 * フェーズ 1 では `asp === "fanza"` 経路のみ完全動作。`dmm_tv` / `u_next` は
 * 同じ抽象を保ったまま、それぞれの実装が解放されるたびに分岐を増やす設計。
 */
export function buildAffiliateURL(
  input: BuildAffiliateURLInput,
): AffiliateURLs {
  const asp = safeAspName(input.asp ?? DEFAULT_ASP);

  // --- 詳細ページ + 検索一覧ページの「素の」ターゲット URL を組み立てる ---
  const detailTarget = detailTargetFor(input.contentId, input.floor);
  const searchQuery = deriveSearchQuery(input);
  const searchTarget = `${FANZA_SEARCH_BASE}${encodeURIComponent(searchQuery)}/`;

  // --- ASP 別にアフィリエイトラッパーを適用 ---
  if (asp === "fanza") {
    const affId = resolveAffiliateId("fanza", input.affiliateIdOverride);
    if (!affId) {
      // 環境変数が未設定なら、追跡なしの生 URL を返す（盾: ID をハードコードしない）。
      return {
        primaryUrl: detailTarget,
        fallbackUrl: searchTarget,
        asp,
        affiliateResolved: false,
      };
    }
    return {
      primaryUrl: wrapWithDmmAffiliate(detailTarget, affId),
      fallbackUrl: wrapWithDmmAffiliate(searchTarget, affId),
      asp,
      affiliateResolved: true,
    };
  }

  // dmm_tv / u_next: フェーズ 2 で各 ASP のラッパー実装を解放する。
  // 現時点では FANZA 経路と同じ URL を返しつつ affiliateResolved=false で示す。
  return {
    primaryUrl: detailTarget,
    fallbackUrl: searchTarget,
    asp,
    affiliateResolved: false,
  };
}

/**
 * STRATEGY_BRIEF_040 (Option 3) — 早期クッキー着火 (early cookie burn) 用 URL。
 *
 * コンシェルジュの最終提案より前に FANZA アフィリエイト Cookie を着火させるための導線。
 * 検索キーワード版は 0 件ヒットの懸念があるため、検証済みの FANZA リスト動線へ変更:
 *   discount → セール特集 (article=sale) / それ以外 → ランキング (sort=ranking)。
 *   いずれも 2026-06-07 に 302→age_check（rurl にパス保持）でパス到達を物理確認。
 * `resolveAffiliateId` / `wrapWithDmmAffiliate` を通し、ID 未解決時は追跡なしの生 URL を返す
 * （盾: アフィリエイト ID をハードコードしない）。新規 URL は捏造せず検証済みパスのみ使用。
 */
const EARLY_BURN_LIST_PATHS: Record<string, string> = {
  discount: "digital/videoa/-/list/=/article=sale/",
};
const EARLY_BURN_DEFAULT_PATH = "digital/videoa/-/list/=/sort=ranking/";

export function buildEarlyCookieURL(intent: string | null | undefined): string {
  const path =
    (intent && EARLY_BURN_LIST_PATHS[intent]) || EARLY_BURN_DEFAULT_PATH;
  const target = `https://www.dmm.co.jp/${path}`;
  const affId = resolveAffiliateId("fanza");
  if (!affId) return target; // 盾: ID 未解決なら追跡なし生 URL
  return wrapWithDmmAffiliate(target, affId);
}

/**
 * U3: セール特集テンプレート（新規会員導線 設計書v1）の CTA 先 URL。
 * 検証済みの FANZA セール特集リスト（`article=sale`・2026-06-07 到達確認済）を
 * アフィリエイトラップして返す。early cookie burn と同一ターゲットだが、
 * 用途（記事内の可視 CTA・placement="article_sale_cta"）が異なるため別名で公開する。
 * 新規パスの捏造禁止＝検証済みパスのみ使用、の原則を維持。
 */
export function buildSaleFeatureURL(): string {
  return buildEarlyCookieURL("discount");
}

/**
 * U2: ガイド記事の FANZA TV（DMMプレミアム）登録 CTA 用 URL。
 *
 * 必須条件（DMM 報酬料率ページ注記・2026-07-07 HUMAN 確認）:
 * DMMプレミアム登録は **FANZA ドメイン（dmm.co.jp）の登録フォーム経由**でないと
 * FANZA TV カテゴリ成果の対象外。dmm.com 側導線は使用禁止。
 * ターゲットは `premium.dmm.co.jp`（2026-07-22 HUMAN 実査: 14日無料0円・月額550円・
 * 550pt・TV/TV Plus の全表記を確認済み。X の T6 直リンク（B3）で運用実績あり）。
 *
 * ⚠️リグレッションブロック（CSO 裁定 2026-07-23）:
 * 旧ターゲット `www.dmm.co.jp/monthly/premium/` は 2026-07-23 時点で
 * video.dmm.co.jp/svod/deluxe/（見放題chデラックス・月額8,980円・無料期間なし＝
 * 記事記載と別商品）への 301 に変異していることを HUMAN 実クリックで確認済み。
 * 旧 URL への差し戻しは表示整合違反＝禁止。新規パスの捏造も禁止。
 */
const FANZA_TV_SIGNUP_TARGET = "https://premium.dmm.co.jp/";

export function buildTvSignupURL(): string {
  const affId = resolveAffiliateId("fanza");
  if (!affId) return FANZA_TV_SIGNUP_TARGET; // 盾: ID 未解決なら追跡なし生 URL
  return wrapWithDmmAffiliate(FANZA_TV_SIGNUP_TARGET, affId);
}

/**
 * B2⑥: 既存プレミアム会員向け TV Plus 追加 CTA（第2ファネル・¥2,200）用 URL。
 * placement=guide_tvplus_add_cta（新規値）。既存 buildTvSignupURL とは別実装
 * （BRIEF_126 §12 論点5: 既存 CTA 系へ条件分岐を入れない）。
 *
 * af_id は設定定数として外出し（rev2 決定ログ3）: 環境変数
 * NEXT_PUBLIC_TVPLUS_ADD_AFFILIATE_ID があればそれを使用し、無ければ既存の
 * fanza 解決系（=004）へフォールバック。将来 007 発行時は env 追加のみで
 * 差し替え可能（既存 004 系コードには触れない）。
 *
 * 着地ターゲットは検証済み実 URL のみ使用（新規パス捏造禁止）。現行値は
 * premium.dmm.co.jp ルート（2026-07-22 HUMAN 実査で TV/TV Plus 表記確認済み）。
 * HUMAN 実査①（TV Plus 追加手続きの実画面 URL）確認後、公開前にこの定数を
 * 実査確認 URL へ更新する（未確認パスのままの公開は不可）。
 */
const TVPLUS_ADD_TARGET = "https://premium.dmm.co.jp/";

function resolveTvPlusAddAffiliateId(): string | null {
  return (
    process.env.NEXT_PUBLIC_TVPLUS_ADD_AFFILIATE_ID ??
    resolveAffiliateId("fanza")
  );
}

export function buildTvPlusAddURL(): string {
  const affId = resolveTvPlusAddAffiliateId();
  if (!affId) return TVPLUS_ADD_TARGET; // 盾: ID 未解決なら追跡なし生 URL
  return wrapWithDmmAffiliate(TVPLUS_ADD_TARGET, affId);
}
