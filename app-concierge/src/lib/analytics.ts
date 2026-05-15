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
