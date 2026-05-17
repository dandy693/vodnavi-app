/**
 * 多 ASP（アフィリエイト・サービス・プロバイダ）名の正規化型。
 *
 * STRATEGY_BRIEF_003: フェーズ 2「拡大加速期」で DMM TV / U-NEXT を限定裏メニュー
 * として解放する設計を見据え、データ・URL・イベントの全レイヤーで ASP を
 * 識別できるよう一元化する。フェーズ 1 期間中はすべて `"fanza"` 固定で動作。
 *
 * - SQL 側: `asp_name TEXT NOT NULL DEFAULT 'fanza'`
 * - 型側  : 本ユニオン
 * - GA4   : `track("ai_affiliate_click", { asp_name: "fanza", ... })`
 */
export type AspName = "fanza" | "dmm_tv" | "u_next";

/**
 * 文字列が AspName に該当するかどうかの型ガード。
 * 不明な値が来た場合は `"fanza"` にフォールバックする safeAspName を併用する。
 */
export function isAspName(value: unknown): value is AspName {
  return value === "fanza" || value === "dmm_tv" || value === "u_next";
}

/**
 * 任意の入力を AspName に正規化する。不明値はフェーズ 1 既定の `"fanza"`。
 */
export function safeAspName(value: unknown): AspName {
  return isAspName(value) ? value : "fanza";
}

export const DEFAULT_ASP: AspName = "fanza";
