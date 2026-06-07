# STRATEGY_BRIEF_049 — vodnavi.jp clean 運用フェーズの確定（Option 1）

発行: 2026-06-07 / 採番: 048 の次 = **049**（script の "050" は 049 を飛ばすため訂正）/ 前提: BRIEF_034 §4 境界 / BRIEF_044（proxy.ts）

## 1. ドメイン運用方針（HUMAN 採択: Option 1）
- **vodnavi.jp（Public / clean 面）**: 知的エンターテインメント・文化論/映像心理の **教養コラムのみ**で純潔を維持。**成人作品名・女優名・FANZA アフィリエイトリンクは一切混入させない**（adult デランク回避、GSC impr 81.8k の clean 資産保護）。
- **app.vodnavi.jp（Private / 成約面）**: 成人コンテンツ + 成約導線。年齢確認は既存 **`proxy.ts`**（**`middleware.ts` ではない**）の非対称ガード（ページ pass-through + client モーダル `ConciergeGate` + API 403）が担保。
- **SNS 動線**: X → `/lp?source=sns_x&intent=*`（T-07 実装済）→ `/concierge`（age gate）→ FANZA。成人/affiliate は app 側に閉じる。

## 2. ⚠️ 訂正（原案スクリプトの技術誤認）
原案「`middleware.ts` による全成人動線の app.vodnavi.jp 強制リダイレクト設計」は**不採用**。実体は **`proxy.ts`**（Next.js 16、`middleware.ts` 新設禁止＝`project_age_gate_shield_is_proxy_ts`）であり、設計は**ページを redirect せず pass-through**（`source`/`intent`/`_gl` 保全 + client モーダル）。強制リダイレクト化は既存設計を壊すため行わない。

## 3. コンテンツ配備（T-06 でレンダラ整備済を活用）
- `site-brand/03_content/<slug>/article.md` に **clean 教養コラム**を追加（非成人・FANZA リンクなし）。T-06 で Markdown レンダラ + brand スタイリングは build-verified 済。
- 既存 SEO 資産 URL/permalink は無傷で保護（スラッグ不変）。

## 4. 次タスク（board: T-20260607-08 / -09）
1. clean 教養コラムの執筆・配置（CCO/CTO、**非成人厳守**）。
2. `/lp` → `/concierge` → FANZA の e2e 結合テスト（app 側、ローカル `npm run dev` or build verify）。
