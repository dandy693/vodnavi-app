# KPI DASHBOARD — 漏斗別目標値

北極星目標：**2026 年 12 月までに月商 100 万円**。
この目標から逆算したフェーズ別 KPI と、それぞれの責任所在・計測ソースを定義する。実績推移は [`REVENUE_LOG.md`](./REVENUE_LOG.md) を参照。

## 漏斗の全体像

```
[集客]      [送客]            [クリック]       [成約]
 PV       →  App 遷移      →  作品表示     →  CV (FANZA 購入)
Moterist     /concierge       商品カード      アフィ報酬
記事 PV      へのクリック     のクリック       発生
```

各フェーズの定義：

| フェーズ | 略号 | 計測 | データソース |
| --- | --- | --- | --- |
| **集客**：PV | PV | Moterist の月間記事 PV | GA4 (moterist.com プロパティ) |
| **送客**：App 遷移 | CTR_app | PV → `app.vodnavi.jp/concierge` への遷移率 | GA4 outbound link + app 側 `source=moterist` セッション数 |
| **クリック**：作品表示 | CTR_prod | コンシェルジュセッション → FANZA 商品カードクリック率 | app 側カスタムイベント `product_click` |
| **成約**：CV | CVR | 商品クリック → FANZA 確定購入 | FANZA アフィリエイト管理画面 |

## 北極星到達のための逆算

**月商 100 万円 / 平均報酬単価 ¥2,000 = 月 500 件の CV 必要**（FANZA VOD は単価レンジが広いため、ここでは保守的に ¥2,000 と置く）。

| フェーズ | 必要量 / 月 | 必要率 |
| --- | ---: | ---: |
| 集客 PV (Moterist) | **150,000** | — |
| App 遷移 | 9,000 セッション | CTR_app **6.0%** |
| 作品表示クリック | 4,500 クリック | CTR_prod **50%**（コンシェルジュ提案 → 1 件以上クリック） |
| CV | **500 件** | CVR **11.1%**（クリック → 購入） |
| 売上 (@¥2,000) | **¥1,000,000** | — |

> CVR 11% は FANZA VOD アフィ業界では強気だが、AI コンシェルジュによる「文脈に合致した提案」が成立すれば不可能な数字ではない、という前提で設計。崩れたら経路（流入元別の addendum / 提案ロジック）から見直す。

## マイルストーン別 KPI

| マイルストーン | 期限 | 売上 | PV | App 遷移 | 作品 CTR | CV |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| **M0** ベースライン | 2026-05 | — | 計測開始 | 計測開始 | 計測開始 | 計測開始 |
| **M1** 検証期 | 2026-07 | ¥100,000 | 15,000 | 600 | 50% | 50 |
| **M2** 拡大期 | 2026-09 | ¥300,000 | 45,000 | 2,250 | 50% | 150 |
| **M3** 加速期 | 2026-11 | ¥700,000 | 105,000 | 5,250 | 50% | 350 |
| **M4** 北極星 | 2026-12 | **¥1,000,000** | **150,000** | **9,000** | **50%** | **500** |

## フェーズ別の責任所在と打ち手

### 集客 (PV)
- **責任**: CCO (ChatGPT 5.5 + Image 2)
- **打ち手**: [`MARKETING_PILLARS.md`](./MARKETING_PILLARS.md) で定義する 3 本柱キーワードでの記事量産。
- **モニタ**: 週次 PV、上位 10 記事の流入クエリ。

### 送客 (App 遷移)
- **責任**: CCO（記事内 CTA 設計）+ CTO（着地体験）
- **打ち手**:
  - 各記事末尾 CTA を `https://app.vodnavi.jp/concierge?source=moterist` に統一（[`TASK_BOARD.md`](./TASK_BOARD.md) Backlog 参照）。
  - vodnavi.jp ブランドサイトの「コンシェルジュへ」リンクには `?source=brand`。
- **モニタ**: GA4 で `source=moterist` セッション数 / 全 PV 比。

### クリック (作品表示)
- **責任**: CTO (Claude Opus 4.7)
- **打ち手**:
  - コンシェルジュの初期挨拶・提案ロジックの精度向上（STRATEGY_BRIEF_NNN ベース）。
  - 商品カード UI / CTA 文言のチューニング。
- **モニタ**: `product_click` イベント / セッション。

### 成約 (CV)
- **責任**: CTO（提案精度）+ FANZA 側（在庫・価格・LP）
- **打ち手**:
  - source 別 system addendum のチューニング。
  - 提案数を絞る（多すぎると CVR が落ちる仮説）。
- **モニタ**: FANZA 管理画面の確定報酬。

## 観測ダッシュボード

### 解析アカウント

| 項目 | 値 |
|---|---|
| 所有 Google アカウント | **`moterist.com@gmail.com`（モテリスト 様）** |
| マルチログイン時のパス | `?authuser=2` / `/u/2/` |
| 最終確認日 | 2026-05-16（F-04 / F-03 実装＆検証完了） |

> 全 Google サービス（Search Console / Tag Manager / GA4）を開く際は **必ずアバターで `moterist.com@gmail.com` を確認** すること。デフォルト（`/u/0/`）は `hdktchkw33@gmail.com` になりがち。

---

### 1. Google Search Console（所有権確認状況）

| ドメイン | 種別 | 状態 | 確認日 |
|---|---|---|---|
| `moterist.com` | URL プレフィックス（`https://moterist.com/`） | ✅ 登録済・所有権確認済 | 2026-05-16 |
| `vodnavi.jp` | ドメインプロパティ（DNS） | ✅ 登録済・所有権確認済 | 2026-05-16 |
| `app.vodnavi.jp` | ドメインプロパティ（DNS） | ✅ 登録済・所有権確認済 | 2026-05-16 |

**評価**：3 ドメインすべて登録・検証完了。**追加作業なし**。

---

### 2. Google Tag Manager（コンテナ状況）

| アカウント | コンテナ | コンテナ ID | 紐付くサイト |
|---|---|---|---|
| `kit-planning.net` | `kit-planning.net`（ウェブ） | `GTM-NXW8R6GS` | kit-planning.net（本プロジェクト外） |

| 対象ドメイン | GTM コンテナ | コード埋め込み |
|---|---|---|
| `moterist.com` | ❌ **未作成** | ❌ HTML に `GTM-` なし（`gtag.js` 直設置） |
| `vodnavi.jp` | ❌ **未作成** | ❌ HTML に `GTM-` なし（`gtag.js` 直設置） |
| `app.vodnavi.jp` | ❌ **未作成** | ❌ コード上も `googletagmanager.com/gtag/js` 直読込のみ（`src/components/google-analytics.tsx`） |

**評価**：本プロジェクト 3 ドメインに **GTM コンテナは 1 つも存在しない**。現状すべて **`gtag.js` 直設置型**で運用されている。

**判断**：当面 GTM は導入しない方針で問題ない。ただし、将来 ASP リダイレクト計測や A/B テストを増やす場合は **3 ドメイン共通の GTM コンテナを 1 つ作る**ことを検討（ピクセル乱立を避けるため）。

---

### 3. GA4 プロパティ & データストリーム（**最新構成**）

採用アーキテクチャ：**vodnavi.jp + app.vodnavi.jp を 1 ストリーム共有**（GA4 公式推奨。ユーザージャーニーを途切れさせない）。

| プロパティ | アカウント / 名称 | プロパティ ID | ストリーム ID | 測定 ID（GA4） | Google タグ ID | 計装ドメイン |
|---|---|---|---|---|---|---|
| **VOD 成約系** | VODまとめ研究所 (355462253) | `489519780` | `11225897844` | **`G-GG7JV9MJRW`** | `GT-PZQ74Z7D` | `vodnavi.jp` + `app.vodnavi.jp`（共有）|
| **Moterist 集客** | モテリスト (275986901) | `393864941` | （別） | **`G-5HYV772ER9`** | — | `moterist.com` |

**本番 HTML から検出された実タグ**：

| ドメイン | 本番 HTML で発火している ID | 期待値との一致 |
|---|---|---|
| `moterist.com` | `G-5HYV772ER9`（**linker 設定済**） | ✅ 一致（F-11 完了） |
| `vodnavi.jp` | `GT-PZQ74Z7D`（→ G-GG7JV9MJRW 転送、GSK 経由） | ✅ 一致（F-01 完了、2026-05-16） |
| `app.vodnavi.jp` | `G-GG7JV9MJRW` | ✅ 共有設計通り |

---

### 4. カスタムイベント（コード ↔ 期待仕様の突合）

| イベント | コード実装 | 計測状態 | パラメータ |
|---|---|---|---|
| **`ai_session_start`** | ✅ `concierge-chat.tsx`（`useRef` で重複ガード） | ✅ **本番で発火確認済** | `source` / `shared` / `transport_type` |
| **`product_click`** | ✅ `concierge-chat.tsx`（カード & CTA 両クリック） | ✅ 実装デプロイ済 | `content_id` / `title` / `floor_code` / `placement` / `link_target` / `transport_type` |
| `ai_recommendation_view` | ✅ `concierge-chat.tsx:132` | ✅ | `recommendation_count` / `content_ids` |
| `ai_share_click` | ✅ `concierge-chat.tsx` | ✅ | — |
| `ai_affiliate_click` | ✅ `concierge-chat.tsx`（`product_click` と併発、後方互換用） | ✅ | `content_id` / `title` / `floor_code` |
| `fanza_cta_click`（moterist.com 側） | ✅ 1106 で実装中 | ⚠️ ハンドラ条件（`outline_1__9` 必須）が厳しすぎ Day 10 で緩和予定 | — |

**`track()` ヘルパーの race-condition 対策**（`src/lib/analytics.ts`）：
- `<Script strategy="afterInteractive">` が gtag.js 読込を遅延させ、`useEffect` 内 `track()` 呼出時点で `window.gtag` 未定義となる問題を検出（commit `f6bb348` 後の検証で発覚）。
- 修正（commit `ea6adef`）：`window.gtag` 未定義時は `window.dataLayer.push(['event', name, params])` として直接 push。gtag.js ロード時にキューが消化される。本番で `ai_session_start` 発火確認済。

---

### 5. クロスドメイン計測（タグ設定の構成 > ドメインの設定）

**✅ 設定完了**（G-GG7JV9MJRW タグ、2026-05-16）：

| マッチタイプ | ドメイン | 用途 |
|---|---|---|
| 完全一致 | `vodnavi.jp` | WordPress 信頼サイト |
| 含む | `app.vodnavi.jp` | Next.js 成約アプリ |

Vercel プレビュー URL（`vodnavi-*-hdktchkw33-*.vercel.app`）の候補は本番ノイズ排除のため削除。

**`app-concierge` 側（送信／受信両方）**：`src/components/google-analytics.tsx` の `gtag('config', ...)` で：
```js
linker: {
  domains: ['moterist.com', 'vodnavi.jp', 'app.vodnavi.jp'],
  accept_incoming: true
}
```
を明示。本番 dataLayer で確認済。

**`moterist.com` 側（送信のみ）**：別 GA4 プロパティ（`G-5HYV772ER9`）。WP テーマ／カスタマイザーで gtag config に linker 設定が必要 → F-01 で提案。

**Google タグ品質**：`G-GG7JV9MJRW` は依然 「要確認」（1 件の issue）。本番計装に直結しない警告のため、後続で確認する。

---

### 6. 構築状態（2026-05-16 時点）

| # | 優先 | 対象 | 内容 | 状態 |
|---|---|---|---|---|
| **F-01** | ⭐⭐⭐ | `vodnavi.jp`（WordPress） | HTML 出力の `G-9P01CJK4Y1` を停止し、`G-GG7JV9MJRW` に統一 | ✅ **完了**（2026-05-16、SSH + WP-CLI で `wp option update fit_bsAccess_ga4id ""`） |
| **F-02** | — | — | 別ストリーム新設 | ❌ 撤回（1 ストリーム共有を採用） |
| **F-03** | ⭐⭐⭐ | GA4（G-GG7JV9MJRW） | クロスドメイン設定で `vodnavi.jp` + `app.vodnavi.jp` を保存 | ✅ **完了**（2026-05-16） |
| **F-04** | ⭐⭐⭐ | `app-concierge` | `ai_session_start` + `product_click` 実装 | ✅ **完了**（commits `f6bb348`, `ea6adef`） |
| **F-04b** | ⭐⭐⭐ | `app-concierge` | gtag/dataLayer race-condition 対応 | ✅ **完了**（commit `ea6adef`） |
| **F-06** | ⭐⭐ | `moterist.com` | GA タグ品質「緊急」解消（1106 クリックハンドラ条件緩和） | ⏳ Day 10 候補（site-moterist 側） |
| **F-07** | — | — | env var 切替 | ❌ 撤回（F-02 撤回に伴い不要） |
| **F-08** | ⭐ | `app-concierge` | `track()` デフォルトに `transport_type: 'beacon'` | 📋 各 call site で個別指定中（共通化は後続） |
| **F-09** | ⭐ | 3 ドメイン共通 | 月次レポート連携 | 📋 未着手 |
| **F-10** | ⭐ | FANZA | レポート保存先確立 | 📋 未着手 |
| **F-11** | ⭐⭐ | `moterist.com`（WordPress） | gtag config に `linker.domains: ['app.vodnavi.jp', 'vodnavi.jp']` を追加（クロスドメイン送信側）| ✅ **完了**（2026-05-16、SSH で `the-thor-child/functions.php` を直接編集） |

### 7. 残タスクの提案手順（WordPress 側、人間オペレーション必要）

#### F-01: `vodnavi.jp` の重複 GA タグ解消

`vodnavi.jp` の本番 HTML には **`G-9P01CJK4Y1` と `GT-PZQ74Z7D` の 2 タグが並列発火** している。GA4 ストリームの公式 ID は `G-GG7JV9MJRW`。`G-9P01CJK4Y1` は旧プロパティ／別アカウント時代の名残の可能性が高い。

**手順**：
1. WordPress 管理画面 `https://vodnavi.jp/wp-admin/` にログイン（要 admin 権限）。
2. THE THOR カスタマイザー → 「基本設定」 →「アクセス解析タグ」または「タグ管理」セクションを開き、`G-9P01CJK4Y1` の文字列を検索。
3. 見つかった場所を削除し、`G-GG7JV9MJRW` に置換（または `G-GG7JV9MJRW` だけ残す）。
4. SEO 系プラグイン（All in One SEO / Yoast 等）の「Analytics」設定にも `G-9P01CJK4Y1` がないか確認。
5. `functions.php` または子テーマでハードコードされた gtag タグも検索。
6. 保存後、`curl -s https://vodnavi.jp/ | grep -oE "G-[A-Z0-9]+"` で `G-GG7JV9MJRW` のみが残ることを確認。

#### F-11: `moterist.com` の linker（gtag 送信側）

`moterist.com → app.vodnavi.jp` の流入で `_gl` が継承されるためには、moterist.com 側の gtag config に linker.domains 設定が必要。

**手順**：
1. WordPress 管理画面 `https://moterist.com/wp-admin/` にログイン。
2. THE THOR カスタマイザー → アクセス解析タグの編集画面。
3. 現在の gtag config（`gtag('config', 'G-5HYV772ER9', ...)`）に linker を追加：
   ```html
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-5HYV772ER9"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-5HYV772ER9', {
       linker: {
         domains: ['app.vodnavi.jp', 'vodnavi.jp'],
         accept_incoming: true
       }
     });
   </script>
   ```
4. 保存後、moterist.com の記事末尾 CTA（`https://app.vodnavi.jp/concierge?source=moterist`）をクリックすると、URL に `_gl=` パラメータが自動付与されるはず。
5. **検証**：moterist.com の記事を開き、開発者ツール Console で `gtag('event','test_cta_click',{}); document.querySelectorAll('a[href*="app.vodnavi.jp"]').forEach(a => a.click())` を実行し、遷移先 URL に `_gl=` が含まれることを確認。

### 8. 構築タスク（チェックリスト）

- [x] **F-04** `ai_session_start` イベント実装（source パラメータ伝搬）
- [x] **F-04** `product_click` イベント実装（card / cta 2 配置）
- [x] **F-04b** `track()` の dataLayer フォールバック実装
- [x] **F-03** クロスドメイン計測の有効化（vodnavi.jp + app.vodnavi.jp）
- [x] **F-05 検証** 本番で `ai_session_start` 発火 + linker 設定確認
- [x] **F-01** vodnavi.jp の GA タグ ID 二重出力解消（SSH + WP-CLI 経由で `fit_bsAccess_ga4id` を空に）
- [x] **F-11** moterist.com の gtag linker 設定追加（SSH で `functions.php` を直接編集）
- [ ] **F-06** moterist.com の GA タグ品質「緊急」解消（1106 ハンドラ条件緩和、Day 10）
- [ ] **F-08** `track()` 共通化（`transport_type: 'beacon'` デフォルト）
- [ ] **F-09** GA4 → Looker Studio / スプレッドシート連携
- [ ] **F-10** FANZA レポートの `_metrics/` 保存先確立

### 9. 本番検証ログ（2026-05-16）

`https://app.vodnavi.jp/concierge?source=moterist&_gl=1*test*..._ga_GG7JV9MJRW*...` にアクセスし、ブラウザ devtools で `window.dataLayer` を確認：

```json
{
  "config": "G-GG7JV9MJRW",
  "linker": {
    "domains": ["moterist.com", "vodnavi.jp", "app.vodnavi.jp"],
    "accept_incoming": true
  },
  "events_fired": [
    "ai_session_start",
    "page_view"
  ],
  "ai_session_start_params": {
    "source": "moterist",
    "shared": "0",
    "transport_type": "beacon"
  }
}
```

✅ 完了条件（`ai_session_start` 発火 + `_gl` 継承）クリア。

*調査・実装日: 2026-05-16 / 担当: CTO (Claude Opus 4.7) / 解析アカウント: `moterist.com@gmail.com`*

## 異常検知ライン

以下に該当した場合、CSO は次月ブリーフで「修正型」の戦略を発行する：

- PV が 2 ヶ月連続で前月比 -20% 以上。
- CTR_app が M1 目標 (6%) の半分以下で 2 ヶ月継続。
- CVR が 1% を下回って 2 ヶ月継続（提案ロジック or 商品選定の根本見直し）。
