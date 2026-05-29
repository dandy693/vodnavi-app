# STRATEGY BRIEF 003 — 5大ピラー記事・生HTML調律リライト執行命令

## 1. 執行目的
サルベージ済みの主要5記事（1095/1106/994/954/1018）の本文構造を、最高法律『BRAND_DESIGN_GUIDE.md』の世界観（『ビブリア・エロティカ』）に100%調律し、明日の土曜PDCA（計測フィードバック・ループ）の受け皿として完全デプロイする[cite: 4, 5, 10]。

## 2. 各記事の役割とURL/Post ID固定マッピング
CCO（ChatGPT 5.5）は、必ず以下の既存マッピングに則り、URL・Post IDを1ミリも汚染させずに本文をリライトせよ[cite: 5, 7]。

| Post ID | 既存スラッグ（URL） | 役割（ページタイプデザイン） | クリア基準・インテントパラメータ[cite: 5] |
|:---|:---|:---|:---|
| **1095** | `/fanza20250329/` | Beginner Guide | 「大人の嗜み」教養トーン、`intent=beginner` のCTA[cite: 3, 4] |
| **1106** | `/fanza20250331/` | Registration / Benefits Guide | 秘匿チェックイン案内、`intent=beginner` のCTA[cite: 3, 4] |
| **994** | `/fanza_otoku250114/` | Safety / Anxiety Resolution | 履歴・明細のプライバシー防衛、`intent=discount`[cite: 3, 4] |
| **954** | `/fanzaotoku/` | Evergreen Sale Hub | 常設セールハック、`intent=discount` のCTA[cite: 3, 4] |
| **1018** | `/saika-kawakita-6/` | Actress Architecture | 特定アクトレス深掘り、`intent=actress` のCTA[cite: 3, 4] |

## 3. 執筆・出力の不変条件（CCO厳守）
1. **冒頭 #PR 表記**: 記事冒頭ファーストビューへの `> 本記事にはアフィリエイトリンクが含まれます（#PR）。` の挿入（省略はPR拒否）[cite: 3, 6]。
2. **装飾制限**: マーカー、注目ボックス、口コミ、CTAボタン（金 Pill）はすべて `THE_THOR_DICTIONARY.md` の生HTML構文を直接出力ブロックに含めること。Gutenberg、`<br>`連打、インラインスタイルの使用は厳禁とする[cite: 5]。
3. **確定CTAの一貫性**: 末尾CTAは `https://app.vodnavi.jp/concierge?source=moterist&intent={上記パラメータ}` の形を完全厳守せよ[cite: 3, 4]。

## 4. CTOへの申し送り（自動注入スタンバイ）
CCOから上記5本の調律済み生HTMLブロックが出力され次第、CTO（Claude Code）は `OPERATION_MANUAL.md` §4 に従い、`wp post update <ID>` による本番データベースへの直接注入シークエンスを実行せよ[cite: 5]。
