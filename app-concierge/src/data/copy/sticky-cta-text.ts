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
 * **幅の実測: 13px で 130.0px（DOM の span 実幅は 135.6px・tracking-wide 込み）。**
 *
 * 【2026-09-12・第124便 裁定4】補遺2 の幅前提「サブ列 375px→147.5px / 320px→120px」は
 * アイコン + gap を含めておらず、本番実測（375px→115.9px / 320px→87.3px）で 2 行に
 * 折り返した。裁定4 によりサブ列のアイコンを除去（`ConciergeCtaLink icon={false}`）し、
 * ローカルビルドの DOM 実幅（320/360/375/414）で閾値を確定した:
 *   - 375px 以上（縦スクロールバー 15px 込みでもテキスト領域 138px ≥ 135.6px）→ 本ラベル
 *   - 〜374px → {@link STICKY_SUB_LABEL_SHORT}（`min-[375px]:` の arbitrary variant で切替）
 *   - 360px はスクロールバー無しなら 138px で収まる（余裕 2.4px）が、従来型スクロールバーが
 *     出る条件では 130.4px となり折り返すため、閾値は 375px に置いた。
 */
export const STICKY_SUB_LABEL = "コンシェルジュに相談";

/**
 * 狭幅端末（〜374px）向けの短縮形。**幅の実測: 13px で 91.0px（DOM 実幅 94.7px）** で 320px でも収まる
 * （320px のテキスト領域は 118px・スクロールバー込みで 103px）。
 *
 * 【厳守】長い側を狭幅で出さないための切替であり、**文言の意味を変える意図はない**。
 * 代替案「ぴったりの1本を探してもらう」は 173.3px で **375px でも超過するため採れない**。
 */
export const STICKY_SUB_LABEL_SHORT = "コンシェルジュ";
