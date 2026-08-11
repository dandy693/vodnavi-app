# 第14便 — R2 は着手条件未充足 / internal_links DDL 適用 / B2②-b 設計 / 測定基盤の新設

- 実施: **2026-08-11 22:29 〜 22:50 JST**
- 遮断ドメインへは**一切アクセスしていない** / **Airtable の `Run automation` は押していない**
- **β / α のデプロイは行っていない** / **Concierge robots 対処は実行していない**

---

# 【最初に報告】タスクA と タスクC は**本日実行できない**

## 本便は「2026-08-13 実行」と題されているが、**現在は 2026-08-11 22:29:26 JST**

| 項目 | 実測 |
|---|---|
| **現在時刻** | **2026-08-11（火）22:29:26 JST** |
| 観測窓の満了 | **2026-08-13 00:31:05 JST** |
| **残り** | **26.0 時間**（1.08日） |
| 8/13 10:00 のアラート発報まで | 35.5 時間 |

## タスクA（R2）→ **実行していない**

`T-20260813-R2-EXEC` の着手条件2件（①APCTA 判定完了 ②アラート実地検証）は**いずれも未充足**。着手条件は「観測期間中の交絡回避のため」に設定されたものであり、**26時間早く実行すれば観測窓を26時間分短縮することになる**。

さらに本便を含む複数便の禁止事項に **「R2 の先行実行（8/13 00:31:05 満了後）」** が明記されている。

**→ 予定どおり 8/13 に実行する。** 準備は完了しており、当日は機械的に進められる状態にある（本記録末尾の実行手順を参照）。

## タスクC（β / α）→ **実行していない**

本便の禁止事項に **「R2 完了前の β/α のデプロイ」** が明記されている。R2 が未実行のため **β / α もデプロイできない**。

**ただし、デプロイ以外でできることはすべて実施した**:
- **事前予測の登録**（タスクC-5・下記）
- **差分の確定**（8/13 に機械的に適用できる形まで作成。**app-concierge のコードには一切コミットしていない**＝`main` push が auto-deploy を起こすため）

---

# タスクB【9月の主軸】B2②-b

## (1) `internal_links` の DDL 適用 → **完了**

### 適用経路

**Supabase Management API**（`POST /v1/projects/{ref}/database/query`）。**Chrome を経由していない**。
これは `FACT_GOVERNANCE.md` §10 の回避手順6「DB 作業前に MCP 疎通を確認し、通るなら Chrome を経由しない」に沿った選択で、**PAT 再発行により今日から使えるようになった経路**（第12便で第2経路として特定済）。

**実行結果: HTTP 201**

### 【運用則§10 適用】適用後の読み戻し

| 検査 | 実測 |
|---|---|
| テーブルの存在 | **`internal_links` あり** |
| 列数 | **10**（設計どおり） |
| **RLS** | **有効（`relrowsecurity = true`）** |
| **ポリシー数** | **0** |

列の実測:

| 列 | 型 | NULL | 既定値 |
|---|---|---|---|
| `id` | uuid | NO | `gen_random_uuid()` |
| `source_type` | text | NO | — |
| `source_id` | text | NO | — |
| `target_slug` | text | NO | — |
| `anchor_text` | text | NO | — |
| **`position`** | text | NO | — |
| `origin` | text | NO | — |
| **`status`** | text | NO | **`'proposed'`** |
| `created_at` | timestamptz | NO | `now()` |
| `approved_at` | timestamptz | YES | — |

CHECK 制約は設計どおり（`source_type` / `position` / `origin` / `status`）。

### 設計案からの逸脱2点（**いずれも報告する**）

| # | 逸脱 | 理由 |
|---|---|---|
| **1** | **`alter table editorial_articles add column og_copy / og_accent` を適用していない** | BRIEF_126 §2 の SQL ブロックには含まれるが、これは **スコープ④（アイキャッチ）** の要素であり **B2②-b ではない**。指示は「`internal_links` の DDL を適用すること」であり、**スコープを勝手に広げない** |
| **2** | **`"position"` を二重引用符で囲んだ** | Postgres の `POSITION(x IN y)` 関数と構文が衝突しうるため、CHECK 式内で曖昧性を排除した。**列名は `position` のまま**（引用は名前を変えない） |

### RLS の現状 → **deny-by-default。既存規約と一致**

ポリシー0件は「**anon からは一切アクセスできない / `service_role` は RLS をバイパスする**」状態。既存テーブルの規約と一致している:

| テーブル | RLS | ポリシー数 |
|---|---|---|
| `editorial_articles` | 有効 | 2 |
| `article_products` | 有効 | 1 |
| `fanza_response_cache` | 有効 | **0** |
| `sitemap_works_archive` | 有効 | **0** |
| **`internal_links`（新規）** | **有効** | **0** |

**RLS を有効化したことは (2) の「RLS ロール設計」の実装ではない。** ポリシー無効のまま公開すると anon から読み書きできてしまうため、**最小限の安全側の既定値**として有効化しただけである。**ロール設計の実装は CSO 承認後**。

---

## (2) RLS ロールの設計案（**提示のみ・実装は CSO 承認後**）

### 【用語の確認】指示の `'active'` は設計上の `'live'` に対応する

指示 (2) は「`'proposed'` → `'active'` への遷移」と記載しているが、**DDL の `status` に `'active'` は存在しない**（`proposed` / `approved` / `live` / `retired`）。**`'active'` ＝ レンダリングされる状態 ＝ `'live'`** と解釈した。**この解釈が誤っている場合は差し戻されたい。**

### 要件（指示より）

1. `origin='ai'` の INSERT は `status='proposed'` のみ許可
2. `'proposed'` → `'live'` への遷移は人間の承認を要する
3. **AI が自律的に `live` へ遷移させられないことを DB レベルで保証する**

### 設計案

**3つのロールに分離する。** アプリの `service_role` を AI バッチに使い回さないことが要点。

| ロール | 用途 | 権限 |
|---|---|---|
| **`ai_proposer`**（新規） | AI 提案バッチ専用 | `internal_links` に **INSERT のみ**。UPDATE / DELETE なし |
| **`link_approver`**（新規） | 承認オペレーション専用 | `status` の **UPDATE のみ**。INSERT / DELETE なし |
| `service_role`（既存） | アプリの読み取り（レンダラ） | 既存どおり。**RLS をバイパスするため、AI バッチには絶対に使わない** |

```sql
-- ① AI は proposed の行しか作れない（RLS ポリシー）
create policy ai_insert_proposed_only on internal_links
  for insert to ai_proposer
  with check (origin = 'ai' and status = 'proposed' and approved_at is null);

-- ② AI に UPDATE / DELETE を与えない（GRANT を出さない＝既定で不可）
grant insert on internal_links to ai_proposer;

-- ③ 承認者だけが status を進められる
create policy approver_update_status on internal_links
  for update to link_approver
  using (true)
  with check (status in ('proposed','approved','live','retired'));
grant select, update on internal_links to link_approver;
```

**さらに DB レベルで「AI が live を作れない」ことを二重に保証する** — RLS だけに依存しない:

```sql
-- ④ トリガ: origin='ai' の行が proposed 以外で INSERT されたら拒否
create function guard_ai_proposal() returns trigger as $$
begin
  if new.origin = 'ai' and new.status <> 'proposed' then
    raise exception 'origin=ai の行は status=proposed でしか作成できない';
  end if;
  return new;
end $$ language plpgsql;

create trigger trg_guard_ai_proposal
  before insert on internal_links
  for each row execute function guard_ai_proposal();

-- ⑤ 承認時刻の記録を強制（live へ遷移するなら approved_at 必須）
create function guard_live_requires_approval() returns trigger as $$
begin
  if new.status = 'live' and new.approved_at is null then
    raise exception 'status=live には approved_at が必要';
  end if;
  return new;
end $$ language plpgsql;

create trigger trg_guard_live
  before update on internal_links
  for each row execute function guard_live_requires_approval();
```

**設計の要点**: ①②は「AI に権限を与えない」、④⑤は「**万一 AI が `service_role` を持ってしまっても** live を作れない」という**二層防御**。RLS はロールを間違えると迂回されるため、**トリガによる不変条件を併置する**。

### 未解決の論点（CSO 裁定が必要）

| # | 論点 |
|---|---|
| 1 | **`approved` と `live` の使い分け**。承認済だが未掲出（`approved`）という状態が運用上必要か。不要なら `proposed` → `live` の2値でよい |
| 2 | **`ai_proposer` の資格情報をどこに置くか**。Vercel env への secret 書き込みは **HUMAN Dashboard 手動が確定ルート**（既存教訓）＝**HUMAN 介在が1件増える**（ログ分類 **B**） |
| 3 | **`retired` からの復帰**を許すか |

---

## (3) 承認フローの設計案（**提示のみ**）

### Airtable 案 — **流用可能。ただし新規テーブルの作成が必要**

X投稿運用の実績（`posts` テーブル・`ステータス` singleSelect・automation `wflfLOp2JJo89imzQ`）と**同じパターンが使える**。

**実測（本日）**: base `app0VKGU2B16qny6c` には **`posts` の1テーブルのみ**が存在する。**新規テーブル `internal_link_proposals` の作成が必要**。

| Airtable 側 | 対応する `internal_links` の列 |
|---|---|
| `ステータス`（singleSelect: 提案中 / 承認済 / 掲出中 / 撤去） | `status`（proposed / approved / live / retired） |
| `リンク元`（singleLineText） | `source_type` + `source_id` |
| `リンク先slug`（singleLineText） | `target_slug` |
| `アンカーテキスト`（singleLineText） | `anchor_text` |
| `配置`（singleSelect: fv / body / footer） | `position` |
| `提案元`（singleSelect: rule / ai） | `origin` |
| `承認日時`（dateTime） | `approved_at` |
| `内部ID`（singleLineText） | `id`（uuid・突合キー） |

**運用**: CSO は Airtable のグリッドで `ステータス` を「提案中 → 承認済」に変えるだけ。**X投稿運用とまったく同じ操作**であり、新しい習得コストがない。

### Make.com 案 — **連携可否は「可能。ただし要確認事項が2点」**

| 項目 | 評価 |
|---|---|
| 新規シナリオ（`5615632` とは別） | **必要**。X投稿シナリオを流用しない（トリガも宛先も異なる） |
| トリガ | Airtable の `ステータス` 変更（Watch Records） |
| アクション | Supabase へ HTTP リクエスト（`PATCH /rest/v1/internal_links?id=eq.{uuid}`） |
| **要確認①** | **Make.com の現行プランで新規シナリオを追加できるか**（オペレーション数の上限）＝**CTO 未確認** |
| **要確認②** | **Supabase の資格情報を Make.com に保持させる是非**。`link_approver` ロールの鍵を外部 SaaS に置くことになる |

### **CTO の代替案（Make.com を使わない）**

**Airtable を「承認 UI」としてだけ使い、同期は CTO のバッチで行う**:

1. AI バッチが `internal_links` に `proposed` で INSERT
2. **同バッチが Airtable にも同じ行を作成**（`create_records_for_table`）
3. CSO が Airtable で `ステータス` を「承認済」に変更
4. **CTO が週次で Airtable を読み、`internal_links.status` を UPDATE**（`list_records_for_table` → SQL）

| | Make.com 案 | CTO バッチ案 |
|---|---|---|
| 反映の速さ | **即時** | **週次**（または CTO 起動時） |
| 外部 SaaS への資格情報預託 | **必要** | **不要** |
| HUMAN 介在 | 承認のみ（**分類 C**） | 承認（**C**）+ CTO 起動（自動化済なら 0） |
| 追加コスト | Make.com のオペレーション | なし |

**内部リンクの反映に即時性は不要**（記事公開時 + 月1見直しの頻度＝BRIEF_126 §5）。**CTO バッチ案を推奨する。** ただし裁定は CSO。

---

## (4) `propose-internal-links.ts` の設計案（**実装は (2)(3) の CSO 承認後**）

| 項目 | 設計 |
|---|---|
| 配置 | `app-concierge/scripts/propose-internal-links.ts` |
| 起動 | `node --env-file=.env.local`（`generate-work-reviews.ts` と同じ規約） |
| 入力 | ①`editorial_articles` の公開記事 全文 + slug 一覧 ②`internal_links` の既存行（重複回避） |
| モデル | **`claude-sonnet-4-6`**（BRIEF_126 §5 の指定） |
| 出力 | JSON 配列 `{source_type, source_id, target_slug, anchor_text, position, reason}` |
| 書き込み | **`internal_links` に `origin='ai'` / `status='proposed'` で INSERT のみ**。`ai_proposer` ロールを使う |

### ガードレール（**プロンプト + 後段バリデーションの二重**・BRIEF_126 §5）

| # | ルール | 後段検査 |
|---|---|---|
| 1 | `target_slug` は**公開済み slug のホワイトリスト完全一致** | `getPublishedArticleSlugs()` と照合。不一致は破棄 |
| 2 | **外部URL・`af_id`・DMM ドメインを含む提案は自動リジェクト** | 正規表現。**`moterist-99[0-9]` も検査**（§8） |
| 3 | **1記事あたりの発リンク上限 3** | カウント |
| 4 | **同一 `(source_id, target_slug)` の重複禁止** | 既存行と突合 |
| 5 | アンカーは自然文（**「こちら」等は禁止**） | 禁止語リスト |
| 6 | **`status` は必ず `proposed`** | ④のトリガでも二重に保証 |

### 適用範囲の初期スコープ（CTO 案）

**`source_type='article'`（articles 間リンク）から始める**。理由:
- works は **2,646 URL** あり、AI 提案の件数が一度に膨らむと**承認が破綻する**（承認は分類 C＝減らせない人間の作業）
- articles は **8本**で、上限3本/記事なら**最大24行**＝承認が現実的
- **works への展開は articles 間で運用が回ってから**

**この初期スコープは CSO 裁定事項。** 指示は works/actresses → articles を主眼としているため、異なる判断があればそれに従う。

---

# タスクC β + α — **事前予測を登録。デプロイは 8/13 の R2 完了後**

## (5) 事前予測（**§6・実施前に確定**）

> **本施策（β + α）は 9/30 ゲート①（articles 面のアフィリエイトクリック 30件）には届かない。** articles 表示回数が月換算 約12 である以上、articles 面 CTA の CTR が 100% でも上限は 12件であり、30件には算術的に到達しない（第12便の算術）。
>
> **目的は補助指標 ①-a（works→articles の内部リンククリック）を 0 から動かし、導線が物理的に機能するかを判定することにある。**
>
> **予測値**: works 表示回数 月換算 **約3,450** × 参考 CTR **0.17%**（同一ページ内の別導線 `concierge_entry_click` の実測値を代入）＝ **月 約6件**。
> **留保**: リンクが1本→2本になっても **works の表示回数は変わらない**。**CTR が2倍になる保証はない**。現行の実測 CTR は **0.00%（0/600）** であり、**0.17% 自体が別イベントからの代入値**である。
>
> **判定は ①-a が 0 か 1以上かのみで行う。** 件数が予測（月6件）を下回っても、それ自体を「失敗」と読まない（§6 の既定）。
>
> **①-a が 0 のまま 9月末を迎えた場合、事前登録した帰結に進む＝ articles 経路を12月目標から外す。**

**α と β を同時に打つため、どちらが効いたかは分離できない。** これは意図した設計であり（残り約7週間で逐次実験の観測期間が取れない）、**原因の分離は ①-a が1以上になってから次サイクル（10月以降）で行う**。

## 確定した差分（**8/13 の R2 完了後に適用する。本便ではコミットしていない**）

### 差分1: `WORKS_GUIDE_LINKS` の2本化（`works/[floor]/[id]/page.tsx:49-54`）

```ts
const WORKS_GUIDE_LINKS = [
  {
    slug: "fanza-first-guide",
    label: "FANZAで初めて購入する方へ",
  },
  {
    slug: "fanza-subscription-vs-single-purchase",
    label: "この作品、見放題プランに入っているかもしれません",
  },
] as const;
```

### 差分2: 見出しの変更（同 `page.tsx:511`）

```
heading="はじめての方へ"  →  heading="この作品について知っておくこと"
```

### 差分3（α）: mobile FV ブロックへの複製昇格（同 `page.tsx` L344-352 の直後・`lg:hidden` の div 内）

```tsx
<ArticleGuideLinks
  surface="works"
  sourceId={item.content_id}
  heading="この作品について知っておくこと"
  links={WORKS_GUIDE_LINKS}
/>
```

**注意**: 現行コード L507 のコメント「ページ内で1回だけ描画する（mobile FV 側には置かない＝リンク重複を増やさない）」は **α により無効になる**。**コメントも同時に更新する**（放置すると次の担当者が誤読する）。

### 事前確認（本便で実測済）

| 検査 | 実測 |
|---|---|
| 追加する slug `fanza-subscription-vs-single-purchase` は公開済みか | **published**（MCP 実測） |
| 公開面 | **HTTP 200** |
| af_id ガードへの抵触 | **なし**（追加するのは `/articles/<slug>` の内部URLのみ） |
| sitemap / robots / canonical への影響 | **なし**（works 詳細の HTML 本文のみ変更）＝ **R2 の判定を汚染しない** |

### デプロイ時の記録義務

**デプロイ時刻を JST 秒単位で記録し、前後で分離集計する**（S4 / B2① / B2②-a と同じ運用）。R2 のデプロイとは**別コミット・別デプロイ**にすること。

---

# タスクD 測定基盤の新設 → **2ファイルを新設**

## (1) HUMAN 介在ログ → `management/_metrics/HUMAN_INTERVENTION_LOG.md`

**2026-08-11 の CSO 実績を初回記録として登録した。**

| 分類 | 件数 | 内訳 |
|---|---|---|
| **A. 構造的に自動化不能** | **3種**（実件数 15） | DMM 実査4回 / スクリーンショット7枚 / 着地確認4本 |
| **B. 現時点で自動化未実装** | **4種** | PAT再発行 / 環境変数編集 / ログイン / Chrome再起動 |
| **C. 承認行為** | **0種** | — |

**所要時間は今回計測していないため全件「未計測」と記録した**（推定値を書かない＝§4）。次回から計測する。

### 初回記録からの所見（事実のみ）

- **C（承認行為）が 0件**。現状の HUMAN 介在はすべて A（実査）と B（インフラ操作）で、**「AIが提案し人間が承認する」形にはまだなっていない**
- **B の4種はすべて Supabase / Chrome まわりに集中**
- **判定の考え方**: 総件数の減少ではなく、**B が減り C の比率が上がること**を自動運用の進捗とする

## (2) 経過日数バケット別クリック内訳 → `management/_metrics/COHORT_CLICK_LOG.md`

**取得方法を確定した**:

| 要素 | 情報源 |
|---|---|
| **クリック数（分子）** | **GA4**（`ai_affiliate_click` / `product_click` の `content_id` 別）。**DMM レポートは af_id 単位でページ・CTA 別に分解できない**（Q-2 の回答「サブパラメータの用意はない」）ため分子には使えない |
| **発売日** | **FANZA API** の `date`（`YYYY-MM-DDT00:00:00` 形式のみ受理） |
| **DMM で分解できる軸** | **報酬種別 / 商材単位のみ** → **参考値として併記**。バケット分解には使えない＝**取得不可** |

**控除対象を記録した**: **2026-08-11 の CSO 着地確認 4クリック**。**GA4 には計上されない**（検証用 Chrome は `/g/collect` を送信しない）が **DMM には計上される**（`al.dmm.co.jp` を実際に踏んだため）。**8月の DMM クリック数から 4件を控除して解釈する。GA4 側は控除不要。**

**初回測定は 2026-09-01（8月分）。3点（8月・9月・10月）が揃う 2026-11-01 に判定可能**。

**判定ルールも観測前に確定した**: 365日超バケットの**件数と構成比の両方**を見る / **3点揃うまで判定しない** / **archive は累積設計で単調増加するため構成比を主指標とする**。

---

# 8/13 当日の実行手順（**準備完了**）

| # | 時刻 | 実施 | 期待値 |
|---|---|---|---|
| 1 | 00:31:05 以降 | 観測窓 満了の確認 | — |
| 2 | 日中 | **APCTA 判定** | **CTA 有効性は判定しない**（標本規模不足・L2918-2924） |
| 3 | 10:00 以降 | **アラート実地検証 項目1〜4** | Run history 1件 / `Find records` **0件** / 条件分岐通過 / `Send an email` Success。**`Run automation` は押さない**。項目5 は診断用途のみ |
| 4 | 2・3 完了後 | **R2 実施**（案A） | 実装 → `tsc --noEmit` / `eslint` / **af_id 静的ガード** → **デプロイ前に CSO へ差分報告** → デプロイ |
| 5 | R2 デプロイ後 | **公開後チェック第5項** | **`root lastmod` がデプロイ時刻以降に更新されたことを確認してから loc を読む** → 基準線（実装直前に再取得。8/11 22時点 **2,964**）から **delta −400** / `/articles/` **8本のまま** / 記事A **1件のまま** |
| 6 | R2 完了後 | **β + α を別コミット・別デプロイ** | デプロイ時刻を JST 秒で記録 |

**Concierge robots 対処は統合しない**（第13便で分離を確定）。

---

# 禁止事項の遵守状況

| 禁止事項 | 状況 |
|---|---|
| Concierge robots 対処の実行 | **していない** |
| B2②-b の RLS ロール・承認フローの**実装** | **していない**（設計案の提示のみ。**RLS 有効化はポリシー0件の deny-by-default＝安全側の既定値**であり、ロール設計の実装ではない） |
| `premium` / `video` / `tv`.dmm.co.jp へのアクセス | **していない** |
| af_id 990〜999 の人間向けCTAへの使用 | **していない** |
| **R2 完了前の β/α のデプロイ** | **していない**（R2 自体が未実行。**app-concierge のコードには1行もコミットしていない**＝`main` push が auto-deploy を起こすため） |
| Airtable の `Run automation` の実行 | **していない**（読み取りのみ: `list_tables_for_base`） |
| ゲート①の目標値の変更 | **していない**（30件のまま） |
| **R2 の先行実行** | **していない**（観測窓は 26時間後に満了） |

---

> 本記録は実測値の転記と設計案。DDL 適用は実施し読み戻しで確認した。R2 / β / α はいずれも未実行。
