# 自クリック照合の確定 / vodnavi.jp 8ページ実態 / ahrefs台帳記録 / B2①デプロイ【CSO指示・8/2実施分】

- 取得実施: **2026-08-02 07:05:36 〜 07:27:16 JST**(PowerShell 実測)
- 取得元: DMM=`affiliate.dmm.com/report/top/` / GA4=`analytics.google.com` authuser=1(= moterist.com@gmail.com) / GSC=`search.google.com/search-console` 同アカウント / 本番HTML=PowerShell `Invoke-WebRequest`
- 判断・評価は加えない(事実の転記のみ)。Phase 1 で停止

---

## 1. 自クリック照合【確定】

### 1-1. DMM af_id 990 / 2026-08-01（**確定値**）

| 項目 | 値 |
|---|---|
| 期間合計 | **1 クリック** |
| 成果 | 0件 0円 |

**時間別内訳（全24時間）**

| 時刻 | クリック |
|---|---|
| 0時〜16時 | すべて **0** |
| **17時** | **1** |
| 18時〜23時 | すべて **0** |

→ **CSO の 2026-08-01 17:15:00 JST 実クリックが、DMM 側に 17時台1件として計上されている**（時刻レベルで一致）

**前回取得値との差**: 8/1 当日の 17:53 / 21:57 時点はいずれも「データがありません（=0）」。8/2 06:0x 以降に 1 が出現。→ **DMM 当日レポートの反映遅延が実測で確定**（前回記録の観測 §1(a) 根拠3 を裏付け）

### 1-2. GA4 `list_top_card_cta` / 2026-08-01（**確定値**）

hostname 完全一致 `app.vodnavi.jp`・placement 別・全14行:

| # | イベント名 | placement | イベント数 | 総ユーザー数 |
|---|---|---|---|---|
| 1 | page_view | (なし) | 245 | 95 |
| 2 | session_start | (なし) | 98 | 95 |
| 3 | first_visit | (なし) | 93 | 92 |
| 4 | age_gate_view | (なし) | 85 | 83 |
| 5 | scroll_custom | (なし) | 68 | 25 |
| 6 | user_engagement | (なし) | 60 | 57 |
| 7 | age_gate_agree | (なし) | 59 | 58 |
| 8 | click | (なし) | 11 | 8 |
| 9 | ai_affiliate_click | **detail_fv_cta** | 6 | 5 |
| 10 | product_click | **detail_fv_cta** | 6 | 5 |
| 11 | ai_affiliate_click | **detail_sample** | 5 | 3 |
| 12 | product_click | **detail_sample** | 5 | 3 |
| 13 | scroll | (なし) | 3 | 3 |
| 14 | ai_session_start | (なし) | 1 | 1 |
| — | 合計 | — | **745** | **95** |

- **`list_top_card_cta` = 0件（確定）**。`list_genres_card_cta` / `list_actresses_card_cta` / `list_card_cta` も**全て不在**
- 8/1 に placement が付いたのは **detail_fv_cta / detail_sample の2種のみ**

### 1-3. 4パターン判定【確定】

| DMM | GA4 | 該当パターン |
|---|---|---|
| **1**（990・17時台） | **0**（list_top_card_cta 不在） | **「DMM=1 GA4=0 → S1計装が発火していない」** |

- 前回（8/1 時点）の暫定判定「DMM=0 GA4=0 → 要調査」は、**DMM 値の確定により「DMM=1 GA4=0」へ更新**される
- 当該クリックは **S1 計装のデプロイ（2026-07-31 06:27:51 JST）より後**に実施されている

### 1-4. 2026-08-01 の af_id 別分解【完全に閉じた】

| af_id | クリック | 成果 |
|---|---|---|
| **moterist-004** | **10** | 0 |
| **moterist-006** | **2** | 0 |
| **moterist-990** | **1**（17時台） | 0 |
| その他（001 / 002 / 003 / 005 / 991〜999） | **0** | 0 |
| **すべて（合計）** | **13** | **0** |

- **検算: 10 + 2 + 1 = 13 = 「すべて」合計** ✓（残余ゼロ）
- 前回取得の暫定「すべて=13」は**確定値と一致**

### 1-5. 自クリック台帳（更新）

| # | 日時(JST) | 実施者 | 面 | af_id | DMM計上 | GA4計上 | 層B帰属 |
|---|---|---|---|---|---|---|---|
| 1 | 2026-07-25 | HUMAN | — | 004 | 1クリック | — | **除外済** |
| 2 | **2026-08-01 17:15:00** | **HUMAN(CSO)** | トップ 一覧系メインCTA | **990** | **1クリック（17時台・確定）** | **0** | **除外**（8/1 は層B期間外。台帳へ記録） |

---

## 2. vodnavi.jp 配下ページの実態（調査のみ・修正なし）

対象8ページ + 比較用2ページ。全て HTTP 200。**内部リンクの追加は行っていない**。

### 2-1. 本文・メタ・広告表記・af_id

| # | パス | 本文文字数(タグ除去後・概算) | af_idリンク | 広告表記 |
|---|---|---|---|---|
| 1 | `/philosophy-of-cinema` | **416** | **0** | フッター「広告を含む」のみ |
| 2 | `/storytelling-structure` | **1,321** | **0** | フッター「広告を含む」のみ |
| 3 | `/compare` | **566** | **0** | フッター「広告を含む」のみ |
| 4 | `/u-next-second-free-trial` | **1,129** | **0** | **本文冒頭「本ページにはアフィリエイトリンクおよびプロモーションが含まれます（#PR）。」** + フッター |
| 5 | `/vod-selection-guide` | **1,721** | **0** | フッター「広告を含む」のみ |
| 6 | `/biblia-literature-eroticism` | **781** | **0** | フッター「広告を含む」のみ |
| 7 | `/biblia-erotica-foundation` | **787** | **0** | フッター「広告を含む」のみ |
| 8 | `/wordpress-sango-review` | **1,327** | **0** | **本文冒頭「本ページにはアフィリエイトリンクおよびプロモーションが含まれます（#PR）。」** + フッター |
| 比較 | `/cinematic-chiaroscuro` | **1,206** | **0** | フッター「広告を含む」のみ |
| 比較 | `/solitude-catharsis` | **1,265** | **0** | フッター「広告を含む」のみ |

- **af_id リンクは10ページすべて 0件**（既存実測と一致）
- 本文冒頭に #PR 表記があるのは **`/u-next-second-free-trial` と `/wordpress-sango-review` の2ページのみ**。他8ページはフッター共通の「広告を含む」のみ
- **最終更新日は10ページすべて不可視**（本文中に日付表記なし・`<time datetime>` タグも 0件）

### 2-2. title / meta description / h1 / 主題

| # | パス | title / h1 | meta description（冒頭） | 主題（冒頭から判断できる範囲・原文転記） |
|---|---|---|---|---|
| 1 | `/philosophy-of-cinema` | 「鏡」が映し出す孤独の輪郭 — 映画に見る哲学的な自己対峙 | 孤独とは、他者との断絶ではなく、自己との対話の始まりです。映画という鏡は、時に私たちの内面を深く、鮮やかに映し出します。 | 「自己対峙のプロセス」——映画を鏡に見立てた孤独論 |
| 2 | `/storytelling-structure` | 快楽の構造：名作シネマが共有する「3幕構成」と脳内プロットの心理学 | なぜ私たちは、わずか120分の映像体験に心を奪われ…「ストーリーテリングの構造（3幕構成）」という、人間の脳の快楽原則に直接訴えかける緻密な設計図が存在するからだ。 | 3幕構成の脚本論・脳の快楽原則 |
| 3 | `/compare` | title=VOD 比較ガイド — あなたの夜の書斎にふさわしい映像ライブラリ / **h1=映像の書斎へ、ようこそ** | 動画配信サービス（VOD）を、料金や機能だけでなく作品性・映像文化の観点から比較・分析。 | 「EDITORIAL / COMPARE」——VOD選択の美学 |
| 4 | `/u-next-second-free-trial` | 孤独な夜を満たす、至高のシネマ体験設計――VOD無料体験を最大効率化する選択肢 | **本ページにはアフィリエイトリンクおよびプロモーションが含まれます（#PR）。** | 無料体験の効率化・「照明を落とした部屋、琥珀色のグラス」 |
| 5 | `/vod-selection-guide` | 今夜の一本をどう選ぶか — 映像を「蔵書」として読む VOD 選択論 | 良質な映像体験は、偶然の産物ではない。…配信サービス（VOD）の選択とは、単価数百円の節約合戦ではなく、これから自分が出会う物語の母集団そのものを定める行為だ。 | VODを「蔵書の思想」として読む選択論 |
| 6 | `/biblia-literature-eroticism` | 文学とエロティシズムの系譜 — 古典が教える「描かずに描く」美学 | 『源氏物語』の御簾越しの気配、谷崎潤一郎の陰翳、川端康成の指先の描写——日本文学が磨き上げてきたのは、直接には描かず、しかし確かに伝える技法です。 | 日本文学における抑制の技法 |
| 7 | `/biblia-erotica-foundation` | 『ビブリア・エロティカ』へようこそ — 知性と情動が交わる、選書という愉しみ | 一冊の本を選ぶように、一本の映像を選ぶ。…官能の図書館という名を掲げるこの場所は、衝動を煽るための陳列棚ではなく、感情の機微を丁寧に読み解くための書架でありたい | シリーズの序文・選書思想 |
| 8 | `/wordpress-sango-review` | 官能のライブラリを構築する美学：WordPressテーマ「SANGO」のUI/UX論 | **本ページにはアフィリエイトリンクおよびプロモーションが含まれます（#PR）。** | WordPressテーマ SANGO の UI/UX 論 |
| 比較 | `/cinematic-chiaroscuro` | 陰影の美学：古典映画における「メタファー」の構図とライティング技法 | スクリーンという名の漆黒のキャンバスに、一筋の鋭い光が走る。 | 光と影・構図の視覚論 |
| 比較 | `/solitude-catharsis` | 孤独のコンシェルジュ：深夜のVODがもたらす精神的カタルシスと選択の心理学 | 都市の喧騒が完全に沈黙へと変わる午前2時。…深夜に一人で映像の海へ没入する行為は、単なる暇潰しではない。 | 深夜VODのカタルシス論 |

### 2-3. GSC 実測（プロパティ `sc-domain:vodnavi.jp`・28日間 = **2026年7月3日〜7月30日**）

`www.vodnavi.jp` を含む URL でフィルタした結果 — **データが存在するのは4ページのみ**:

| URL | クリック | 表示回数 | CTR | 平均掲載順位 |
|---|---|---|---|---|
| `https://www.vodnavi.jp/biblia-erotica-foundation` | **1** | **2** | 50% | **1.0** |
| `https://www.vodnavi.jp/`（トップ・**8ページ対象外**） | 0 | **7** | 0% | 13.7 |
| `https://www.vodnavi.jp/vod-selection-guide` | 0 | **2** | 0% | 5.0 |
| `https://www.vodnavi.jp/wordpress-sango-review` | 0 | **2** | 0% | 7.0 |
| **上記以外の7ページ**（philosophy-of-cinema / storytelling-structure / compare / u-next-second-free-trial / biblia-literature-eroticism / cinematic-chiaroscuro / solitude-catharsis） | — | **0（データなし）** | — | — |
| **www.vodnavi.jp 合計** | **1** | **13** | 7.7% | 9.4 |

### 2-4. 【重要な訂正】GSC は停止していない

CSO 指示文の前提「GSCは7/24停止中」について、**本日の実測は以下のとおり**:

| プロパティ | 最終更新日 | 28日間の期間表示 | 28日間 クリック / 表示 |
|---|---|---|---|
| `sc-domain:vodnavi.jp` | **5.5 時間前** | **2026年7月3日〜7月30日** | 1,734 / 3.11万 |
| `sc-domain:app.vodnavi.jp` | **5.5 時間前** | **2026年7月3日〜7月30日** | 1,733 / 3.11万 |

- **データは 2026-07-30 まで存在**しており、**7/24 で停止していない**
- 検算: vodnavi.jp(1,734) − app.vodnavi.jp(1,733) = **1** = www.vodnavi.jp の1クリック ✓（ドメインプロパティがサブドメインを包含していることと整合）
- → **「4プロパティとも7/24停止」という従前の記録は、本日時点では成立しない**。復旧したのか従前の観測が誤りだったのかは**本記録では判別しない**

---

## 3. ahrefs Site Audit の台帳記録

（詳細は `datapull-20260802-0630-ahrefs-site-audit-errors.md`。以下は台帳向け要約）

1. **エラー8件 = `Orphan page (has no incoming internal links)` の1項目のみ**。該当8URLは全て `www.vodnavi.jp` の記事ページ・HTTP 200・内部リンク元0・`sitemap.xml` 由来
2. **`4XX page` / `5XX` / `Broken redirect` / `Canonical points to redirect` は 0件**。Structure explorer の実数表でも 4xx=0 / 5xx=0（3ホストとも）
3. **既知5事象のいずれとも重複しない別事象**:
   - 404=787件 → 4xx=0 で未検出（**重複しない**）
   - robots除外 648件 → ブロック=0（**重複しない**）
   - 代替canonical 1,829件 → canonical系エラー0（**重複しない**）
   - noindex 1件 → ahrefs は Noindex page 3 / Noindex follow page 3（Warning・Notice。**数値も区分も相違**）
   - www リダイレクト → apex 3URL 全て3xx（**既知事象と一致**するが、エラー8件とは別項目）
4. **クロール上限到達により全域未網羅**。原文「The crawl has reached the maximum number of internal pages, and the website may not be crawled completely.」。実クロールは app.vodnavi.jp 489 / www.vodnavi.jp 17 / vodnavi.jp 3 = **計509 URL**
5. **ahrefs クロールは 2026-07-16 〜 07-25 の10日間が連続 Failed、7/26 に Completed 復帰**。最終クロールは **2026-08-01 16:20:45 JST / Completed**、頻度は日次、次回は 8/2 16—17時
   - **GSC の停止（従前記録では7/24）とは期間が異なる別事象**として記録する
   - ※なお本日の実測では GSC 側も停止していない（§2-4）

---

## 4. B2①デプロイ → **classifier 遮断により未実施・報告**

### 4-1. プリフライト（**全て合格**）

| 検査 | 結果 |
|---|---|
| `tsc --noEmit`（main） | **exit 0** |
| `tsc --noEmit`（PR #62 ブランチ `b2-1-renderer-body-links` / `e8c33eb`） | **exit 0** |
| 既存記事レンダ差分ゼロ（BRIEF_126 §6 PR-1 プリフライト） | **合格**。本番の全7記事で `[text](/articles/slug)` パターンは **0件** → デプロイ後も**出力は現状と同一** |

### 4-2. 【報告事項】classifier 遮断でマージ不可

- `gh pr merge 62` の実行が **auto-mode classifier により拒否**された（原文: 「Permission for this action was denied by the Claude Code auto mode classifier. Reason: Blocked by classifier.」）
- 制約「classifier 遮断が出たら即停止・報告。迂回なし」に従い、**ローカルマージ+push 等の代替手段は一切試みていない**
- 実行後の状態確認: **PR #62 は OPEN のまま（mergedAt=null）**、ローカルは `main`（`8fdd300`）に復帰済み、作業ツリーはクリーン
- → **デプロイは実施されていない。マージ操作の許可付与が必要**

### 4-3. 【報告事項】internal_links の DDL について

指示「internal_links の DDL適用 + 適用確認を手順に含めること」に対する実測:

1. **PR #62 は `internal_links` を一切参照していない**。変更は `app-concierge/src/app/(site)/articles/[slug]/page.tsx` の1ファイルのみ（+46/−2）で、ホワイトリストは `getPublishedArticleSlugs()`（= `editorial_articles` の公開slug）から取得している。→ **本 PR のデプロイに DDL は前提条件として不要**
2. **`internal_links` の DDL はリポジトリに存在しない**。SQL ファイルは `app-concierge/supabase/patch_add_public_read_policy.sql` / `poc_seed_mock10.sql` / `docker-env/postgres/init/01_schema_conversations.sql` / `management/templates/*.insert.sql` の4系統のみで、`internal_links` の CREATE TABLE は **BRIEF_126 §2 の SQL 案（Markdown 内）としてのみ存在**
3. **CTO 側に DDL 適用手段がない**:
   - `.mcp.json` の supabase サーバは **`--read-only`** 指定（BRIEF_126 §2 の記載「適用はMCPでなくManagement API(MCP supabaseはread-only)」と一致）
   - 当該 MCP サーバは**本セッション中に切断済み**
   - `.env.local` に `SUPABASE_*` の環境変数は**未設定**
   - → **DDL 適用は HUMAN 枠（Supabase Dashboard 手動 または Management API トークンの供与）**

### 4-4. 未実施（デプロイ未完のため）

| 項目 | 状態 |
|---|---|
| 公開後チェック 第4項（Canceled 確認） | **未実施**（デプロイが発生していないため） |
| 公開後チェック 第5項（sitemap 生成時刻） | **未実施**（同上） |

---

> 本記録は事実の転記のみ。判断・評価・提案は記載していない。
