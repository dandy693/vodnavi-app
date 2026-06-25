/**
 * BRIEF_075 — 3タップ診断 → /concierge?cids= シード用の静的マッピング。
 *
 * 既存の `/concierge` ルートは `?cids=a,b,c`（最大 3 件）を受理し、
 * `resolveCidsToWorks()` で FANZA API 逆引き → ConciergeChat に初期作品として
 * シードする。本ファイルは 3 タップの回答から cids 文字列を組み立てるだけで、
 * 新たなデータ層・アフィリエイト動線は持たない（既存パイプラインを再利用）。
 *
 * 重要:
 *   - 王道 9 品番のみ。`h_1724m794g00002`（404・配信終了, board T-08）は永久除外。
 *   - 監査元（SC クリック実績）は `scripts/cco-target-cids.ts`。ただし scripts/ →
 *     src/ のクロスインポートは行わない（ビルド境界の分離）。9 品番は本ファイルで
 *     再宣言し、コメントで監査元を指す（CSO_AUTHORING_GUARDRAIL §1）。
 *   - DB に属性タグが無いため、下記 THREE_TAP_MAP の品番割当は実タイトルからの
 *     **編集キュレーション**（要 CCO 承認）であり、構造化タグ由来の事実ではない。
 */

export type TapAesthetic = "lyrical" | "visceral"; // 叙情的な物語 / 圧倒的な熱量
export type TapTime = "moment" | "longform"; // 濃密な一瞬 / 長い余韻
export type TapDepth = "classic" | "niche"; // 王道の名作 / 耽美な意欲作
export type TapPath = `${TapAesthetic}-${TapTime}-${TapDepth}`;

/**
 * 王道 9 品番（SC クリック実績あり・本番レンダリング PASS）。
 * 監査元: scripts/cco-target-cids.ts（Sprint-1 TOP10 から 404 の h_1724 を除外）。
 */
export const ROYAL_NINE = [
  "gkok00002",
  "snos00233",
  "savr00978",
  "mkmp00726",
  "dvmm00393",
  "ofje00630",
  "evis00624",
  "gqhb00024",
  "1asex00014",
] as const;

/**
 * 3タップ → 最大 3 CID（/concierge?cids= が 3 件で cap）。
 * 編集キュレーション（実タイトル根拠・要 CCO 承認）:
 *   savr00978=実 VR / dvmm00393=10h・ofje00630=8h・gqhb00024=1266分=長尺総集編 /
 *   gkok00002・snos00233・mkmp00726=単体ドラマ寄り / evis00624=足裏・1asex00014=ギャル=ニッチ。
 */
export const THREE_TAP_MAP: Record<TapPath, readonly string[]> = {
  "lyrical-moment-classic": ["snos00233", "gkok00002", "mkmp00726"],
  "lyrical-moment-niche": ["1asex00014", "gkok00002"],
  "lyrical-longform-classic": ["dvmm00393", "ofje00630", "gkok00002"],
  "lyrical-longform-niche": ["ofje00630", "dvmm00393"],
  "visceral-moment-classic": ["savr00978", "snos00233", "mkmp00726"],
  "visceral-moment-niche": ["evis00624", "savr00978", "1asex00014"],
  "visceral-longform-classic": ["gqhb00024", "dvmm00393", "savr00978"],
  "visceral-longform-niche": ["gqhb00024", "evis00624", "ofje00630"],
};

/**
 * 3タップの結果から既存 /concierge ルートへのシード URL を組み立てる。
 * source は ConciergeSource の "app_3tap"（sources.ts に登録済）。
 */
export function buildConciergeHref(
  path: TapPath,
  source: string = "app_3tap",
): string {
  const cids = (THREE_TAP_MAP[path] ?? ROYAL_NINE).slice(0, 3);
  const query = new URLSearchParams({ cids: cids.join(","), source });
  return `/concierge?${query.toString()}`;
}
