/**
 * クリーン面 (vodnavi.jp) → 成約面 (app.vodnavi.jp/concierge) へのセキュアな送客 URL ビルダ。
 *
 * 境界規約 (STRATEGY_BRIEF_051 / STRATEGY_BRIEF_7ad8dd2):
 *   clean 面は非成人の trust 聖域。ハンドオフでは作品固有の成人パラメータ
 *   (content_id / actress 等) を **渡さない**。`source`（既定 'brand'）と任意の
 *   `intent` のみを付与し、成人文脈は年齢ゲート (app.vodnavi.jp/proxy.ts) の内側で
 *   接続する。これは FANZA アフィリエイト URL ではなく、自社アプリへの内部送客 URL。
 */
export type ConciergeIntent = "beginner" | "actress" | "discount" | "wisdom";

interface HandoffParams {
  source?: string;
  intent?: ConciergeIntent;
}

const CONCIERGE_BASE = "https://app.vodnavi.jp/concierge";

export function buildConciergeHandoffUrl(params: HandoffParams = {}): string {
  const { source = "brand", intent } = params;
  const search = new URLSearchParams({ source });
  if (intent) search.set("intent", intent);
  return `${CONCIERGE_BASE}?${search.toString()}`;
}
