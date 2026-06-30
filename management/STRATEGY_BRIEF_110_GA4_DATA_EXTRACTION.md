# STRATEGY BRIEF 110 — GA4 物理データ抽出による hostname およびパラメータ乖離監査

## 1. 目的
`0c65f4c` までの監査で確定した「サーバーサイド（`proxy.ts`）とクライアントサイド（GA4発火）」の構造に基づき、GA4（測定ID `G-GG7JV9MJRW`）に実際に蓄積されている `hostname` および `page_location` の生データを抽出し、インデックス汚染の有無およびDMM管理画面との乖離要因を最終特定する。

## 2. 不変条件および監査要件
- **実測値の尊重**:
  - `moterist.com`（完全凍結済み）および `vodnavi.jp` / `app.vodnavi.jp` からの流入が、GA4の `hostname` ディメンションによって冷徹に個別識別されているかを目視確認せよ。
- **インデックス規約の厳守**:
  - `page_location` 内に `?sort=` を含む動的クエリURLが検出された場合であっても、`BRIEF_109` の正典に基づき、ページ側で `self-canonical consolidation` が機能していることを検証し、`noindex` への安易な逃げを永久に禁止する。

## 3. 抽出先プロパティの物理特定（誤プロパティ抽出の防止）
- 抽出対象は **GA4 プロパティ `p489519780`**（測定ID `G-GG7JV9MJRW` / web stream `11225897844` ＝ app + front 共有クロスドメイン、[[reference_ga4_property_topology]]）。測定ID は「どのプロパティのデータか」の同定用で、抽出自体はプロパティ（エクスプローラ / BigQuery）から行う。
- **誤プロパティ防止**: GA4 を素で開くと**別 client（`coushilift.com` / `hdktchkw33`）の既定プロパティ**が表示される（[[reference_ga4_default_property_trap]]）。抽出前に **`authuser=2` / `p489519780`** への切替を物理確認し、別 client のデータを vodnavi と混同しない。
