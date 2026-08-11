# 第16便 — B2②-b の RLS / トリガ / ガードレール実装 + Airtable テーブル作成 + PR-2 見積り

- 実施: **2026-08-11 23:05 〜 23:20 JST**
- 経路は **Supabase Management API**（Chrome を経由していない）。**各適用後に読み戻して確認**（運用則 §10）
- **R2 / β / α / Concierge robots / `propose-internal-links.ts` / PR-2 はいずれも未実行**（本便で 8/13 の予定を前倒ししていない）
- **`posts` テーブルと scenario 5615632 には一切触れていない**

---

# タスクA 実装 → **完了。14項目の動作確認すべて期待どおり**

## 適用順序（権限を絞ってから機能を足す）

| # | 適用内容 | HTTP | 読み戻し |
|---|---|---|---|
| 1 | `approved_by` 列 + ガードレールの DB 制約（CHECK 3件 + 部分 UNIQUE 索引） | **201** | 列あり / CHECK 7件 / 索引 2件 |
| 2 | トリガ3種 | **201** | `trg_guard_ai_proposal`(INSERT) / `trg_guard_status_transition`(UPDATE) / `trg_guard_live`(UPDATE) すべて enabled |
| 3 | ロール2種 + GRANT + RLS ポリシー3件 | **201** | 下表 |
| 4 | **欠陥2件の修正**（後述） | **201** | 再テストで解消を確認 |

## ロールと権限（**ACL を直接読んだ実測値**）

| ロール | login | bypassrls | 権限 |
|---|---|---|---|
| **`ai_proposer`** | false | **false** | テーブル **INSERT のみ** |
| **`link_approver`** | false | **false** | **SELECT** + **列単位 UPDATE (`status`, `approved_at`, `approved_by`) のみ** |

> `information_schema.table_privileges` には出ないため `pg_class.relacl` / `pg_attribute.attacl` を `aclexplode` で直接読んだ。

RLS ポリシー: `ai_insert_proposed_only`(INSERT→ai_proposer) / `approver_select`(SELECT→link_approver) / `approver_update_status`(UPDATE→link_approver)。

## ガードレール6件の実装場所 — **すべて DB 側に置いた**

指示は「ガードレール6件を実装」。**`propose-internal-links.ts` の実装は禁止**されているため、**バッチ側ではなく DB 側の制約として実装**した。**これによりバッチに欠陥があってもガードが効く。**

| # | ガードレール | 実装 |
|---|---|---|
| 1 | `target_slug` は**公開済み slug のホワイトリスト完全一致** | トリガ `guard_ai_proposal`（`editorial_articles` を `publish_status='published'` で照合） |
| 2 | **外部URL・`af_id`・DMM ドメイン**（**`moterist-99[0-9]` を含む**）を自動リジェクト | CHECK `chk_no_external_or_affiliate` |
| 3 | **1記事あたりの発リンク上限 3** | トリガ `guard_ai_proposal`（`status<>'retired'` を数える） |
| 4 | **同一 `(source_type, source_id, target_slug)` の重複禁止** | 部分 UNIQUE 索引 `ux_internal_links_src_tgt`（`where status <> 'retired'`） |
| 5 | アンカーは自然文（**「こちら」等を禁止**・4〜80文字） | CHECK `chk_anchor_natural` |
| 6 | **`status` は必ず `proposed`**（origin=ai） | トリガ `guard_ai_proposal` + RLS `with check` の**二重** |

---

## 【重要】初回テストで**欠陥2件を検出し修正した**

指示された動作確認を実行したところ、**2件が期待どおりに動かなかった**。両方を修正して再検証している。

### 欠陥1: **ホワイトリスト照合が `ai_proposer` から常に失敗する**（実運用を止める重大な欠陥）

| 項目 | 内容 |
|---|---|
| 症状 | `ai_proposer` で `target_slug='fanza-kaiyaku'`（**実際には公開済み**）を INSERT すると `GUARD_WHITELIST: 公開済み記事ではない` で拒否された |
| 原因 | `guard_ai_proposal()` が **SECURITY INVOKER**（既定）で動くため、`editorial_articles` の照合が **`ai_proposer` の権限で実行される**。同テーブルは **RLS 有効（ポリシー2件）**で `ai_proposer` は対象外 → **SELECT が 0行を返し「公開済みでない」と誤判定**していた |
| 修正 | `guard_ai_proposal()` を **`security definer`** + **`set search_path = public, pg_temp`** に変更。併せて `revoke execute ... from public` |
| 影響 | **修正しなければ AI 提案バッチは1件も INSERT できず、B2②-b は起動しない**。**動作確認を指示されていなければ本番で気づけなかった** |

**この罠を `FACT_GOVERNANCE.md` §12 に記録した**（トリガ内から RLS 有効テーブルを参照する場合の注意）。

### 欠陥2: **`retired` からの UPDATE が「沈黙の0行」になっていた**

| 項目 | 内容 |
|---|---|
| 症状 | 初回テストで「NG 成功してしまった」と出た |
| 実際 | RLS ポリシーが `using (status <> 'retired')` だったため、**`retired` 行が UPDATE 対象として不可視**になり、**0行更新・例外なし**で終了していた。**状態は変わっていない（安全ではあった）** |
| 問題 | **エラーが出ないため、運用者が「更新できた」と誤認しうる**。§10「ツールの戻り値は着地の証拠にならない」と同型の危険 |
| 修正 | ポリシーを `using (true)` に変更し、**終端の強制はトリガ `guard_status_transition` に一本化**。これにより **明示的な例外 `GUARD_TERMINAL` が出る** |

**初回テストの結果を「テストの書き方が悪かっただけ」で片付けず、実際の `status` を読み戻す形にテストを作り直した**（各ケースで `実際の status=` を併記）。

---

## 動作確認（**修正後・14項目**）

| # | シナリオ | 期待 | 結果 |
|---|---|---|---|
| 1 | `ai_proposer` による `status='approved'` の INSERT | 失敗 | **OK 拒否**: `GUARD_AI_PROPOSAL: origin=ai の行は status=proposed でしか作成できない (given=approved)` |
| 2 | `ai_proposer` による `status='live'` の INSERT | 失敗 | **OK 拒否**: `GUARD_AI_PROPOSAL: … (given=live)` |
| 3 | `ai_proposer` による `origin='rule'` の INSERT | 失敗 | **OK 拒否**: `new row violates row-level security policy` ← **RLS 層が効いていることの実証** |
| 4 | `ai_proposer` による**正常な提案**（origin=ai / proposed / 公開slug） | **成功** | **OK 成功**（提案経路は通る） |
| 5 | `ai_proposer` による **UPDATE** | 失敗 | **OK 拒否**: `permission denied for table internal_links` ← **GRANT 層** |
| 6 | `link_approver` による **`proposed → live` の直行** | 失敗 | **OK 拒否**: `GUARD_TRANSITION` / **実際の status=proposed**（変化なし） |
| 7 | `link_approver` による `proposed → approved` | **成功** | **OK 成功** / **実際の status=approved** |
| 8 | `link_approver` による `approved → live` | **成功** | **OK 成功** / **実際の status=live** |
| 9 | **`retired` からの UPDATE** | 失敗 | **OK 拒否**: `GUARD_TERMINAL: retired は終端` / **実際の status=retired**（変化なし） |
| 10 | ガードレール: 未公開 slug | 失敗 | **OK 拒否**: `GUARD_WHITELIST` |
| 11 | ガードレール: `af_id=moterist-995` を含むアンカー | 失敗 | **OK 拒否**: CHECK `chk_no_external_or_affiliate` |
| 12 | ガードレール: アンカーが「こちら」のみ | 失敗 | **OK 拒否**: CHECK `chk_anchor_natural` |
| 13 | ガードレール: 同一 (source, target) の重複 | 失敗 | **OK 拒否**: UNIQUE `ux_internal_links_src_tgt` |
| 14 | ガードレール: 1記事あたり上限3本（4本目） | 失敗 | **OK 拒否**: `GUARD_MAX3: (article,fanza-payment-methods) の発リンクは上限3本 (現在 3)` |

**後片付け**: テスト行を全削除（**残存 0 行**）、テスト関数 `_b22b_test()` も削除（HTTP 201）。

### 指示された6項目との対応

| 指示 | 対応 | 結果 |
|---|---|---|
| `ai_proposer` による `status='approved'` の INSERT が失敗 | #1 | **実測で確認** |
| `ai_proposer` による `status='live'` の INSERT が失敗 | #2 | **実測で確認** |
| `ai_proposer` による UPDATE が失敗 | #5 | **実測で確認** |
| `proposed → live` の直行 UPDATE が失敗 | #6 | **実測で確認** |
| `retired` からの UPDATE が失敗 | #9 | **実測で確認**（修正後） |
| `link_approver` による `proposed → approved` が成功 | #7 | **実測で確認** |

---

# タスクB BRIEF_126 PR-2（レンダラ改修）の規模見積り — **実装していない**

## (1) 改修が必要な箇所と行数の概算

| 箇所 | 現状 | 改修内容 | 概算 |
|---|---|---|---|
| **`src/lib/internal-links.ts`**（新規） | 不在 | `live` 行を全件取得し `(source_type, source_id)` で索引化するリーダー。`editorial-articles.ts`（93行）と同型 | **新規 +60〜80行** |
| **`works/[floor]/[id]/page.tsx`**（832行） | `WORKS_GUIDE_LINKS` 定数（L49-54） | 定数を DB 読み取りに差し替え。**フェイルセーフ（取得失敗・0件なら定数にフォールバック or 非表示）** | **±20〜30行** |
| **`actresses/[id]/page.tsx`**（306行） | 同型の定数（L266 で使用） | 同上 | **±15〜20行** |
| `components/article-guide-links.tsx`（105行） | `links` prop を `map` するだけ | **変更不要**（`{slug,label}[]` の形が同じ） | **0行** |
| `articles/[slug]/page.tsx`（305行） | B2① の本文 markdown リンクで既に稼働 | **articles 間リンクを別ブロックとして出すなら +20行**。**本文リンク（B2①）とは別系統**であり同時に触らない | **0〜20行** |

**合計 概算 +115〜150行 / 変更ファイル 3〜4**。**新規ファイル1 + 既存2〜3ファイルの部分差し替え**。

## (2) 既存レンダラ制約との干渉 → **干渉しない**

| 既存の制約 | 干渉の有無 | 根拠 |
|---|---|---|
| **`## ` 見出し** | **なし** | 本文段落ループ（`articles/[slug]/page.tsx` L216）の話であり、`ArticleGuideLinks` は**本文の外**のコンポーネント |
| **`[[CTA:*]]` 完全一致マーカー** | **なし** | 同上。`p === "[[CTA:tv_signup]]"` の分岐に触れない |
| **`[text](/articles/slug)`（B2①）** | **なし** | B2① は**記事本文の markdown** を解釈する。`internal_links` は **works / actresses 面のブロック**であり**別系統**。ホワイトリストの情報源（`getPublishedArticleSlugs()`）を共有するだけ |
| `article_products` の末尾固定セクション | **なし** | 別セクション |

**結論: PR-2 は `ArticleGuideLinks` に渡す `links` の**供給元**を定数から DB に替えるだけで、レンダラの解析ロジックには一切触れない。**

## (3) DB クエリ追加によるレスポンスへの影響

### 【重要な実測】works 詳細ページは**現在 Supabase クエリを1本も持っていない**

`works/[floor]/[id]/page.tsx` のデータ取得は **FANZA API のみ**（`getWork` / `getRelatedWorks`）。**Supabase への接続は0**。
**PR-2 は works 詳細に「初めての Supabase 往復」を追加することになる。** works は **2,646 URL** あり、サイト最大の面である。

### 影響の見積りと緩和

| 項目 | 評価 |
|---|---|
| キャッシュ | **`revalidate = 300`**（5分）。**コストはリクエスト毎ではなく再生成毎**に発生する |
| クエリ形状 | **`select … from internal_links where status='live'` を1本だけ**発行し、**メモリ上で `(source_type, source_id)` に索引化**する設計を推奨。ページごとに `where source_id = ?` を撃たない |
| 行数の上限 | **承認可能量が上限**（§11）。初期スコープ articles 間で**最大24行**。works へ拡張しても**承認できる量しか live にならない**ため、全件取得しても数百行を超えない |
| フェイルセーフ | **取得失敗時は「リンクを出さない」**（`editorial-articles.ts` と同じ「未配線/エラーは null/空配列」規約）。**works 詳細の金 CTA を壊さない**ことが最優先 |
| リスク | **`VODNAVI_SILENT_DEATH_GUARD` と同型の懸念**。Supabase 側の障害が works 詳細のレンダリングに波及しないよう、**必ず try/catch で握って空配列を返す**こと |

**結論: 全件1クエリ + メモリ索引 + `revalidate=300` により、実質的なレスポンス影響は無視できる。ただしフェイルセーフの実装が必須。**

## (4) 所要工数の概算

| 工程 | 概算 |
|---|---|
| `internal-links.ts` の実装 | 小 |
| works / actresses ページの差し替え | 小 |
| `tsc --noEmit` / `eslint` / af_id 静的ガード | 小 |
| 本番 curl 検証（リンク描画 / 0件時に従前出力と同一） | 小 |
| **合計** | **小〜中**。**1コミット・1デプロイで収まる規模** |

## B2②-b 全6工程の進捗

| # | 工程 | 状態 |
|---|---|---|
| 1 | `internal_links` DDL | **完了**（第14便） |
| 2 | RLS ロール・ポリシー | **完了**（本便） |
| 3 | トリガ（不変条件） | **完了**（本便） |
| 4 | ガードレール6件 | **完了**（本便・DB 側に実装） |
| 5 | **PR-2 レンダラ改修** | **未着手**（見積り＝**小〜中・1コミット**） |
| 6 | `propose-internal-links.ts` | **未着手**（禁止事項・動作確認後） |

**9月中の完走可否についての事実**: **最も重いと想定された PR-2 が「小〜中・1コミット」規模**であり、**残る2工程はいずれも独立して実装できる**。**工数はボトルネックではない。** 律速は **①観測窓（R2 +4週 / β・α 〜9/30）との交錯** と **②承認可能量（§11）** である。

---

# タスクC Airtable テーブルの作成と同期設計

## (1)(2) `internal_link_proposals` を作成 → **完了**

| 項目 | 値 |
|---|---|
| base | `app0VKGU2B16qny6c` |
| **table id** | **`tblf18Iwgtb7FJi0Y`** |
| 主フィールド | **`内部ID`**（`internal_links.id` の uuid・突合キー） |
| ビュー | `Grid view`（`viwNZ4oyjHKYoZNJV`） |

| Airtable フィールド | 型 | 対応 | 同期方向 |
|---|---|---|---|
| `内部ID` | singleLineText（主） | `id` | S → A |
| **`ステータス`** | **singleSelect（提案中/承認済/掲出中/撤去）** | **`status`** | **A → S（この列のみ）** |
| `リンク元種別` | singleSelect（works/actress/article） | `source_type` | S → A |
| `リンク元ID` | singleLineText | `source_id` | S → A |
| `リンク先slug` | singleLineText | `target_slug` | S → A |
| `アンカーテキスト` | singleLineText | `anchor_text` | S → A |
| `配置` | singleSelect（fv/body/footer） | `position` | S → A |
| `提案元` | singleSelect（ai/rule） | `origin` | S → A |
| `提案理由` | multilineText | **DB に列なし・Airtable 専用** | S → A |
| `承認日時` | dateTime（**Asia/Tokyo** / ISO / 24時間） | `approved_at` | S → A（書き戻し） |
| `承認者` | singleLineText | `approved_by` | S → A（書き戻し） |

**各フィールドの description に運用注記を埋め込んだ**（「★人間の入力点はここだけ」「手入力しないこと」「**監査証跡であり『AIが承認していないことの証拠』ではない**」）。

**`posts` テーブルには一切変更を加えていない**（新規テーブルの作成のみ）。**scenario 5615632 にはアクセスしていない**。

## (3) 同期バッチの実装方針（**実装は次便**）

### S → A（提案の配信）

| 項目 | 内容 |
|---|---|
| タイミング | **AI 提案バッチの直後**（同一プロセスの末尾） |
| 対象 | `internal_links` の**新規行**（Airtable に `内部ID` が存在しないもの） |
| 動作 | `create_records_for_table` で作成。**既存行の内容列も差分があれば更新**（Supabase が正） |
| **`ステータス` 列** | **新規作成時のみ「提案中」を書く。以後は書かない**（A が正のため） |

### A → S（承認の取り込み）

| 項目 | 内容 |
|---|---|
| タイミング | **週次（木曜）**。既存の X 運用の在庫チェックと同じサイクル |
| 対象 | Airtable の `ステータス` が **「承認済」** の行 |
| 動作 | `link_approver` で `status='approved'` / `approved_at=now()` / `approved_by` を UPDATE |
| **`掲出中`（live）への遷移** | **バッチでは行わない**。**観測計画に従い CTO が明示的に UPDATE し、掲出時刻を JST 秒で台帳記録**する（S4 / B2① / B2②-a と同じ運用） |
| `撤去` | Airtable が「撤去」なら `status='retired'` へ UPDATE（**終端**） |

### 週次サイクルへの組み込み

**木曜のチェックリストに1項目を追加する**:
> X投稿在庫の確認 → **`internal_link_proposals` の「承認済」を Supabase へ同期** → 反映結果を台帳に記録

**新しい運用リズムを増やさない**（裁定 (3) の根拠と整合）。

### 同期失敗時の挙動

| 失敗箇所 | 挙動 |
|---|---|
| **S → A（Airtable への作成が失敗）** | **Supabase 側は既に `proposed` で確定している**。Airtable に出ないと**承認できないだけ**で、公開面には影響しない。**次回の同期で再試行**（`内部ID` で冪等） |
| **A → S（Supabase への UPDATE が失敗）** | **Airtable の `ステータス` は「承認済」のまま残る**。**次回の同期で再試行**（`status='proposed'` の行だけを対象にするため冪等） |
| **部分適用** | **行単位で独立**。1行の失敗が他行を巻き込まない。**トランザクションで束ねない**（束ねると1件の制約違反で全件が消える） |
| **不整合の検知** | 同期後に **`internal_links` の件数と Airtable の件数を突合**し、差分を台帳に記録する |

**方針の根幹**: **どちらの方向も「再実行すれば収束する」冪等な設計**にし、失敗時の復旧手順を持たない。

---

# タスクD `FACT_GOVERNANCE.md` への追記 → **§12 を新設**（節構成 §1〜§12 を確認済）

| 記録内容 | 状態 |
|---|---|
| **(1) `status` 4段階の定義と遷移規則** | 記録済（`live` のみ描画 / 4段階を残す理由 / `retired` は終端で再掲出は新規行 / 遷移規則） |
| **(2) `approved_by` 列の用途限定** | 記録済（**監査証跡に限定**。**【厳守】「AI が承認していないことの証拠」として扱わない**。保証するのは GRANT / RLS with check / トリガ3種であり、この列ではない。**誤解が固定されると後に危険な判断の根拠となる**） |
| **(3) DB が保証できること／できないことの切り分け** | 記録済（**指定された文面をそのまま収録**） |
| 追加で記録した実測 | ロールと権限の実測値 / **`guard_ai_proposal()` を `security definer` にした理由（RLS の罠）** |

---

# 禁止事項の遵守状況

| 禁止事項 | 状況 |
|---|---|
| R2 の実行 | **していない**（満了 8/13 00:31:05・**本便で前倒ししていない**） |
| β/α のデプロイ | **していない**（app-concierge のコードは**1行も変更していない**） |
| Concierge robots 対処の実行 | **していない** |
| `propose-internal-links.ts` の実装 | **していない**（**ガードレールは DB 側に実装**しており、バッチのコードは書いていない） |
| **BRIEF_126 PR-2 の実装** | **していない**（見積りのみ） |
| **同期バッチの実装** | **していない**（設計の提示まで） |
| `premium` / `video` / `tv`.dmm.co.jp へのアクセス | **していない** |
| af_id 990〜999 の人間向けCTAへの使用 | **していない**（**ガードレールとして DB で拒否する側に実装**） |
| **`posts` テーブルおよび scenario 5615632 への変更** | **していない**（新規テーブルの作成のみ・Make.com には未アクセス） |
| **`editorial_articles` への `og_copy` / `og_accent` の適用** | **していない** |

---

> 本記録は実測値の転記。動作確認で欠陥2件を検出し、修正して再検証した。テスト行・テスト関数はいずれも削除済み（`internal_links` の残存行数 **0**）。
