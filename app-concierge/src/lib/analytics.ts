/**
 * GA4 (gtag.js) にイベントを送信する薄いラッパー。
 *
 * - サーバー側で呼ばれても安全（window が無ければ no-op）
 * - gtag が未ロードでも no-op（ローカル開発・GA キー未設定環境）
 * - すべての値は 100 文字でトリミング（GA4 パラメータ上限）
 *
 * STRATEGY_BRIEF_003 追加: `product_click` / `ai_affiliate_click` などの
 * 主要イベントを ASP 名を必須パラメータとして引き継げるよう、型付きヘルパー
 * (`trackProductClick`, `trackAiAffiliateClick`) を併設。
 *
 * 使い方:
 *   track("ai_affiliate_click", { content_id: "abc", asp_name: "fanza" });
 *   trackAiAffiliateClick({ content_id: "abc", asp_name: "fanza" });
 */
import type { AspName } from "@/lib/concierge/asp";

export type AnalyticsEventParams = Record<
  string,
  string | number | boolean | undefined | null
>;

const MAX_STRING_LEN = 100;

export function track(eventName: string, params?: AnalyticsEventParams): void {
  if (typeof window === "undefined") return;

  const clean: Record<string, string | number | boolean> = {};
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value == null) continue;
      if (typeof value === "string") {
        clean[key] =
          value.length > MAX_STRING_LEN
            ? value.slice(0, MAX_STRING_LEN)
            : value;
      } else {
        clean[key] = value;
      }
    }
  }

  // データ汚染防止の盾：本番以外では絶対に GA4 (G-GG7JV9MJRW) に送信しない。
  // 開発・プレビュー環境のリロードや HMR が本番プロパティに「ノイズイベント」
  // として記録されると、サタデー PDCA の数値が汚染される。NODE_ENV をクライアント
  // バンドル時に静的評価することで、非本番ビルドは window.gtag を一切呼ばない。
  if (process.env.NODE_ENV !== "production") {
    // 開発時の動作確認用：イベント名と params を console に出すだけ。
    console.log("[track-dev]", eventName, clean);
    return;
  }

  // `<Script strategy="afterInteractive">` is queued until hydration completes,
  // and useEffect fires before that script has set up `window.gtag`. To avoid
  // dropping early events we push to `window.dataLayer` directly — `gtag.js`
  // processes the queue when it loads. Once gtag is live, prefer the function
  // call (cleaner for browser devtools).
  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, clean);
  } else {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(["event", eventName, clean]);
  }
}

/**
 * STRATEGY_BRIEF_003 — 型付きトラッキングヘルパー。
 *
 * `asp_name` を必須に格上げすることで、フェーズ 2 解放時に GA4 ファネルを ASP 別
 * に分割集計できる土台を確保する。フェーズ 1 期間中はすべて `"fanza"` を渡せばよい。
 */

export interface ProductClickPayload {
  asp_name: AspName;
  content_id: string;
  title?: string;
  floor_code?: string;
  /** "card" | "cta" 等、カード上のどのタップ箇所か。 */
  placement?: string;
  /** "internal_detail" | "fanza_affiliate" | "fanza_fallback_search" 等。 */
  link_target?: string;
  transport_type?: "beacon" | "xhr" | "image";
}

export function trackProductClick(payload: ProductClickPayload): void {
  // 型付きペイロードを動的 `Record` 形式へ展開して track() に渡す。
  // 厳密 interface は index signature を持たないため、{...payload} で
  // 構造的にプリミティブな辞書化する必要がある。
  track("product_click", { ...payload });
}

export interface AiAffiliateClickPayload {
  asp_name: AspName;
  content_id: string;
  title?: string;
  floor_code?: string;
  transport_type?: "beacon" | "xhr" | "image";
  /** "primary" | "fallback_search"（フォールバック検索リンクをクリックした場合）。 */
  link_variant?: "primary" | "fallback_search";
}

export function trackAiAffiliateClick(payload: AiAffiliateClickPayload): void {
  track("ai_affiliate_click", { ...payload });
}
