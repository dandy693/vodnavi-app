# STRATEGY BRIEF 085 — Supabase Pro 移行 & 段階的 PoC 執行計画

発行: 2026-06-28 / 採番: 084 の次 = **085**（080 gap は保全・未使用）/ 統括: VODNAVI CSO
ステータス: **HUMAN 承認 2026-06-28 — Option B のみ**（Supabase Pro $25/mo + 段階的 PoC 着手）。**完全遷都（Option C full migration）は未承認** — 本 PoC の実測結果で別決裁。

> 本書は CSO script `run_strategy_update.sh` の意図を CTO が事実整合補正して起票。原 script の補正点: (a) root 配置/未採番 → `management/` + 採番 085、(b) `?sort= → noindex` 記述は `e82a670` で確定した **canonical 統制**と矛盾するため削除、(c)「Middleware で noindex」は層違い（noindex は metadata 層、age gate は `proxy.ts`）、(d) script の「HUMAN承認済」自己宣言ではなく、HUMAN の明示選択（Option B）を受けた正規記録。

## 1. スコープと不変ガード
- **承認範囲**: Supabase **Pro プラン ($25/mo)** 契約 ＋「ドラフトスキーマ × FANZA-API データを Supabase で保持・サーブできるか」の **mock 10 件 PoC** まで。
- **未承認（明示）**: 本番全データ一斉移行 / app-concierge の Supabase 完全遷都。PoC の性能・コスト・運用検証後に**別決裁**。
- **配置不変**: 成人/FANZA 本文は `app.vodnavi.jp` 年齢ゲート内に限定（BRIEF_076 / `proxy.ts`）。

## 2. セキュリティ要件
- `SUPABASE_SERVICE_ROLE_KEY` は **RLS をバイパスする高権限シークレット** → **サーバーサイド限定**、クライアント露出厳禁。
- Vercel 環境変数への配線は **HUMAN 手動**（[[reference_vercel_env_secret_write_blocked]]: secret 書込は classifier deny、Dashboard 手動が確定ルート）。リポジトリへの値/コード混入ゼロ。
- anon(public) キーと service_role キーを取り違えない。RLS ポリシーは PoC 段階から有効化。

## 3. SEO/インデックス方針（`e82a670` の最高法律に同期）
- **`?sort=` 等のクエリ URL**: 個別 noindex 注入は **しない**。各動的ページの **self-canonical（クエリ除去）で consolidation**（既存 works/genres/actresses と同方式 = `generateMetadata` の `alternates.canonical`）。noindex は consolidation を阻害するため禁止。
- **robots/noindex の実装層**: Next.js の **metadata 層（`generateMetadata` の `robots`）＋ `robots.ts`**。**`proxy.ts`（age gate）や "middleware" では行わない**。
- 動的コンテンツは固有 `slug` 付き正規化 URL を持つ（例 `/articles/[slug]`）。

## 4. PoC 段階（第1段階のみ承認）
1. Supabase Pro プロジェクト作成（HUMAN）＋ `SUPABASE_SERVICE_ROLE_KEY` Vercel 手動配線（HUMAN）。
2. ドラフトスキーマ（付録A）を **レビュー用**に定義（本番 DDL ではない）。
3. mock 10 件で FANZA-API データ → Supabase 保持 → Next.js `/articles/[slug]` サーブの疎通検証。
4. 性能・コスト・スリープ無しを実測 → 完全遷都の是非を**別決裁**。

## 5. 次の HUMAN 決裁ステップ
- [ ] 1. HUMAN: Supabase Pro 契約 ＋ Vercel 環境変数手動配線の完了報告
- [ ] 2. HUMAN: ドラフトスキーマ＋ mock PoC 検証コードの実行承認

## 付録A. ドラフトスキーマ（レビュー用・本番 DDL ではない）
- `editorial_articles`: `id uuid PK` / `title text` / `slug text UNIQUE` / `meta_description text` / `intro_template text` / `created_at timestamptz`
- `article_products`: `id uuid PK` / `article_id uuid → editorial_articles` / `content_id text`（実在品番）/ `floor_code text` / `sort_order int`
  - **注（ID 抽象化遵守）**: 原 script の `affiliate_url` raw 保存は**不採用**。af_id は既存 `lib/concierge/url-builder.ts`（env 由来）で**実行時生成**する（[[reference_dmm_affiliate_id_registry]]）。
- `brand_assets`: `key text PK` / `value jsonb`
  - **注**: 既存 frozen design-token（`#121212` / `#D4AF37`）との二重管理にならないか要検討。単一ソース原則を崩さない。
