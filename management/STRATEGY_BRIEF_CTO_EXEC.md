---
title: "CTO実装命令: チャット起動率0.88%突破UI改修 & SEOハブJSON-LD動的配置仕様"
last_updated: "2026-06-21"
status: "active"
assigned_to: "CTO (Claude Opus)"
---
# 1. 背景と物理ファクト
2026-06-21データ監査により、DMM側で今月3件（1,102円）の報酬発生が確認されたが、GA4側のチャット起動（ai_session_start）はアクティブユーザーのわずか0.88%に留まる。個別詳細ページの潜在能力を活かし、トップUIの導線欠陥を修復すると同時に、将来のAI検索（LLMO）に吸わせるためのセマンティック防御を固める。

# 2. 具体的要求仕様（CTO実装スコープ）

## ① 【UI改修】チャット起動ファネル（ai_session_start）の改善
- **対象**: `app-concierge/` 内のトップページUI、またはチャットコンポーネント（`concierge-chat.tsx`）へのエントリー動線。
- **要件**: 『ビブリア・エロティカ』のダーク×ゴールド（#D4AF37）の高級感ある書斎世界観を1ミリも崩すことなく、ユーザーがサイト着火時に「AIコンシェルジュに相談する」インテントを直感的に視認・クリックできるUI導線強化（マイクロコピーの配置、またはフローティングボタンの意匠変更）の実装コード案の作成。

## ② 【SEO/LLMO拡張】actresses/[id] および genres/[id] へのJSON-LD動的埋め込み
- **対象**: `app-concierge/src/app/(site)/actresses/[id]/page.tsx` および `genres/[id]/page.tsx`
- **要件**: Next.js 16のメタデータAPIを用い、Schema.orgの `Product`、`Offer`、`Person` に準拠した構造化データを動的に自動生成・注入するロジックを実装。sitemap.xmlに含まれる400件のハブURLすべてが、AIクローラー（GPTBot, PerplexityBot）によって世界最高効率でパースされる設計にすること。
- **禁則事項**: `src/middleware.ts` の新規作成は禁止。年齢確認およびルーティング配線は `src/proxy.ts` へ完全一元化すること。

## ③ 【robots.txt最適化】
- 既設の `robots.txt` に対し、AI検索エンジン系列（GPTBot, OAI-SearchBot, PerplexityBot, ClaudeBot）を明示的に許可し、構造化データディレクトリへのクロールバジェットを最適化する個別ルールを追記。
