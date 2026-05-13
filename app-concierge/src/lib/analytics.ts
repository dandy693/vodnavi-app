/**
 * GA4 (gtag.js) にイベントを送信する薄いラッパー。
 *
 * - サーバー側で呼ばれても安全（window が無ければ no-op）
 * - gtag が未ロードでも no-op（ローカル開発・GA キー未設定環境）
 * - すべての値は 100 文字でトリミング（GA4 パラメータ上限）
 *
 * 使い方:
 *   track("ai_affiliate_click", { content_id: "abc", transport_type: "beacon" });
 */
export type AnalyticsEventParams = Record<
  string,
  string | number | boolean | undefined | null
>;

const MAX_STRING_LEN = 100;

export function track(eventName: string, params?: AnalyticsEventParams): void {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;

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

  window.gtag("event", eventName, clean);
}
