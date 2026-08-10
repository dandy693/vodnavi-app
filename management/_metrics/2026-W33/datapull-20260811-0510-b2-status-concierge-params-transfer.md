# B2①/B2② ステータス / Concierge パラメータURL の発生源 / works→articles 転送可能量

- 実施: **2026-08-11 05:12:27 〜 05:20 JST**
- **読み取りのみ**。マージ・デプロイ・修正・R2 のいずれも実行していない
- 出力形式: 実測値 / ベースライン / 差分 / 判定
- Chrome 連携で自力取得（切断なし）。`premium.dmm.co.jp` / `video.dmm.co.jp` には**到達を試みていない**

---

# タスクA B2①/B2② のステータス確認

## A-(1) PR #62（B2① レンダラ本文リンク対応）→ **マージ済み・デプロイ済み**

| 項目 | 実測値 |
|---|---|
| コミット | **`98b6389`**（2026-08-02 22:17 JST）「feat(B2-1): 記事本文の内部リンク描画 …（#62）」 |
| main への包含 | **`git merge-base --is-ancestor 98b6389 origin/main` = YES** |
| 変更規模 | `app-concierge/src/app/(site)/articles/[slug]/page.tsx` **1ファイル（+46 / −2）** |
| デプロイ | **2026-08-02 22:18:52 JST**（台帳 `T-20260808-CANONICAL-ORIGIN` の時系列と一致） |
| 公開後チェック | **`1673191`（22:26）「B2①(PR #62)デプロイ後チェック — 全項目合格・異常なし」** |

**判定: 未デプロイではない。ブロッカーは存在しない。**

## A-(2) `internal_links` テーブル

| 項目 | 実測値 |
|---|---|
| DDL 適用 | **未適用（HUMAN 枠）** |
| 根拠 | `works/[floor]/[id]/page.tsx:45` のコメント（原文）「作品ごとの出し分けは行わない＝`internal_links` テーブル（**DDL 未適用・HUMAN 枠**）に…」 |
| 適用確認の実施 | **していない**。Supabase MCP は `Unauthorized`（既知事象）で DB を直接読めない |
| **B2① との依存関係** | **依存しない**。B2① は記事本文の `[text](/articles/slug)` 記法を**公開済 slug のホワイトリスト照合**で描画する実装であり、テーブルを参照しない |

## A-(3) 本番 articles 実画面の本文内リンク（2026-08-11 05:12:54 実測・全7記事）

| 記事 | HTTP | `/articles/` アンカー | リンク先 | 生md記法の残り |
|---|---|---|---|---|
| `fanza-kaiyaku` | 200 | **4** | first-guide / tv-free-trial / tv-guide / tv-review | 0 |
| `fanza-tv-free-trial` | 200 | **3**（uniq 2） | first-guide / tv-guide | 0 |
| `fanza-tv-review` | 200 | **3** | first-guide / tv-free-trial / tv-guide | 0 |
| `fanza-payment-methods` | 200 | **2** | kaiyaku / payment-statement | 0 |
| `fanza-tv-guide` | 200 | **1** | first-guide | 0 |
| `fanza-first-guide` | 200 | 0 | — （被リンク先） | 0 |
| `fanza-payment-statement` | 200 | 0 | — （被リンク先） | 0 |
| **合計** | — | **13本** | — | **0** |

**判定: 実アンカーとしてレンダリングされている。**台帳の「B2① リンク投入 13リンク」と一致。未変換の markdown 記法（`](/articles/`）は **0件**。

## A-(4) B2②（works/actresses → articles）の実装状況

| 面 | `/articles/` アンカー | リンク先 | `<details>` |
|---|---|---|---|
| **works 詳細（videoa）** | **3**（uniq 1） | `fanza-first-guide` | 2 |
| **works 詳細（amateur）** | **3**（uniq 1） | `fanza-first-guide` | 2 |
| **actresses 詳細** | **1** | `fanza-tv-free-trial` | 0 |
| genres 詳細 | 0 | — | 0 |
| トップ | 0 | — | 0 |

- **B2②-a はデプロイ済み・稼働中**（2026-08-03 06:15:20）
- **B2②-b（DB駆動）は `internal_links` DDL 未適用のため未着手**
- 補足: `works_to_articles_cta` / `actresses_to_articles_cta` / `article_guide_click` の各文字列は **HTML には 0 出現**。これらは `ArticleGuideLinks`（クライアントコンポーネント）の JS バンドル側の定数であり、2026-08-03 のデプロイ検証で**配信JS 14本中に存在を確認済み**（挙動の異常ではない）

## A-(5) 「層B確定判定（8月頭）」

| 項目 | 状態 |
|---|---|
| 判定の実施 | **未実施** |
| 判定に必要な入力データ | **揃っていない** |

根拠（GA4 2026-08-06〜08-11 実測）:

| 入力 | 実測値 |
|---|---|
| articles面アフィリエイトクリック（4種合計） | **0件** |
| `/articles/*` 表示回数 | **2**（`fanza-first-guide` のみ・アクティブユーザー1） |
| `article_guide_click`（works/actresses → articles の送客） | **0件** |

## タスクA 判定

**B2① は未デプロイではなく、デプロイ済みで正常に稼働している（実アンカー13本を実画面で確認）。**
9/30ゲート①のブロッカーは B2① の実装・デプロイ側にはなく、**articles 面への流入が発生していないこと**にある（§タスクC で定量）。

---

# タスクB Concierge パラメータURLの発生源特定

## B-(a) 全体件数（クロール済-未登録 全842件を再集計）

1ページ目（1〜500）と2ページ目（501〜842）を両方取得して合算:

| セグメント | 1〜500 | 501〜842 | **全842件** | 構成比 |
|---|---|---|---|---|
| `/works/` | 428 | 180 | **608** | 72.2% |
| `/actresses/` | 7 | 101 | **108** | 12.8% |
| **`/concierge?…`** | **32** | **27** | **59** | **7.0%** |
| `/genres/` | 29 | 20 | **49** | 5.8% |
| `?sort=` 系 | 1 | 7 | **8** | 1.0% |
| `favicon.ico?…` | 1 | 3 | **4** | 0.5% |
| `opengraph-image` | 1 | 1 | **2** | 0.2% |
| `twitter-image` | 1 | 1 | **2** | 0.2% |
| `site.webmanifest` | 0 | 1 | **1** | 0.1% |
| `/articles/` | 0 | 0 | **0** | 0% |

（前回報告の「32件」は上位500件のみの値。**全842件では 59件**。）

## B-(b) source / seed_cid の取りうる値と組み合わせ上限

コード実測（`works/[floor]/[id]/page.tsx`）:

| 行 | コンポーネント | `source` | `intent` | 生成URL |
|---|---|---|---|---|
| L539 | `ConciergeCtaLink`（variant=solid） | **`app_direct`** | **`actress`** | `/concierge?source=app_direct&intent=actress&seed_cid={cid}` |
| L718 | `ConciergeCtaLink`（variant=outline・sticky） | **`app_direct`** | **`actress`** | **L539 と同一URL** |
| L625 | `ConciergeCtaPanel` | **`app_detail`**（既定） | **`re_recommend`**（既定） | `/concierge?source=app_detail&intent=re_recommend&seed_cid={cid}` |

| 変数 | 取りうる値 | 数 |
|---|---|---|
| `source` | `app_direct` / `app_detail`（+ 外部流入の `brand` / `moterist`） | **2**（+2） |
| `intent` | `actress` / `re_recommend`（source と1:1対応） | **2** |
| `seed_cid` | works の `content_id` | **掲出中の works ページ数に等しい** |

**組み合わせ上限（実測ベース）:**

| 項目 | 実測 |
|---|---|
| `sitemap.xml` の works URL | 1,600 |
| `sitemap-archive.xml` の works URL | 2,146 |
| **和集合（URL単位）** | **2,646**（重複 1,100） |
| **1ページあたりの concierge URL 種類** | **2**（app_direct 系 / app_detail 系） |
| **上限** | **2,646 × 2 = 5,292 URL**（+ `?source=brand` / `?source=moterist` の 2件） |

## B-(c) 発生源

- **`app-concierge/src/app/(site)/works/[floor]/[id]/page.tsx`** の3箇所（L539 / L625 / L718）
- コンポーネントは `src/components/concierge-cta-link.tsx`。URL 生成は原文:
  ```ts
  const href = `/concierge?source=${encodeURIComponent(source)}&intent=${encodeURIComponent(intent)}&seed_cid=${encodeURIComponent(contentId)}`;
  ```
- `next/link` の `prefetch={false}` は指定されているが、**`<a href>` としてレンダリングされるためクローラブル**

## B-(d) robots.txt / canonical / noindex の適用状況（2026-08-11 05:18:13 実測）

| 項目 | 実測値 |
|---|---|
| `robots.txt`（HTTP 200） | `User-Agent: *` → `Allow: /` / `Disallow: /api/` / `Disallow: /_next/`。**`/concierge` は Disallow されていない**（AIクローラー5種にも同一ルール） |
| `/concierge?source=app_detail&intent=re_recommend&seed_cid=…` | HTTP **200** |
| └ canonical | **`https://app.vodnavi.jp/concierge`**（パラメータ無し版へ集約） |
| └ robots meta | **`index, follow`** |
| └ `noindex` の出現 | **0** |
| `/concierge`（素） | HTTP 200 / canonical **自己参照** / robots meta `index, follow` |
| sitemap への収録 | `sitemap.xml` **0件** / `sitemap-archive.xml` **0件**＝**提出はしていない** |

## タスクB 判定 — 継続消費か有限か

**有限だが、works の掲出数に比例して単調増加する構造。**

| 論点 | 実測に基づく事実 |
|---|---|
| 上限の有無 | **あり**。`seed_cid` は works の `content_id` に限定され、任意値を取らない。現時点の上限 **5,292 URL** |
| 上限は固定か | **固定ではない**。`sitemap-archive.xml` は累積設計（`STRATEGY_BRIEF_128` N-2: 新窓流入 60〜65件/日 → 年2.2〜2.4万行の見込み）であり、**works URL の増加に伴い上限も増える** |
| インデックス汚染 | **していない**。canonical が `/concierge` へ正しく集約されており、GSC 上も「クロール済-未登録」＝インデックスされていない状態 |
| クロール予算 | **消費している**。現在 842件中 **59件（7.0%）**。robots.txt で除外されておらず sitemap 非収録のため、**リンク発見のたびにクロール対象になる** |

**分析のみ。修正・robots 変更・canonical 追加はいずれも実行していない。起案は次便で行う。**

---

# タスクC works→articles の転送可能量の見積り

## C-(1) works 詳細のセッション数・表示回数（GA4・2026-08-06〜08-11）

| 指標 | works（`filterTerm=works`） | サイト全体 | 構成比 |
|---|---|---|---|
| **表示回数** | **600** | 744 | **80.65%** |
| **アクティブユーザー** | **252** | 276 | **91.3%** |
| 該当ページ数 | 208 | 244 | — |

- **セッション数は取得不可**: GA4「ページとスクリーン」レポートに**セッション数の指標が存在しない**（利用可能なのは 表示回数 / アクティブユーザー / ビュー数/ユーザー / 平均エンゲージメント時間 / イベント数 / キーイベント / 収益）。参考として同期間の `session_start` は **285件**（(not set) 247 + 38）

## C-(2) articles 面の表示回数（記事別・同期間）

| 記事 | 表示回数 | アクティブユーザー | 平均エンゲージメント |
|---|---|---|---|
| `/articles/fanza-first-guide` | **2** | **1** | **1分32秒** |
| 他6記事 | **0** | 0 | — |
| **合計** | **2** | **1** | — |

## C-(3) works 詳細 → articles のリンクの存在

**存在する。** works 詳細に `/articles/fanza-first-guide` へのアンカーが **3本**（uniq 1）。videoa 面・amateur 面の双方で確認。

## C-(4) クリック率

| 指標 | 実測値 |
|---|---|
| `article_guide_click`（works/actresses → articles の送客イベント） | **0件** |
| `works_to_articles_cta`（placement） | **0件** |
| works 表示回数（分母） | 600 |
| **クリック率** | **0 / 600 = 0.00%** |

## 出力: articles 面へ転送しうる上限の概算

| ステップ | 値 | 根拠 |
|---|---|---|
| works 表示回数（6日間） | **600** | GA4 実測 8/6〜8/11 |
| **月換算（×30/6）** | **約 3,000** | 単純線形換算 |
| 実測 CTR | **0.00%**（n=600・6日） | `article_guide_click` 0件 |
| 参考: 同一ページ内の別導線 `concierge_entry_click` | **1件 / 600表示 = 0.17%** | 同期間 GA4 実測 |
| **上限の概算（参考 CTR 0.17% を当てはめた場合）** | **月 約5件** | 3,000 × 0.0017 |

**判定（算術のみ）**: 9/30 ゲート①の目標は **articles 面クリック 30件/月**。works 面の現在の流入量（月換算 約3,000表示）に対し、works→articles の送客 CTR が 0.17%（同ページ内の別導線の実測値）で推移した場合、articles 面到達は **月 約5件**にとどまり、そこからさらにアフィリエイトCTAのクリックに至る割合を掛けることになる。**works→articles の転送のみで 30件/月を満たすには、CTR かworks 流入量のいずれか、または両方が現状から桁で変わる必要がある。**

※ 実測 CTR は 0.00%（6日・n=600）であり、0.17% は**別イベントの値を代入した参考値**である。

---

# タスクE R2実行前の最終確認（8/13向け）

## E-(1) アラート実地テスト 項目1〜4 の充足状況

**8/13 10:00 JST 以降に確認する項目のため、現時点ではいずれも未実施。** 準備状況は以下。

| 項目 | 準備状況 |
|---|---|
| 1. Run history に実行記録があるか | 自動化 `wflfLOp2JJo89imzQ` = **ON / deployed / valid**（8/8確認）。8/6 に `Ran successfully` の実績あり |
| 2. Find records の件数（期待値 0） | **8/17 以降の承認済 = 0件（2026-08-11 05:19 実測・Airtable）** → 判定式 `Records length < 6` が成立する見込み |
| 3. Conditional action group を通過したか | 8/6 の実行では 14件だったため未通過。今回は0件で通過見込み |
| 4. `Send an email` が実行されたか | 同上 |
| 5. メール受信 | **CSO 確認待ち**（CTO は受信箱を参照できない） |

## E-(2) delta −400 検証手順の確定

| 項目 | 確定内容 |
|---|---|
| **測定タイミング①（基準）** | **実装のマージ直前**。`https://app.vodnavi.jp/sitemap.xml` と `sitemap-archive.xml` を取得し、loc 総数・works フロア別件数・actresses/genres/articles 件数を記録 |
| **測定タイミング②（検証）** | **デプロイが READY になり、かつ sitemap の再生成が着地した後**。route handler は `revalidate = 3600` のため、**root の `lastmod` がデプロイ時刻付近へ更新されていること（公開後チェック第5項）を確認してから測定する** |
| **比較対象** | ①と②で**同一エンドポイント**（`sitemap.xml` / `sitemap-archive.xml`）の同一項目 |
| **合格条件** | (a) `sitemap.xml` loc 総数 = **① − 400** (b) works の **amateur = 0** (c) **videoa / anime / nikkatsu = 各400のまま** (d) `sitemap-archive.xml` の amateur = 0 のまま |
| **判定に使わないもの** | **絶対値**（2,563 等）。actresses（uncap・現在1,148）・genres・archive は新作公開に伴い日々変動するため、**①からの差分で判定する** |
| 付随確認 | `/works/amateur/{cid}` が **HTTP 200 のまま**・canonical が **videoa を指したまま**であること |

## E-(3) R2起案への事前予測の追記

台帳 `T-20260813-R2-EXEC` に追記した（本文は §台帳記録 を参照）。

---

# 禁止事項の遵守状況

| 禁止事項 | 状況 |
|---|---|
| 記事Aの本文執筆・publish | **していない** |
| `premium.dmm.co.jp` / `video.dmm.co.jp` へのアクセス（Chrome連携含む） | **到達を試みていない** |
| af_id 990〜994 の人間向けCTAへの使用 | **していない** |
| R2 の先行実行 | **していない**（sitemap は loc 2,963 / amateur 400 のまま） |
| 新規ページ種別・namespace の作成 | **していない** |
| タスクBで検出した問題の自己判断による修正 | **していない**（分析のみ） |
| PR #62 のマージ・デプロイの自己判断による実行 | **していない**（そもそも 8/2 にマージ・デプロイ済み） |

Chrome 拡張の切断は**発生していない**。`affiliate.dmm.com` のタブは開いていたが、**本便のタスクに含まれないため操作していない**。

---

> 本記録は実測値の転記。§タスクC の上限概算は算術であり、代入した 0.17% は別イベントの実測値である旨を明記した。
