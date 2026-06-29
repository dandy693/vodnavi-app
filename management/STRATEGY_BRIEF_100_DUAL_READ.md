# STRATEGY_BRIEF_100: site-brand [slug] のDual-Read配線とインフラ自爆防衛

## 1. 物理監査結果によるリスク特定
- ローカルFSに存在する正規記事7件が本番DB（public.editorial_articles）に存在しない。
- 暫定処置として、DBフェッチ単一化をAbortし、データの並行移行期間を担保する「Dual-Readアーキテクチャ」を採用する。

## 2. 第5スプリント 実装要件・防衛コード設計
- **第一フェーズ（DBフェッチ）**: `src/lib/supabase-anon-client.ts` を用い、`[slug]` パラメータに合致する記事をDBから検索する。この際、`.eq('publish_status', 'published')` の縦深防御クエリを執行する。
- **第二フェーズ（FSフォールバック）**: DBからの返却値が null の場合、即座に 404 とせず、レガシーなファイルシステム（`03_content/`）から `readFileSync` でマークダウンを探索・描画する。DB・FSのいずれにも存在しない場合のみ、Next.js の `notFound()` へルーティングする。
- **SEO正典化（self-canonical）**: `generateMetadata` を実装し、DB由来・FS由来を問わず、動的パラメータを吸収する絶対URL canonical（`[https://vodnavi.jp/](https://vodnavi.jp/)[slug]`）を確実に出力せよ。
