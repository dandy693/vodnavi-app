# VODNAVI-GROUP

VOD アフィリエイト事業「VODNAVI」の運営モノレポ。**3 サイト連携 × AI エグゼクティブ・チーム**で 2026 年 12 月までに月商 100 万円を達成するためのリポジトリです。

## 全体像

```
集客  ── Moterist (moterist.com)        ──┐
                                          ▼
信頼  ── VODNavi (vodnavi.jp)            ──┐
                                          ▼
成約  ── Concierge App (app.vodnavi.jp)  ──→ FANZA
```

- **Moterist**：心理学・教養を軸とした WordPress 集客サイト。
- **VODNavi (Brand)**：公式ブランドサイト。コンシェルジュの権威性と安心感を担保。
- **Concierge App**：Next.js 製の AI コンシェルジュ。成約の核心部。

詳細な戦略は [`management/MASTER_PLAN.md`](management/MASTER_PLAN.md) を参照。

## ディレクトリ構成

| パス | 役割 | 主な技術 |
| --- | --- | --- |
| [`app-concierge/`](app-concierge/) | **成約サイト** `app.vodnavi.jp`。AI コンシェルジュ本体。 | Next.js 16 (App Router) / TypeScript / Tailwind CSS v4 / shadcn/ui / Anthropic API |
| [`site-brand/`](site-brand/) | **ブランドサイト** `vodnavi.jp`。サービス紹介・信頼性訴求。 | (構築予定) |
| [`site-moterist/`](site-moterist/) | **集客サイト** `moterist.com` の運用資産。記事原稿・分析・WP テーマ等。 | WordPress / Markdown 原稿 / スクリプト |
| [`management/`](management/) | **AI エグゼクティブ・チームの共有メモリ**。戦略・プロトコル・進捗ログ。 | Markdown |
| [`docker-env/`](docker-env/) | ローカル開発・検証用の Docker 環境定義。 | Docker / Docker Compose |

### `app-concierge/` のサブ構造（抜粋）

| パス | 用途 |
| --- | --- |
| `src/app/` | App Router（`/`, `/concierge`, `/api/*`） |
| `src/components/` | UI コンポーネント（`concierge/`, `product-*` など） |
| `src/lib/fanza/` | FANZA API クライアントと型定義 |
| `src/lib/concierge/` | コンシェルジュのプロファイル・プロンプト関連 |

### `management/` の主要ドキュメント

| ファイル | 内容 |
| --- | --- |
| [`MASTER_PLAN.md`](management/MASTER_PLAN.md) | 究極目標と 3 サイト連携戦略 |
| [`AGENT_PROTOCOLS.md`](management/AGENT_PROTOCOLS.md) | AI エージェント間の連携プロトコル |
| [`AI_PROTOCOLS.md`](management/AI_PROTOCOLS.md) | 各 AI ツールの活用ガイドライン |
| [`OPERATIONS_FLOW.md`](management/OPERATIONS_FLOW.md) | 開発 → デプロイ → コンテンツ生成の実務フロー |
| [`TASK_BOARD.md`](management/TASK_BOARD.md) | Backlog / In Progress / Done の進捗管理表 |
| [`STRATEGY_BRIEF_*.md`](management/) | CSO 発行の戦略ブリーフ（連番） |
| [`CHANGELOG.md`](management/CHANGELOG.md) | エージェント横断の作業ログ（逆時系列） |

## AI エグゼクティブ・チーム

| 役割 | 担当 AI | 主な責務 |
| --- | --- | --- |
| **CSO**（経営戦略） | Gemini 3（思考モード） | 戦略策定、市場分析、`STRATEGY_BRIEF_*.md` の発行 |
| **CTO**（技術実装） | Claude Opus 4.7 | コード設計・実装、`CHANGELOG.md` への記録 |
| **CCO**（制作・集客） | ChatGPT 5.5 + Image 2 | 記事執筆、画像生成、SNS 拡散 |

人間（オペレータ）は GitHub を「共有メモリ」として AI 間のリレーを仲介します。詳細は [`management/AGENT_PROTOCOLS.md`](management/AGENT_PROTOCOLS.md) と [`management/OPERATIONS_FLOW.md`](management/OPERATIONS_FLOW.md) を参照。

## クイックスタート

### app-concierge をローカルで動かす

```bash
cd app-concierge
cp .env.example .env.local        # 値を埋める
npm install
npm run dev                       # → http://localhost:3000
```

必要な環境変数は [`app-concierge/.env.example`](app-concierge/.env.example) を参照。

### VS Code で全体を開く

ルートの `VODNAVI-GROUP.code-workspace` をダブルクリックすると、全サブプロジェクトがマルチルートワークスペースで開きます。

## 運用ルール

- すべての戦略・進捗ドキュメントは Markdown で `management/` 内に保存する。
- 成果物は必ず GitHub へプッシュし、他エージェントが参照できる状態を保つ。
- 秘匿情報（API キー等）は `.env.local` に置き、リポジトリには `.env.example` のみコミットする。
