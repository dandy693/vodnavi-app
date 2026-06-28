---
title: "レビュー未カバー領域の実棚卸し — 既存targetは100% live、真の空白はtarget list外のGSC上位"
brief_id: "083"
last_updated: "2026-06-28"
status: "audited"
supersedes_premise: "「未生成targetをバルク生成」は対象ゼロ。真の空白はtarget list自体の陳腐化。"
---

# STRATEGY_BRIEF_083: 未カバー領域の実棚卸し結果

> 採番補正: CSO script は `management/` 無し相対パス + frontmatter 無しでファイル生成し、
> さらに `TASK_BOARD.md`（相対）を新規作成＝**orphan board fork**（pre-commit hook `e7a6e3a`
> が禁止／[[feedback_preserve_task_board_in_place]]）。本ブリーフは正規パス・正規書式で再起案。

## 1. 棚卸し結果（物理）
- `CCO_TARGET_CIDS`（`scripts/cco-target-cids.ts`）= **27 cid**（全 floor=videoa）。
- `src/data/work-reviews/*.md` = 27 ファイル（+README）。**全 27 が `source: live`**。fixture/placeholder はゼロ。
- 突合: **27 targets ↔ 27 live files が 1:1。既存 target list の CCO カバレッジは 100% live**。
- → **「未生成 target をバルク生成」という CSO script の前提は対象ゼロ**（[[project_work_reviews_already_live]]）。

## 2. 真の空白地帯 ―― target list の陳腐化
前ターン GSC 監査（`_metrics/2026-W26/gsc-raw-data.md`）の**上位着地と target list を突合**すると、
**高トラフィックなのに target list 未登録かつレビュー不在**の作品が複数判明:

| GSC着地順位 | content_id | floor | clicks(3mo) | target list | review file |
|---|---|---|---|---|---|
| #4 | sivr00490 | videoa | 63 | 未登録 | 不在 |
| #5 | mizd00341 | videoa | 59 | 未登録 | 不在 |
| #6 | h_1261amcp00247 | **anime** | 47 | 未登録 | 不在 |
| #8 | cmf00095 | videoa | 42 | 未登録 | 不在 |

→ 限界効用が高いのは「既 live cid の再ロール」でも「既存27 target の再生成」でもなく、
**この4件（特に videoa 3件）を target list に追加して新規 live 生成すること**。

## 3. gkok00002 試走の結論
- 2026-06-28 の live 試走（[[STRATEGY_BRIEF_082]]）の再ロール候補は **publish 見送り・現状維持**。
  既存 live（2026-06-01）と同等品質で差し替える必然性なし。

## 4. 正しい起動仕様（CSO script の誤りを訂正）
- 誤: `node --env-file=.env.local src/scripts/generate-reviews.js --target=[CID]`（不在パス/誤拡張子/モード欠落）。
- 正: `node --env-file=.env.local --experimental-strip-types scripts/generate-work-reviews.ts --mode=live --target=<cid> --force`
  （bare node は .env.local 非ロード／model は env で gpt-5.5）。

## 5. 推奨ネクスト（HUMAN 承認事項）
1. `CCO_TARGET_CIDS` に上記 videoa 3件（sivr00490 / mizd00341 / cmf00095）を追加（**コード変更**）。
2. anime floor の h_1261amcp00247 は floor 取り扱い（型は floor:"videoa" 固定）を要拡張＝別途設計。
3. 追加分の live 生成は **OpenAI 課金 + 本番 md publish** のため、段階導入
   （1件→人間レビュー→反映）で HUMAN 明示承認の上で実施。一斉バルクは不可。
