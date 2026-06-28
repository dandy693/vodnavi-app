---
title: "レビュー生成 段階導入 — gkok00002 ライブ1件試走（Dry-Run）結果"
brief_id: "082"
last_updated: "2026-06-28"
status: "awaiting-human-approval"
billing: "OpenAI 1 call, gpt-5.5, tokens in:938 out:343 total:1281（極小）"
published: "NO（本番据え置き・候補は scratchpad 保持）"
---

# STRATEGY_BRIEF_082: レビュー生成の段階導入 — gkok00002 試走結果

## 1. 目的と段階導入ルール
`generate-work-reviews.ts` の live レビュー生成を、一斉実行せず **1品番（gkok00002／GSC着地#2）
のみ** ライブ試走し、品質を HUMAN 検閲してから本番反映する段階導入。本ブリーフは試走結果の記録。

## 2. 実行（2026-06-28）
- 正しい起動コマンド（CSO script の `npm run generate-reviews -- --id=...` は不在スクリプト／誤フラグ）:
  `node --env-file=.env.local --experimental-strip-types scripts/generate-work-reviews.ts --mode=live --target=gkok00002 --force`
- **詰まり①（解消）**: bare `node` は `.env.local` を自動ロードしない（Next.js のみ自動）。
  script に dotenv ローダ無し→`process.env.DMM_API_ID` 等が空で FANZA fetch が失敗。
  `--env-file=.env.local` で解決（DMM_API_ID/DMM_AFFILIATE_ID/OPENAI_API_KEY は .env.local に実在）。
- 結果: `REWRITE gkok00002 … source=live usage in:938 out:343 total:1281`、exit 0。
- **使用モデルは gpt-5.5**（`OPENAI_REVIEW_MODEL` で上書き、reasoning model のため temperature 非対応）。
  script docstring の「既定 gpt-4o」は env 上書きで実質 gpt-5.5。

## 3. 重要発見：「live 解放」前提は二重に誤り
- コード側: 解除すべきモック/TODO は無く live 経路は既に実装済（[[STRATEGY_BRIEF_081]] §4 で既述）。
- **データ側（新規）**: 本番 `src/data/work-reviews/gkok00002.md` は **既に `source: live`**
  （`generated_at: 2026-06-01`, body_chars 164）。**1か月前から live 生成済みの本番データ**であり、
  「fixture を live へ初解放」する余地は無かった。今回の試走は既存 live レビューの **再ロール**
  （164→169字の同等別バリアント）に相当。

## 4. 生成候補の品質（HUMAN 検閲対象）
- トーンは『ビブリア・エロティカ』に適合（"禁じられた書架"/"古い洋書"/"夜の帳"/"理性と本能"）。
- 文字数 169＝プロンプト v1.1.1 の設計長（truncation ではない）。
- 本文に FANZA CTA/アフィリエイトリンクは無し（CTA はページテンプレート側の責務であり review md には含めない設計）。
- 候補全文は会話ログ + scratchpad `gkok00002.candidate.md` に保持。

## 5. 反映ステータス
- **本番は据え置き（publish せず）**: 生成直後に `git checkout` で production md を復元、working tree clean。
- 候補は scratchpad に保持。**HUMAN 承認後、次ターンで候補を target へ配置 → commit/push** する。
- 判断材料: 既存 live（2026-06-01）と新候補（2026-06-28）は同等品質。**そもそも差し替える必然性は低い**。
  再ロールでなく「未生成 cid への新規生成」へ展開する方が Information Gain の限界効用は高い（残り 26 cid）。

## 6. 推奨ネクスト（HUMAN 選択）
1. 今回候補を gkok00002 へ publish（上書き）する／しない。
2. 段階導入を「既 live cid の再ロール」でなく「未カバー cid への新規生成」に振り向けるか。
   → 対象母集団は CCO_TARGET_CIDS 27件中、既 live 済を除いた未生成分を要棚卸し。
