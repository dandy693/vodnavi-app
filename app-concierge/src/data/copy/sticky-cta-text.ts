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

/**
 * モバイル sticky CTA 1 列目: FANZA 公式 (成約の核心) のラベル。
 *
 * 【2026-09-05・第120便 補遺1 B】**未改名。CSO 裁定待ち。**
 * 裁定の例示は「遷移先が作品詳細なら『作品を見る』、おすすめ提示なら
 * 『今夜の1本を探す』」だったが、**実体はそのどちらでもない**——
 * このボタンは `FanzaAffiliateLink href={fanzaAffiliate.primaryUrl}`
 * (`placement="detail_sticky_cta"`) で、**外部の FANZA 公式作品ページ**へ出る。
 * 遷移先の実体を報告したうえで最終文言を確定する、という手順に従い据え置く。
 */
export const STICKY_MAIN_LABEL = "今宵ひらく";

/**
 * モバイル sticky CTA 2 列目: コンシェルジュ (回遊の盾) のラベル。
 *
 * 【2026-09-05・第120便 補遺1 B】「司書に相談」から改名。
 * 遷移先は `/concierge?source=app_direct&intent=actress&seed_cid=…` の内部遷移で、
 * **パス名と自己一致する**。§25 の「機能表記は app」に従う。
 *
 * **【幅の実測・要注意】13px で 130.0px。**
 * sticky はコンテナ `px-3` + `grid-cols-2 gap-2`、子は `px-3`。
 * - 375px 端末: テキスト領域 147.5px → **収まる**（余裕 17.5px）
 * - **320px 端末: テキスト領域 120px → 10px 超過する**
 * 320px を捨てない場合の短縮案は「コンシェルジュ」(91.0px)。**採否は CSO 裁定。**
 */
export const STICKY_SUB_LABEL = "コンシェルジュに相談";
