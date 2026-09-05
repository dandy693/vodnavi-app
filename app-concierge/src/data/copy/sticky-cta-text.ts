/**
 * Sticky mobile CTA ラベル — 定数の単一情報源。
 *
 * 原典: `src/data/copy/sticky-cta-text.md` (CCO 採用案)。`.md` は人間が
 * 編集する書面、本ファイルは TSX から型安全に import する配線層。
 * 値を更新する際は md と ts を **両方** 同じ文言で揃えること
 * (Saturday Review の文言レビューが md ベースで回るため、import 側だけ
 * 改変すると履歴の単一情報源が崩れる)。
 *
 * 【2026-09-05・第120便 補遺2】§25-7 の文言原則「世界観表現は moterist、
 * 機能表記は app」に従い、書斎系ラベルを機能表記へ改めた。
 * **設置は維持し改名のみ。導線（href）は一切変更していない。**
 *
 * 幅の前提（実測 13px・sticky はコンテナ `px-3` + `grid-cols-2 gap-2`）:
 *   - メイン列は子に padding が無く、テキスト領域は 375px→171.5px / 320px→144px
 *   - サブ列は子が `px-3` のため、テキスト領域は 375px→147.5px / 320px→120px
 */

/**
 * モバイル sticky CTA 1 列目: FANZA 公式 (成約の核心) のラベル。
 *
 * 遷移先の実体は **外部の FANZA 公式作品ページ**
 * (`FanzaAffiliateLink href={fanzaAffiliate.primaryUrl}` / `placement="detail_sticky_cta"`)。
 * 同じページの主 CTA「FANZA公式で作品の詳細・サンプル映像を確認する（18禁）」の短縮版にあたる。
 * 外部遷移であることの明示は誤クリック防止とコンプライアンスの両面で正。
 *
 * **幅の実測: 13px で 130.9px。** メイン列は 320px 端末でも 144px あるため **両幅で収まる**
 * （短縮案「公式へ（18禁）」88.7px は不要だった）。
 */
export const STICKY_MAIN_LABEL = "FANZA公式へ（18禁）";

/**
 * モバイル sticky CTA 2 列目: コンシェルジュ (回遊の盾) のラベル。
 *
 * 遷移先は `/concierge?source=app_direct&intent=actress&seed_cid=…` の内部遷移で、
 * **パス名と自己一致する**。
 *
 * **幅の実測: 13px で 130.0px。375px 端末（147.5px）では収まるが、320px 端末（120px）
 * では 10px 超過する。** そのため 320px 帯のみ {@link STICKY_SUB_LABEL_SHORT} へ
 * 差し替える（`min-[360px]:` の arbitrary variant で切替）。
 */
export const STICKY_SUB_LABEL = "コンシェルジュに相談";

/**
 * 狭幅端末（〜359px）向けの短縮形。**幅の実測: 13px で 91.0px** で 320px でも収まる。
 *
 * 【厳守】長い側を狭幅で出さないための切替であり、**文言の意味を変える意図はない**。
 * 代替案「ぴったりの1本を探してもらう」は 173.3px で **375px でも超過するため採れない**。
 */
export const STICKY_SUB_LABEL_SHORT = "コンシェルジュ";
