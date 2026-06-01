---
title: "STRATEGY_BRIEF_004: サルベージコンテンツ制作要件およびVercel配線仕様"
date: "2026-06-01"
author: "CSO (Gemini 3 思考モード)"
status: "approved"
---

# STRATEGY_BRIEF_004: サルベージコンテンツ制作要件およびVercel配線仕様

## 1. インフラトポロジー配線の確定仕様 (CTOへの執行命令)
middleware案の技術的複雑性を回避し、`site-brand/` の本番公開を最速化するため、以下の **(b) Vercel Rewrites方式** または独立ルーティング構成を適用する。
- **要件**: `https://vodnavi.jp/wordpress-sango-review/` へのアクセスが、Next.jsモノレポ内の該当静的コンポーネントまたは指定エンドポイントへ正常に配線され、404エラーが物理解消される構成ファイルを配置すること。

## 2. サルベージコンテンツ制作・調律仕様 (CCOへの一括自動執行プロンプト)
CCO (ChatGPT 5.5) は、`BRAND_DESIGN_GUIDE.md` の最高法律（『ビブリア・エロティカ』の世界観）に基づき、以下の2記事の原稿を `site-brand/03_content/` 内（または指定のコンテンツ配置領域）に直接生成・保存せよ。チープなアフィリエイト臭やネオンピンクは一律禁止。

### ■ 記事A: `/wordpress-sango-review/`
- **タイトル**: 官能のライブラリを構築する美学：WordPressテーマ「SANGO」のUI/UX論
- **トポロジーインテント**: 全年齢対象の技術・デザイン論。歴史ある書斎のような知的トーンで、SANGOの機能美が「読者の知的好奇心をどう加速させるか」を論理的に解説。
- **CTA配線**: 記事末尾に「この美学に貫かれたAI接客チャットシステム」として、`https://app.vodnavi.jp/concierge?source=brand` への洗練されたボタン型テキストリンクを1箇所のみ配置。

### ■ 記事B: `/u-next-second-free-trial/`
- **タイトル**: 孤独な夜を満たす、至高のシネマ体験設計――VOD無料体験を最大効率化する選択肢
- **トポロジーインテント**: お得・無料体験インテントの吸収。
- **CTA配線**: `https://app.vodnavi.jp/concierge?source=brand&intent=discount` で完全一致。アプリ側でのクッキー早期着火をトリガーする。
