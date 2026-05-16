# STRATEGY_BRIEF_000_CONTEXT — プロジェクト統合コンテキスト (v1.1)

> 本ドキュメントは Gemini Gem（CSO）の **長期記憶** として機能する統合ブリーフである。
> 2 つの戦略会議（Gemini チャット「VODサイト収益化戦略提案」「VODサイト収益化戦略の再開」）と、
> Claude Code（CTO）の実装ログから抽出した **すべての決定事項・実装手順・パラメータ仕様・未解決課題** を凝縮する。
> 戦略変更があった場合は本ファイルを更新し、Gem ナレッジを差し替えて全 AI に同期させること。

---

## 0. プロジェクト・アイデンティティ

| 項目 | 内容 |
|---|---|
| 事業名 | VODNAVI GROUP |
| 北極星目標 | **2026 年 12 月までに月商 100 万円達成** |
| 北極星 KPI | 月間 15 万 PV × CVR 11.1%（マイルストーン別に逆算済み） |
| 事業モデル | 「3 サイト連携 × AI エグゼクティブ・チーム」による VOD アフィリエイト |
| メイン ASP | **FANZA（DMM アフィリエイト）** |
| 補完 ASP | U-NEXT・DMM TV 等（カバレッジ拡大／リスク分散／比較訴求の段階導入） |
| オーナー | Tachi（hdktchkw33@gmail.com / GitHub: dandy693） |
| Vercel チーム | hdktchkw33-gmailcoms-projects |
| リポジトリ | github.com/dandy693/VODNAVI-GROUP（main ブランチ） |
| 開発拠点 | Windows 11 ノート（PowerShell）／後日 Mac mini を追加し GitHub で同期 |

---

## 1. 3 サイト連携アーキテクチャ

| 役割 | サイト | URL | 技術 | ホスティング |
|---|---|---|---|---|
| **集客（入口）** | Moterist | moterist.com | WordPress + The Thor | mixhost |
| **信頼（権威）** | VODNavi | vodnavi.jp | WordPress + The Thor（再構築中） | mixhost |
| **成約（出口）** | Concierge App | app.vodnavi.jp | Next.js 16 App Router + Tailwind v4 + TypeScript | Vercel（hnd1 / Tokyo） |
| **実験（検証）** | Lab | kaikan-lab.com | WordPress | mixhost |

**ユーザー導線（North Star Flow）**
Moterist 記事（心理学・教養 → 読了直後の余韻）→ 末尾 CTA → `https://app.vodnavi.jp/concierge?source=moterist` → AI コンシェルジュ提案 → FANZA 成約

**戦略合意事項**
- moterist.com は「ドメインを捨てる」のではなく、「モテリスト＝モテるためのリスト」のコンセプトを活かして **AI 時代仕様に再構築**。過去記事は破棄せず AI でリライトして資産化。
- The Thor は SEO 性能・カスタマイズ性とも合格。デザインを 0 から作り直すのではなく、**「AI コンシェルジュへの送客」に最適化された情報設計**へ進化させる。
- VODNavi（公式ブランド）は「信頼・権威」を担う指名客向け窓口。app.vodnavi.jp の AI を信頼できるサービスとして担保する。
- Vercel は FANZA 規約上の懸念があるため、**サイト本体（成約ロジック）のみ Vercel に置き、アダルト直接表示・ASP リンクは別ドメインを経由させる方針**を継続検討。

---

## 2. AI エグゼクティブ・チーム

| 役職 | 担当 AI | 主な役割 | 主な参照ドキュメント |
|---|---|---|---|
| **CSO**（経営戦略最高責任者） | **Gemini 3（思考モード）** | ロードマップ策定／市場分析／STRATEGY_BRIEF 発行／矛盾チェック | MASTER_PLAN.md、KPI_DASHBOARD.md、本ファイル |
| **CTO**（技術最高責任者） | **Claude Opus 4.7（Claude Code）** | Next.js / Vercel 実装／CHANGELOG 更新／ブラウザ連携検証 | OPERATIONS_FLOW.md、CHANGELOG.md、STRATEGY_BRIEF_xxx.md |
| **CCO**（制作・集客最高責任者） | **ChatGPT 5.5 + Image 2** | 記事執筆／画像生成／コピーライティング／Moterist 構成 | MARKETING_PILLARS.md、ARTICLE_TEMPLATE.md |
| **HUMAN** | Tachi | AI 間のリレー仲介／最終承認／実務オペレーションのトリガー | TASK_BOARD.md |

**運用プロトコル**
- CSO → CTO への申し送りは `STRATEGY_BRIEF_xxx.md` 形式で発行（CTO がそのまま実装に着手できる粒度）。
- CTO は実装後に `CHANGELOG.md` を更新し、`TASK_BOARD.md` の Done に移す。
- CCO は CSO の指示でコピー・記事を生成。Moterist 側の WP 投稿に直接反映。
- HUMAN はリレー仲介、最終承認、PowerShell 実行など「物理的トリガー」担当。属人化を避けるため AI への指示はテンプレ化する。

---

## 3. ディレクトリ構造（モノレポ）

```
C:\Users\Tachi\projects\VODNAVI-GROUP\         # Git リポジトリ ルート
├─ app-concierge\                              # (旧 Documents\vodnavi-app) Next.js / Vercel 本体
│  ├─ src\app\(site)\page.tsx                  # トップページ（source パラメータ出し分け）
│  ├─ src\app\concierge\page.tsx               # AI コンシェルジュ本体
│  ├─ src\components\hero-section.tsx          # ヒーロー（チャネル別コピーを受け取る）
│  ├─ src\components\concierge\concierge-chat.tsx
│  ├─ src\lib\concierge\sources.ts             # source プロファイルの単一情報源
│  ├─ next.config.ts                           # redirects / security headers
│  └─ vercel.json                              # {"regions":["hnd1"],"github":{"silent":true}}
├─ site-moterist\                              # (旧 projects\moterist-ai-affiliate) WP 集客サイト
│  ├─ 00_admin\
│  ├─ 01_structure\                            # SITE_MAP.md（カテゴリー設計）等
│  ├─ 02_keywords\                             # 感情ナビ／教養レンズ／シチュ別キーワード
│  ├─ 03_content\                              # 記事原稿／CCO へのプロンプト
│  ├─ 06_prompts\
│  └─ 07_wp\                                   # THE_THOR_CONFIG.md（プラグイン・ウィジェット・CSS）
├─ site-brand\                                 # (将来) vodnavi.jp の WP 構成案置き場
├─ management\                                 # 司令部ドキュメント（このフォルダ）
│  ├─ README.md
│  ├─ MASTER_PLAN.md
│  ├─ AGENT_PROTOCOLS.md
│  ├─ AI_PROTOCOLS.md
│  ├─ MARKETING_PILLARS.md
│  ├─ OPERATIONS_FLOW.md
│  ├─ TASK_BOARD.md
│  ├─ REVENUE_LOG.md
│  ├─ KPI_DASHBOARD.md
│  ├─ COMPLIANCE_GUIDE.md
│  ├─ ARTICLE_TEMPLATE.md
│  ├─ CHANGELOG.md
│  ├─ STRATEGY_BRIEF_000_CONTEXT.md            # ← 本ファイル
│  └─ STRATEGY_BRIEF_001.md                    # 完了済（source 出し分けインフラ）
└─ .gitignore                                  # ルート 1 つに統合済（node_modules / .env を確実にブロック、.env.example は !.env.example で追跡）
```

**Git ルールの確定事項**
- `.git` はリポジトリ・ルート（VODNAVI-GROUP）に 1 つだけ。`app-concierge/.git` および `site-moterist/.git` は埋め込みリポジトリだったため、`git rm -r --cached <path>` → 再 `git add <path>` で実体統合済み（旧コミット例: `bfff7ab`, `e3fc1f0`, `d82d818`）。
- `.gitignore` はルートで集約管理。`node_modules/`（非アンカー）でサブディレクトリも含めて捕捉、`.env` / `.env.local` をブロック、`.env.example` は `!.env.example` で例外的に追跡可能。`git check-ignore` で動作確認済。
- 戦略・運用ドキュメントを含む `management/` も GitHub バックアップ対象（README.md でモノレポ全体構造を明示）。
- main への直接 push は CTO 側で auto-mode classifier に弾かれるケースがあるため、CTO がコミット → HUMAN が `git push` を実行する半自動運用に落ち着いている。

---

## 4. 技術スタック・実装到達点（CTO の完了レポート）

### 4.1 ランタイム / フレームワーク
- **Next.js 16.2.6（App Router）** / Tailwind CSS v4 / TypeScript。
- `searchParams: Promise<...>` の非同期 API を採用（Next.js 16）。`await searchParams` が動的レンダリングのトリガー。
- Route Segment Config はプロジェクト全体で `cacheComponents` 未使用のため引き続き有効：
  ```ts
  export const revalidate = 0;
  export const dynamic = "force-dynamic";
  ```

### 4.2 Vercel
- リージョン：`hnd1`（東京）固定。`vercel.json`:
  ```json
  { "regions": ["hnd1"], "github": { "silent": true } }
  ```
- セキュリティヘッダ（`next.config.ts` の `headers()`）：`X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, `Permissions-Policy`, `Referrer-Policy`。
- リダイレクト：`vercel.app` ドメイン → 正規ドメイン（`app.vodnavi.jp`）。
- レスポンスヘッダ確認済：`Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate` / `X-Vercel-Cache: MISS`（パラメータ毎に動的レンダリングされ、CDN キャッシュなし）。

### 4.3 流入元識別インフラ（STRATEGY_BRIEF_001 完了済）
- パラメータ：`?source=moterist | brand | default`（未知値 / 未指定は default にフォールバック）。
- 単一情報源：`app-concierge/src/lib/concierge/sources.ts`
  - `ConciergeSource = "default" | "moterist" | "brand"`
  - `ConciergeSourceProfile { id, greeting, systemAddendum }`
  - `resolveConciergeSource(raw)` が `Object.prototype.hasOwnProperty` で安全に解決。
- トップページ（`src/app/(site)/page.tsx`）：
  - `await searchParams` で `params.source` を取得 → `resolveConciergeSource` → `HeroSection` に伝播。
  - `selectHeroCopy(source)` の `switch` 文でチャネル別コピーを返却。`case "default"` と `default` の二重フォールバック構造。
- ヒーロー（`src/components/hero-section.tsx`）：`{ totalCount, source, copy: HeroCopy }` を受け取り、`badge / headlineLead / headlineHighlight(amber-300) / headlineTail / subcopy / ctaLabel` を描画。CTA は `/concierge?source=<id>` に内部リンク。
- AI コンシェルジュ側（`src/app/concierge/page.tsx`）：`searchParams.cids` から作品 ID を解決し、`resolveCidsToWorks()` で 3 件並列 fetch、`ConciergeChat` に注入することで「シェアされた結果ページの完全復元」を実現。

### 4.4 SNS シェア機能（CTO 実装完了）
- `src/components/concierge/concierge-chat.tsx` に `ShareToXButton` を追加。`buildShareText` で投稿テンプレを生成、`XLogo` をインライン SVG で実装。
- 投稿テンプレ：
  ```
  AI コンシェルジュが選んだ今夜の 3 本はこれ！
  [作品名 1] / [作品名 2] / [作品名 3]
  #vodnavi #AIコンシェルジュ <https://app.vodnavi.jp/concierge?cids=A,B,C>
  ```
- `?cids=` は **生コンマ（`A,B,C`）** で付与（`encodeURIComponent` で `%2C` 化すると Twitter のオートリンカが URL を途中で切るため、確認済の確実化対応）。
- 動的 OG 画像：Next.js 16 のメタデータルート規約 `opengraph-image.tsx` で `{ params }` のみ受け取り、`summary_large_image` 対応のカード（amber/gold グラデーション・PREMIUM VOD NAVIGATION ロゴ）を生成。
- GA4 イベント：`ai_share_click` を送信し、どのジャンルが拡散されやすいか分析可能。

### 4.5 既知の苦労ポイント（再発防止用）
- **Vercel Root Directory 罠**：モノレポ移行コミット `bc72ddc` 後、Vercel プロジェクトの Root Directory が `./` のままだったため、`pages/app` ディレクトリが見つからず 7〜10 秒でビルド失敗。Settings → Build and Deployment で **`app-concierge` に変更し Save** が解決。これは再発しやすいので注意。
- **Vercel ↔ GitHub 連携の切断**：`gh api .../hooks` が `[]`、`deployments` が `[]`、commit status が `pending`／`statuses: []` の状態は連携切断のサイン。Vercel Dashboard → Settings → Git で再接続。
- **動的レンダリングが効かない症状**：`?source` を読まないトップページ実装が原因。`searchParams` を実際に消費すること（`await` するだけでなく値を使うこと）と、保険として `export const dynamic = "force-dynamic"` を明示することで解決。
- **`vercel login` が `Waiting for authentication...` で止まる**：表示された device code（例：`BLNQ-SNBR`）をブラウザで承認する必要がある。
- **WordPress 既存ファイル管理**：`site-moterist` が「embedded git repository」として警告を出したのは、内部に独立した `.git` があったため。`git rm -r --cached site-moterist` → 中の `.git` を削除（または無視）→ `git add site-moterist` で実体統合完了。
- **画像生成の安全フィルター誤検知**：「申し訳ありません。安全ではない質問に対して画像を生成することはできません」で停止することがあるため、プロンプトのサニタイズ（アダルト関連語を安全用語に置換）または画像生成を無効化してテキストのみで応答するフォールバックが必要。

---

## 4b. ブランド・デザイン世界観の確定（『ビブリア・エロティカ』）

統合デザイン・ガバナンスは [`BRAND_DESIGN_GUIDE.md`](./BRAND_DESIGN_GUIDE.md) を **最高法律** として運用する。本ブリーフでは、その中核数値とインテント計装の必須要件のみを凍結し、3 サイトの外観・URL 計装を不可逆に統一する。

### 4b.1 カラーパレット（凍結）

| 役割 | 16 進 | RGB | 用途 |
|---|---|---|---|
| ベースカラー（70%） | **`#121212`** | `18,18,18` | リッチブラック。すべての背景 |
| メインテキスト（20%） | **`#E0E0E0`** | `224,224,224` | プラチナホワイト。本文・補助テキスト |
| アクセント / CTA（10%） | **`#D4AF37`** | `212,175,55` | シャンパンゴールド。クリッカブル領域の脳内条件付け |

- 純白 `#FFFFFF` / 純黒 `#000000` / ネオン系の直書きは PR 拒否事由。
- THE THOR（WordPress 2 サイト）と Tailwind v4（Next.js 2 アプリ）の双方で `#121212 / #E0E0E0 / #D4AF37` を共通変数として持つ。

### 4b.2 インテントパラメータ `&intent=` の動的計装（次フェーズの必須要件）

`?source=` で **どこから来たか** を識別する一方、`&intent=` で **何を求めているか** を識別する 2 軸計装に拡張する。これは KPI_DASHBOARD §3 のクロスドメイン構成と整合する形で、コンシェルジュ AI のプロンプト動的最適化（STRATEGY_BRIEF_002）の前提となる。

| 値 | 想定流入元 | コンシェルジュ側の挙動 |
|---|---|---|
| `&intent=beginner` | 1095（FANZA 初心者ガイド）／心理学系記事末尾 | 専門用語を避け、最初の 1 本に絞って提示。利用方法の案内を強化。 |
| `&intent=actress` | 1018（女優レビュー）／アクトレス・ハブ | 主演女優の出演傾向と類似作品を 1 本添える深掘り型プロンプトへ自動スイッチ。 |
| `&intent=discount` | 954（Evergreen Sale Hub）／キャンペーン記事 | セール対象に絞り、料金と期限を明記。コスパ重視ロジックを展開。 |
| _（未指定）_ | その他 | default トーンを維持（破壊しない）。 |

**実装責務（CTO）**
- `resolveConciergeIntent(raw)` を `sources.ts` と同じ粒度で新設。不正値・未指定は `null` に正規化。
- AI のシステムプロンプトに intent 別 addendum を追加（`source.systemAddendum` の末尾に連結）。
- GA4 `ai_session_start` に `intent` パラメータを追加し、`source × intent × CVR` の交差分析を可能にする。
- 末尾 CTA URL は **必ず** `?source=<id>&intent=<value>` の 2 パラメータ形式に統一（CCO レビューチェックリストに組み込む）。

**運用責務（CCO）**
- Moterist 配下の全ピラー記事末尾 CTA を、対象 page type に応じた `intent` 付き URL に差し替え：
  - 1095 / Beginner Guide → `?source=moterist&intent=beginner`
  - 954 / Evergreen Sale Hub → `?source=moterist&intent=discount`
  - 1018 / Pending Source Material → `?source=moterist&intent=actress`
  - 1106 / 994（汎用ガイド系）→ default のまま、または記事意図に応じて `beginner` を付与。

**監査責務（CSO）**
- 週次サタデー・レビュー（BRAND_DESIGN_GUIDE §6.1）にて `intent` 未指定リンクを抽出し、CCO に差し戻し指示を発行する。

### 4b.3 ASP 時間軸ロードマップと拡張性予備設計

[`BRAND_DESIGN_GUIDE.md`](./BRAND_DESIGN_GUIDE.md) §1「ASP時間軸ロードマップ」で確定した通り、ASP 露出は **時間軸で段階的に解放** する：

| フェーズ | 月商目標 | 露出 ASP | 露出箇所 |
|---|---|---|---|
| フェーズ1：基盤構築期 | 30 万円 | **FANZA 100% のみ** | Moterist 記事 / Concierge App / 全 CTA |
| フェーズ2：拡大加速期 | 100 万円 | FANZA + DMM TV + U-NEXT（**裏メニュー扱い**） | Concierge App 内のポップアップ / 特定 intent 条件のみ |

ただし、フェーズ 2 でも **Moterist の集客記事には他社 ASP を一切露出させない**。集客面の単純さを保ち、AI 接客面でのみ複雑性を許容する。

**マルチASP拡張性の予備設計（CTO への必須要求）**

将来 DMM TV / U-NEXT の **滑らかな追加（プラグイン的拡張）** に備え、Next.js アプリ側のデータ構造には**初期段階から `asp_name` フィールドを保持** させる。

- **DB スキーマ**：`recommendations` / `messages` / `sessions` 各テーブルに `asp_name TEXT NOT NULL DEFAULT 'fanza'` カラムを設置（`docker-env/postgres/init/01_schema_conversations.sql` も対象）。
- **API レスポンス型**：`ConciergeWork` 等の作品関連型に `asp_name: 'fanza' | 'dmm_tv' | 'u_next'` を必須フィールドとして含める。
- **GA4 イベント**：`product_click` / `ai_affiliate_click` に `asp_name` パラメータを追加する。
- **アフィリエイト URL ビルダ**：`buildAffiliateURL(asp, contentId, ...)` の形で抽象化し、ASP ごとの URL 生成を 1 箇所に集約する。

フェーズ 1 期間中も **すべての値は `'fanza'` で固定** するが、データ構造とコード経路を初めから多 ASP 対応にしておくことで、フェーズ 2 突入時の改修コストを「カラム追加・新 ASP 用 URL ビルダ追加」のみに圧縮する。

---

## 5. チャネル別コピー仕様（チャネル × トーン × CTA）

最新の本番反映を本ファイルに凍結する（修正は本ファイルを更新してから実装に反映）。

### 5.1 `?source=moterist`（特攻隊長 / Moterist 流入）
- **ターゲット心理**：心理学・教養を読み終わったばかりで「迷いを断ち切りたい」「最速で結論が欲しい」即決・行動派。
- **バッジ**：`MOTERIST EXPRESS`
- **見出し**：「最短 30 秒、迷いを断つ。VOD 選びの **特攻隊長**、起動。」
- **サブコピー**：「どの VOD が一番得か？今すぐ観れるのはどこか？コスパとスピードを重視した最速の結論を、限定 AI が即答します。」
- **CTA ラベル**：「特攻隊長 AI を起動」
- **挨拶（greeting）**：「Moterist の記事から、いらしてくださったのですね。お読みいただきありがとうございます。\n\nあの記事のテーマは、ここから先のあなたの夜に静かに繋がっています。今夜のお気持ちを一言、お聞かせください。」
- **システム指示追加（systemAddendum）**：「【流入コンテキスト】このユーザーは moterist.com（心理学・教養系のメディア）の記事から流入しています。知的な比喩や情景描写を、いつもより一段だけ深くしてかまいません。記事の余韻を壊さないよう、最初の応答は静かに受け止める姿勢を強めてください。」

### 5.2 `?source=brand`（プレミアム / 指名客）
- **ターゲット心理**：ブランド検索で公式に辿り着いた「信頼・質重視」の指名客。
- **バッジ**：`VODNAVI PREMIUM`
- **見出し**：「VOD ナビ・**プレミアム**。あなたに相応しい、至高の視聴体験を。」
- **サブコピー**：「数あるサービスの中から、あなたのライフスタイルと好みに調和する一本を。信頼と実績に基づいた、唯一無二のコンシェルジュ。」
- **CTA ラベル**：「プレミアム・コンシェルジュへ」
- **挨拶**：「VODNAVI 公式から、いらっしゃいませ。コンシェルジュをご指名いただき光栄です。\n\nまずは今夜の気分から伺いましょう。「癒し」「刺激」「没入」── どの方向でも、的確に一本お選びいたします。」
- **systemAddendum**：「【流入コンテキスト】このユーザーは vodnavi.jp（公式ブランドサイト）からの来訪です。コンシェルジュ体験の信頼性・選定の確かさを、最初の一本でしっかり示してください。提案の根拠を一言だけ丁寧に添えると効果的です。」

### 5.3 `default`（通常 / 未指定・未知値）
- **ターゲット心理**：一般客（比較・検討派）。「VOD おすすめ」「料金」「画質」などの比較検索流入。
- **バッジ**：`AI VOD CONCIERGE`
- **見出し**：「あなたに、**最高の『観たい』**を。VOD コンシェルジュがご案内します。」
- **サブコピー**：「作品数、料金、画質。あらゆる角度から比較して、あなたにぴったりの VOD サービスを無料で見つけ出します。」
- **CTA ラベル**：「AI コンシェルジュに相談する」
- **挨拶**：「ようこそ。VODNAVI のコンシェルジュです。今夜のお気持ち、教えていただけますか。\n\n「疲れた一日を癒したい」「ふと刺激が欲しくなった」「久しぶりに濃いものを観たい」── 一言で構いません。最適な一本をお選びいたします。」
- **systemAddendum**：（空文字）

### 5.4 実装上の不変条件（CSO / CTO 共通の判断軸）
- 三項演算子 / `switch` 文で可読性の高い条件分岐を実装。
- `source` が `null` / `undefined` / 未知値の場合は **必ず通常版を返す**（`case "default"` と `default:` の二重保険）。
- `sources.ts` は単一情報源。コピー文を書き換える時はここ → 必要に応じてトップページ `selectHeroCopy` の同期。

---

## 6. デプロイ手順（恒久マニュアル）

### 6.1 通常デプロイ（git push 経由・推奨）
1. ローカルで CTO が実装 → コミット。
2. `git push origin main`（HUMAN）。
3. Vercel が webhook 経由で自動ビルド。
4. 本番 URL：`https://app.vodnavi.jp`。

### 6.2 手動デプロイ（CLI・緊急時のみ）
```powershell
# 1. CLI インストール（初回のみ）
npm install -g vercel

# 2. ログイン（初回のみ。表示された device code をブラウザで承認）
vercel login   # → "Continue with GitHub"

# 3. 本番デプロイ（app-concierge ディレクトリで実行）
cd C:\Users\Tachi\projects\VODNAVI-GROUP\app-concierge
npx --yes vercel --prod --yes
```

### 6.3 デプロイ後の確認 3 ステップ
1. **シェアボタン視覚確認**：`https://app.vodnavi.jp/concierge` で AI と会話し、3 枚カードの下に X ロゴ付きボタンが表示されるか。
2. **投稿テキスト検証**：シェアボタン → 立ち上がる X 画面で作品名 + `#vodnavi #AIコンシェルジュ` が正しくセットされているか。
3. **OG カード検証**：X / カードバリデーターで「PREMIUM VOD NAVIGATION」のゴールドロゴが大きく表示されるか。
4. **3 チャネル動作確認**：
   - `https://app.vodnavi.jp/?source=moterist` → 「MOTERIST EXPRESS」「特攻隊長」
   - `https://app.vodnavi.jp/?source=brand` → 「VODNAVI PREMIUM」「プレミアム」「至高の視聴体験」
   - `https://app.vodnavi.jp/` → 「AI VOD CONCIERGE」「最高の『観たい』」「VOD コンシェルジュ」
5. **キャッシュ確認**：`curl -I` で `X-Vercel-Cache: MISS` / `Cache-Control: no-store` が出ること。

### 6.4 トラブル対応
- ビルド即時失敗（7〜10 秒）→ **Vercel Root Directory が `./` に戻っていないか確認**。正しくは `app-concierge`。
- 自動デプロイが走らない → Vercel Dashboard → Settings → Git で GitHub 連携を再接続。
- 旧版が表示される → ブラウザのハードリロード（`Ctrl + F5`）／Vercel 環境変数の本番側設定不足も確認。

---

## 7. マーケティング戦略（Moterist 集客 3 本柱）

「VOD おすすめ」を直接狙わず、**ユーザーの感情の「手前」を捕まえる**心理学・教養軸の集客サイト。

| 柱 | コンセプト | トーン | コンテンツ例 |
|---|---|---|---|
| **感情ナビ** | 今夜の気分で選ぶ作品 | 寄り添い | 「金曜の夜、自分を肯定したい時に観るべき 5 本」 |
| **教養レンズ** | 心理学・哲学で映画を再解釈 | 知的 | 「ユング『シャドウ』で読み解く名作 3 選」 |
| **シチュエーション** | ひとり時間・週末・深夜の最適化 | 実用 | 「日曜の朝、罪悪感なく寝直したい時に流すべき映画」 |

**運用ルール**
- すべての記事末尾 CTA を `https://app.vodnavi.jp/concierge?source=moterist` に統一。
- 「アダルト直アフィ」よりも先に「コンシェルジュ体験」を踏ませることで、ASP 規約・サイト信頼性・CVR をすべて両立。
- 過去記事は破棄せず、CCO が「悩みに寄り添う文章」へリライト → 資産化。

**ASP 戦略の段階導入**
- フェーズ 1：FANZA 1 本軸で仕組みを完成させ、CVR / 単価のベースラインを確立。
- フェーズ 2：U-NEXT（一般作・アニメ・ポイント訴求）／DMM TV（月額安価訴求）等を、キーワード別に出し分ける形で追加（`ASP_STRATEGY.md` で管理予定）。
- AI コンシェルジュ強み：「FANZA ならこの作品、U-NEXT ならポイントで無料」等の **比較提示** で信頼感・CVR を底上げ。

---

## 8. 現状の課題と次のステップ

| 優先 | カテゴリ | 課題 | アサイン | 関連 BRIEF |
|---|---|---|---|---|
| ⭐⭐⭐ | AI / 体験 | AI コンシェルジュのプロンプト動的最適化（`source` 別キャラ／提案ロジック切り替え） | CSO → CTO | STRATEGY_BRIEF_002（未発行） |
| ⭐⭐⭐ | コンプラ | 画像生成の安全フィルター誤検知対策（プロンプト・サニタイザー実装） | CTO | — |
| ⭐⭐ | 収益管理 | ASP（FANZA）の `sid1` 等にパラメータを自動引き継ぐスクリプト／`REVENUE_LOG.md` 自動反映／流入元別 CVR 計測 | CTO | — |
| ⭐⭐ | Moterist | 過去 ChatGPT セッションの構成案を `site-moterist/01_structure/SITE_MAP.md` 等へ完全ドキュメント化 | CCO | — |
| ⭐⭐ | コンテンツ | `CONTENT_CALENDAR.md`（または `SEO_KEYWORD_MATRIX.md`）：何をいつどのサイトで出すか | CSO + CCO | — |
| ⭐⭐ | ASP 管理 | `ASP_AFFILIATE_CONFIG.md`：source → ASP SID 対応表、成果地点／単価／特単交渉進捗 | CSO | — |
| ⭐ | コンテンツ | FANZA 作品マスターリスト：教養レンズ／感情ナビで使う作品の選定基準 | CCO | — |
| ⭐ | コンプラ | FANZA（アダルト・準アダルト）と U-NEXT（一般）混在時の見せ方ルールを `COMPLIANCE_GUIDE.md` に追記 | CSO | — |
| ⭐ | インフラ | Mac mini を 2 拠点目として GitHub 経由で同期 | HUMAN | — |
| ⭐ | UX | Supabase 連携で AI コンシェルジュの会話履歴を保存し、再訪時に復元 | CTO | — |

**次に発行すべきブリーフ**：`STRATEGY_BRIEF_002 — source 別 AI コンシェルジュ・プロンプト動的最適化`
（特攻隊長：結論を急ぐ最短回答／プレミアム：丁寧・網羅／通常：標準）

---

## 9. 直近コミット履歴（実装の歩み）

| Commit | 内容 |
|---|---|
| `bfff7ab` | README.md・TASK_BOARD.md 等 4 ファイル・302 行追加（モノレポ全体構造を明文化） |
| `e3fc1f0` | feat(management): 経営司令部ディレクトリと共有メモリプロトコルを構築（MASTER_PLAN / AGENT_PROTOCOLS / AI_PROTOCOLS 新規） |
| `d82d818` | 関連 push 同期 |
| `bc72ddc` | プロジェクト構造の再構築（app-concierge を `app-concierge/` サブディレクトリへ）← Vercel Root Directory 罠の起点 |
| `51bcf9c` | fix(site): トップページで ?source パラメータを受け取って Hero を切替 |
| `66c1c7c` | chore(site): トップページに dynamic='force-dynamic' を明示 |
| `65ea959` | feat(site): チャネル別 Hero コピー（特攻隊長 / プレミアム / 通常）を switch で適用 |
| `1af7667` | chore: trigger Vercel re-deploy after GitHub integration restore |
| `5cbab45` | chore: add vercel.json (regions hnd1 / github silent) |
| `58057dc` | chore: trigger redeploy after Vercel Root Directory fix to app-concierge |

---

## 10. 運用ルール（共有メモリの整合性）

- 戦略変更は **必ず `management/` 配下の MD ファイルを更新** し、Gem ナレッジを最新版に差し替えてから全 AI に同期させる。
- `TASK_BOARD.md` の Backlog を常に最新にし、AI が自律的に次の一手を選べる状態を維持する。
- 本ファイル（`STRATEGY_BRIEF_000_CONTEXT.md`）は Gem の **長期記憶の核**。バージョン番号（v1.x）を上げる形で更新し、過去版は履歴から辿る。
- 環境変数 `.env*` は絶対に Git に乗せない（`.env.example` のみ追跡）。Vercel 側の Environment Variables との突き合わせを定期的に行う。
- ブラウザ自動化（CTO の `--browser` フラグや Claude Code の Chrome 連携）で確認した内容は、結果の数値・スクリーンショット・URL を CHANGELOG に必ず残す。

---

*v1.1 — 2 つの戦略会議チャットと CTO 実装ログから抽出。次回更新時はバージョン番号を上げること。*
