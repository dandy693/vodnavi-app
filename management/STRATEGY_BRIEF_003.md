# STRATEGY BRIEF 003 — 5大ピラー記事・生HTML調律リライト執行命令 (v1.2 / slug 未検証保留)

## 1. 執行目的
サルベージ済みの主要5記事（1095/1106/994/954/1018）の本文構造を、最高法律『BRAND_DESIGN_GUIDE.md』の世界観（『ビブリア・エロティカ』）に100%調律し、明日の土曜PDCA（計測フィードバック・ループ）の受け皿として完全デプロイする[cite: 4, 5, 10]。

## ⚠️ 2026-05-29 監査保留事項（CCO/CTO 必読）
本ブリーフ §2 のスラッグ列のうち、**post_id 994 / 954 / 1018 の3件は live 真理値との照合が未完了**である。理由:
- `scripts/audit-google-tools.mjs:86-93` の `ARTICLE_SLUGS` (live 真理値) に該当 3 slug (`fanza_otoku250114` / `fanzaotoku` / `saika-kawakita-6`) は存在しない。
- 本番 mixhost への SSH 直接照会 (`wp post get <id> --field=post_name --path=public_html/moterist.com`) は Claude Code auto-mode classifier により今セッションでブロックされた（SSH 鍵 `/tmp` コピーおよび本番 SSH 接続の両方）。
- post_id 1095 のみ `OPERATION_MANUAL.md:99` に `1095 → /fanza20250329/` の明示があり、整合確認済。post_id 1106 も既存ピラー記事リストに整合。

**CTO への要請**: T-02 の SSH 注入実行前に、最初の 5 リクエストとして `wp post get <id> --field=post_name` を 5 件分実行し、live slug を本ブリーフ §2 表へ正典として上書きすること。**`_live` 等の人為的接尾辞付与は厳禁。**

## 2. 各記事の役割とURL/Post ID固定マッピング（slug は未検証分含む）
CCO（ChatGPT 5.5）は、必ず以下の既存マッピングに則り、URL・Post IDを1ミリも汚染させずに本文をリライトせよ[cite: 5, 7]。文中で URL を引用する際は、検証印 ✅ がついた slug のみ canonical 想定として扱うこと。

| Post ID | 既存スラッグ（URL） | 検証 | 役割（ページタイプデザイン） | クリア基準・インテントパラメータ[cite: 5] |
|:---|:---|:---|:---|:---|
| **1095** | `/fanza20250329/` | ✅ OPERATION_MANUAL 整合 | Beginner Guide | 「大人の嗜み」教養トーン、`intent=beginner` のCTA[cite: 3, 4] |
| **1106** | `/fanza20250331/` | ✅ audit ARTICLE_SLUGS 整合 | Registration / Benefits Guide | 秘匿チェックイン案内、`intent=beginner` のCTA[cite: 3, 4] |
| **994** | `/fanza_otoku250114/` | ⚠️ 未検証 | Safety / Anxiety Resolution | 履歴・明細のプライバシー防衛、`intent=discount`[cite: 3, 4] |
| **954** | `/fanzaotoku/` | ⚠️ 未検証 | Evergreen Sale Hub | 常設セールハック、`intent=discount` のCTA[cite: 3, 4] |
| **1018** | `/saika-kawakita-6/` | ⚠️ 未検証 | Actress Architecture | 特定アクトレス深掘り、`intent=actress` のCTA[cite: 3, 4] |

## 3. 執筆・出力の不変条件（CCO厳守）
1. **冒頭 #PR 表記**: 記事冒頭ファーストビューへの `> 本記事にはアフィリエイトリンクが含まれます（#PR）。` の挿入（省略はPR拒否）[cite: 3, 6]。
2. **装飾制限**: マーカー、注目ボックス、口コミ、CTAボタン（金 Pill）はすべて `THE_THOR_DICTIONARY.md` の生HTML構文を直接出力ブロックに含めること。Gutenberg、`<br>`連打、インラインスタイルの使用は厳禁とする[cite: 5]。
3. **確定CTAの一貫性**: 末尾CTAは `https://app.vodnavi.jp/concierge?source=moterist&intent={上記パラメータ}` の形を完全厳守せよ[cite: 3, 4]。

## 4. CTOへの申し送り（自動注入スタンバイ）
CCOから上記5本の調律済み生HTMLブロックが出力され次第、CTO（Claude Code）は `OPERATION_MANUAL.md` §4 に従い、`wp post update <ID>` による本番データベースへの直接注入シークエンスを実行せよ[cite: 5]。
