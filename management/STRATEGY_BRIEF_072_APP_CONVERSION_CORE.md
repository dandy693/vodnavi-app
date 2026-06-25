---
title: "新章：app.vodnavi.jp 成約コア・コンバージョンコンテンツ配備仕様書"
last_updated: "2026-06-25"
status: "active"
counterpart: STRATEGY_BRIEF_071_VODNAVI_MEDIA_LAYER.md
note: >
  本ブリーフは BRIEF_071 §4 / board T-20260625-05 の HUMAN 決定（clean 面=genuine
  クリーン編集のみ、FANZA 成約コンテンツは app.vodnavi.jp 年齢ゲート内に配置）の
  app 側カウンターパート。clean 面に成人/FANZA 文脈を載せる euphemism 案（旧 §5）は
  不採用が確定済み。本仕様は「ゲート裏」専用であり、ここでの FANZA 文脈は方針内。
---

# STRATEGY_BRIEF_072 — app.vodnavi.jp 成約コア

## 1. 物理配置ターゲット
- **対象ドメイン**: `app.vodnavi.jp`。clean 面 vodnavi.jp には配置しない。**[2026-06-25 訂正]** 当初「年齢ゲート裏のクローズド空間」と記したが、`proxy.ts` の gate matcher は `/concierge`・`/api/concierge` のみ＝**`/works/*` は公開**（SEO 集客のため・成人視聴は遷移先 FANZA の年齢確認に委ねる設計）。本仕様の成約コンテンツ実体は公開 `/works/*` 上に載る（age gate は対話型 /concierge に限定）。
- **世界観**: 『ビブリア・エロティカ（官能の図書館）』。
- **マネタイズ**: FANZA アフィリエイトコンバージョン（既存ガバナンスの盾に完全準拠）。
- **確定ファーストテーマ（2026-06-25 HUMAN 決定 Option 1）**: Search Console 高トラフィックの**一般作（floor=videoa）**。**VR/4K 等の属性は付さない**（詳細 §4）。

## 2. コンテンツ設計要件（CCO 執行基準）
- **文体制限**: 俗悪なアダルトアフィリエイト表現を 100% 排除。知性・高級感・ダーク＆ゴールドのトーンを徹底し、「文化としての官能」をロジカルに比較・解説する。根拠なき「絶対」「業界No.1」等の断定は封印。
- **機能融合**: 記事から即座に AI コンシェルジュ（対話型ナビゲーション）へ回帰、または安全なアフィリエイト動線へ遷移できるよう、コンポーネントレベルで動線を最適化する。流入元は `?source=` で識別（clean 面からの送客は `source=brand_compare_hub` 等）。
- **計測**: 既存 GA4 カスタムディメンション（asp_name/source/intent）と整合。報酬単価は断定せず、実額は KPI 月次監査の確定値に従う（現状未突合）。

## 3. ガバナンス・セキュリティの継承
- 記事に埋め込むすべてのリンクは「5つの盾」（WP 側リンカー / 自動更新停止 / 年齢確認 API 遮断 等）を通過する前提。コードレビューで **1ミリの直リンクも許容しない**（`af_id` 直書き恒久禁止、env / builder / WP 共通リダイレクト経由）。
- `#PR` 表記をファーストビューに明示（ステマ規制遵守）。
- 実装・本番反映は要 HUMAN 承認（`tsc`/`next build` 通過 + 本番 curl 検証を land の条件とする）。

## 4. 第1弾テーマ・対象 CID（2026-06-25 HUMAN 決定 = Option 1 で確定）
- **確定テーマ**: Search Console 高トラフィックの実在作。**属性は per-work で実メタデータに忠実化**＝(a) VR/4K テーマを非該当作に**捏造しない**、(b) 実際に VR/4K の作品からは**scrub もしない**。CSO の「全 top 作 = Premium VR/4K」テーマは棄却（`cco-target-cids.ts:11` は floor 全件 videoa、`gkok00002`=「制服…鳥羽みもり」で VR でない）。**ただし実データ確認の結果 `savr00978` は実タイトル「【VR】…乙アリス」＝真正 VR、`snos00233` の既存 review は 4K に言及（実在）**＝「VR/4K 一律排除」も同様に誤りであり、**作品ごとの真実に従う**（架空ジャンルID 6533/4025 はリポ不在＝付与しない）[[feedback_verify_cso_script_sed]]。
- **対象 CID（実在・SC 物理監査ベース、`cco-target-cids.ts` 準拠）**: 第1弾は SC クリック上位 `gkok00002`(81) / `snos00233`(70) / `savr00978`(43)。以降は同ファイル Sprint1 TOP10 → Sprint2 実在17件の順。**捏造属性（VR/4K・架空ジャンルID 6533/4025 等）は付与しない**（6533/4025 はリポジトリに不在＝未検証）。
- **既存資産（要・自己訂正）**: app 側は greenfield ではない。実ルート `app-concierge/src/app/(site)/works/[floor]/[id]/page.tsx`、単一アフィリエイト動線 `buildAffiliateURL`（`lib/concierge/url-builder.ts`）、レビュー注入パイプライン `generate-work-reviews.ts` + `src/data/work-reviews/*.md`（`snos00233.md`/`savr00978.md` 等は既存）。よって第1弾は**新ルート作成ではなく既存 work-reviews への高品質本文（ビブリア・エロティカ文体）注入**が筋。
- **状況（要・自己訂正）**: 第1弾 prose は**既に配備済**＝`app-concierge/src/data/work-reviews/` に **28 件**、3 target 全て `source: live` / `cco-review-v1.1.1` の実メタデータ grounded な本文が存在（`snos00233`=河北彩花/お泊まり, `savr00978`=乙アリス/VR, `gkok00002`=鳥羽みもり）。CSO script の「snos00233 を肉付けリライト」は**前提誤り＝不要**（既存が高品質 grounded、上書きは regress）。
- **Production 検証（2026-06-25 実施・snos00233）**: 本番 curl＝**status200・公開（非ゲート）・review 本文 + `#PR` 表記 + FANZA CTA + `af_id=moterist-990` 実 URL を物理確認＝PASS**（`buildAffiliateURL` 盾機能、`management/_metrics/2026-W26/production-render-audit.md`）。
- **残（未了）**: 残り 27 件の work-review は未抽出検証（snos00233 1 件のみ実測＝全件への一般化はしない）。実装/反映は要 HUMAN 承認（`tsc`/`next build` + 本番 curl）。
