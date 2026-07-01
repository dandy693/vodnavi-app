# VODNAVI-GROUP — Agent Context

モノレポ構成:
- `site-brand/` — vodnavi.jp（信頼メディア・**既に Next.js App Router 構築済**、`[slug]` dual-read / `03_content/` / `globals.css` ブランドトークン）
- `app-concierge/` — app.vodnavi.jp（成約アプリ・Next.js 16、年齢確認は `src/proxy.ts`＝旧 middleware.ts 後継）
- `management/` — ガバナンス（戦略ブリーフ / `TASK_BOARD.md` / メトリクス）

## Context & Governance（最優先）
確定ファクト正典を必ずロードし遵守すること。CSO/CTO スクリプトが繰り返し再導入する誤り（noindex 乱用・完全遷都の既成事実化・middleware.ts 誤用・cookie 機構混載・「新規 init」誤認）を防ぐ単一の照合先:

@management/FACT_GOVERNANCE.md
