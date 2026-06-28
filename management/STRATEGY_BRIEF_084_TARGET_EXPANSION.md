---
title: "target list 拡張 — sivr00490 ライブ生成（候補ホールド・未publish）"
brief_id: "084"
last_updated: "2026-06-28"
status: "awaiting-human-approval"
billing: "OpenAI 1 call, gpt-5.5, tokens in:976 out:254 total:1230（極小）"
published: "NO（sivr00490.md は untracked のままホールド。target list 追加のみ commit）"
---

# STRATEGY_BRIEF_084: target list 拡張と sivr00490 ライブ注入

## 1. 目的
[[STRATEGY_BRIEF_083]] で判明した「target list 外の高トラフィック着地」のうち、最上位
`sivr00490`（GSC 3か月 63 clicks / 635 impr, floor=videoa）を target list に追加し、1件のみ
ライブ生成して品質を HUMAN 検閲する段階導入。

## 2. CSO script の誤りと補正
- **致命的欠落**: script は `--target=sivr00490` で生成しようとするが、generator は
  `CCO_TARGET_CIDS.filter(t => targetCids.includes(t.contentId))`（generate-work-reviews.ts
  L544-546）で **list を絞り込む**だけ。sivr00490 が list 未登録なら `targets=0` で**何も生成されない**。
  → 先に `scripts/cco-target-cids.ts` へ **sivr00490 を追加**（コード変更）してから生成する必要があった。
- **コマンド誤り（再発）**: `node --env-file=.env.local src/scripts/generate-reviews.js --target=...`
  は不在パス/誤拡張子。正: `node --env-file=.env.local --experimental-strip-types
  scripts/generate-work-reviews.ts --mode=live --target=sivr00490 --force`。
- **orphan board 回避**: script の相対パス append は cwd=app-concierge では別所/orphan を生む。
  本ブリーフは正規パス、board は in-place Edit。

## 3. 実行結果（2026-06-28）
- `cco-target-cids.ts` に `{ contentId: "sivr00490", floor: "videoa", scClicks: 63, scImpressions: 635 }` 追加（list 27→28）。
- 生成: `PLACE sivr00490 → src/data/work-reviews/sivr00490.md (chars=170, source=live, usage in:976 out:254)`、exit 0。
- 備考: sivr00490 は **VR タイトル**（瀬戸環奈）。GSC 着地パスが `/works/videoa/` のため floor=videoa で登録。

## 4. 生成候補（HUMAN 検閲対象 / 未publish）
- トーンは『ビブリア・エロティカ』適合（古い洋書 / ヴィンテージジャズ / 上質なラウンジ）、VR の距離感に言及。
- 170字＝設計長。全文は会話ログ + scratchpad `sivr00490.candidate.md`。

## 5. 反映ステータス
- **target list 追加（コード）は commit**（承認済「list 拡張」ステップ・runtime 影響なし）。
- **生成レビュー `sivr00490.md` は untracked のままホールド＝未publish**。HUMAN 承認後に次ターンで
  `git add` → commit/push して本番反映。
- 残りの未カバー上位（mizd00341 #5 / cmf00095 #8 〔videoa〕）は本件承認後に同フローで順次。
  anime の h_1261amcp00247 は floor 型拡張が別途必要なため分離。
