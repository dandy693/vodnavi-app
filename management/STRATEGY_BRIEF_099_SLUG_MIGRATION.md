# STRATEGY_BRIEF_099: site-brand [slug] の匿名DB接続移行とSEO正典化

## 1. 物理的背景と監査結果
- 現行の `site-brand/src/app/[slug]/page.tsx` は、ローカルファイルシステム（`03_content/`）のマークダウンに依存する旧SSG設計を維持しており、新設された匿名Supabaseクライアントと未配線である。
- `generateMetadata` が不在であり、SEOにおける重複コンテンツ防衛（self-canonical）が成立していない。

## 2. 第5スプリント 実装要件・防衛アーキテクチャ
- **匿名フェッチへの置換**: `src/lib/supabase-anon-client.ts` から `createClient` を注入し、本番DBの `editorial_articles` テーブルからデータを取得する構造へ書き換える。
- **縦深防御ポリシー（重要）**: DB側のRLS防衛に依存せず、アプリケーションコード側でも必ず `.eq('publish_status', 'published')` の絞り込みクエリを明示的に執行せよ。合致しない、あるいはデータが null の場合は即座に Next.js の `notFound()`（404）へルーティングせよ。
- **SEO正典化**: `generateMetadata` を実装し、`app-concierge` の `/articles/[slug]` からポートしたロジックに基づき、動的パラメータを吸収する絶対 URL canonical を出力せよ。
