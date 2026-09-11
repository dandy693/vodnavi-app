/**
 * Sticky mobile CTA ラベル — 定数の単一情報源。
 *
 * 原典: `src/data/copy/sticky-cta-text.md` (CCO 採用案)。`.md` は人間が
 * 編集する書面、本ファイルは TSX から型安全に import する配線層。
 * 値を更新する際は md と ts を **両方** 同じ文言で揃えること
 * (Saturday Review の文言レビューが md ベースで回るため、import 側だけ
 * 改変すると履歴の単一情報源が崩れる)。
 *
 * BRAND_DESIGN_GUIDE §1 のサニタイズ表現規則に従い、煽情語・命令形を
 * 避けた静かな招待のトーンに統一。
 */

/** モバイル sticky CTA 1 列目: FANZA 公式 (成約の核心) のラベル。 */
export const STICKY_MAIN_LABEL = "今宵ひらく";

/** モバイル sticky CTA 2 列目: コンシェルジュ (回遊の盾) のラベル。 */
export const STICKY_SUB_LABEL = "司書に相談";
