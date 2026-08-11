# 第12便 — B2②-b の特定 / DDL 未適用の理由 / 代替施策の比較材料 / ゲート①の再算術

- 実施: **2026-08-11 19:50 〜 20:15 JST**
- **実装・DDL適用・デプロイ・マージはいずれも行っていない**
- 遮断ドメイン（`premium` / `video` / `tv`.dmm.co.jp）へは**一切アクセスしていない**
- **R2 は実行していない** / **Airtable には一切アクセスしていない**

---

# タスクA B2②-b が何をする施策か

## (1) 設計意図と B2②-a との差分

出典: `management/STRATEGY_BRIEF_126_B2_IMPLEMENTATION_PLAN.md` §2/§3/§5 と `management/_metrics/2026-W31/proposal-20260803-0215-b2-2-works-actresses-to-articles.md` §3。

| 観点 | **B2②-a（デプロイ済）** | **B2②-b（未着手）** |
|---|---|---|
| リンクの決め方 | **コード内の定数配列**（`WORKS_GUIDE_LINKS`） | **DB の行**（`internal_links`） |
| 出し分け | **なし**（全 works が同一リンク） | **作品ごと・女優ごとに出し分け** |
| リンク元 | rule のみ | **`origin='rule'` と `origin='ai'` の2系統**。AI は Claude API バッチ（`scripts/propose-internal-links.ts`）が提案 |
| 承認フロー | なし（コードレビュー＝PR） | **`status`: `proposed` → `approved` → `live` → `retired`**。AI 実行キーは **`proposed` の INSERT のみ**を DB ロールで強制 |
| ロールバック | **コード revert**（PR 単位） | **`status='retired'` へ UPDATE → 次レンダで消滅**（コード revert 不要） |
| 配置位置の制御 | コード上の固定位置 | **`position` 列**（`fv` / `body` / `footer`） |
| アンカーテキスト | コード内の固定文字列 | **`anchor_text` 列**（行ごとに可変） |

**設計意図の核心は「リンクの内容をコードから DB へ移し、AI 提案 → 人間承認 → 機械レンダのパイプラインを作ること」**。BRIEF_126 §5 のガードレール（slug ホワイトリスト / 外部URL・af_id・DMMドメイン自動リジェクト / 1記事の発リンク上限3 / 同一ターゲット重複禁止 / 「こちら」等のアンカー禁止）も B2②-b 側の仕組み。

## (2) `internal_links` テーブルが担う役割

**「リンク先の動的選定」と「リンクの管理（承認フロー）」の両方**。計測ではない（計測は GA4 の `article_guide_click` で B2②-a 時点から既に実装済）。

| 役割 | 担う列 |
|---|---|
| **リンク先の動的選定** | `source_type` / `source_id`（works の content_id・actress の id）→ `target_slug` |
| **リンクの管理** | `status`（承認フロー）/ `origin`（rule か ai か）/ `approved_at` |
| **配置とテキストの制御** | `position` / `anchor_text` |
| 計測 | **担わない**（GA4 側で完結） |

### 静的なアンカー追加との違い

| | 静的（B2②-a） | DB 駆動（B2②-b） |
|---|---|---|
| 「この作品にはこの記事」の個別最適 | **できない** | **できる** |
| リンクの追加・変更・撤去 | **コード変更 + デプロイが必要** | **SQL の UPDATE のみ**（デプロイ不要） |
| AI にリンク候補を作らせる | できない | **できる**（`proposed` 止まりを DB 権限で強制） |
| 実装コスト | 済 | **DDL + レンダラ改修 + バッチ + 承認運用** |

## (3) B2②-b で変わるのはどれか

| 変数 | B2②-a の現状（**実測**） | B2②-b で変わるか |
|---|---|---|
| **本数** | **works 1本 / actresses 1本**（後述の実測どおり、works 詳細の `WORKS_GUIDE_LINKS` は**1要素**） | **変わりうる**（BRIEF_126 §5 の上限は「1記事の発リンク3本」。works 側の上限規定はなし） |
| **リンク先の選定方法** | **全 works 一律で `fanza-first-guide` 固定** | **変わる（本質的な差分）**。作品・女優ごとに別記事へ出し分け |
| **配置位置** | 金 CTA 直下に固定 | **変わりうる**（`position` = fv/body/footer） |
| **アンカーテキスト** | 全 works で同一の固定文字列 | **変わる**（`anchor_text` 列で行ごとに可変） |

**→ B2②-b の本体は「リンク先の選定方法」と「アンカーテキスト」の可変化であり、「本数を増やす施策」ではない。**

## (4) 実装済みコードの範囲

| 対象 | 状態 |
|---|---|
| **B2①**（記事レンダラの本文リンク） | **PR #62** マージ済・デプロイ済（2026-08-02 22:18:52） |
| **B2②-a** | **PR #66**（merge `6e07942` / 実装 `643ff1f`）マージ済・**デプロイ済**（2026-08-03 06:15:20）。実体 = `app-concierge/src/components/article-guide-links.tsx` |
| **B2②-b** | **実装コミットは存在しない**（`git log --all --grep` で0件） |
| `internal_links` の DDL | **リポジトリに存在しない**（BRIEF_126 §2 の Markdown 内 SQL 案のみ） |
| `scripts/propose-internal-links.ts`（AI 提案バッチ） | **存在しない**（`app-concierge/scripts/` に不在） |

**B2②-b は「起案と設計のみ」で、実装は1行も存在しない。**

---

# タスクB DDL 未適用の理由

## (1) 「HUMAN 枠」とされている理由 → **権限の問題**（未着手ではない）

| 経路 | 状態 |
|---|---|
| Supabase MCP | **`--read-only` 起動**（`.mcp.json`）。実測 `current_setting('transaction_read_only')` = **`on`** → **DDL 不可** |
| Management API | 起案時点（2026-08-03）は **`SUPABASE_ACCESS_TOKEN` 失効中**で叩けなかった |

BRIEF_126 §2 は「適用は MCP でなく Management API（MCP supabase は read-only）」と明記しており、**当初から MCP 経由の適用は設計上不可**とされていた。

**【2026-08-11 の状況変化】PAT 再発行により Management API は HTTP 200 で疎通する**（本日タスクAで実測）。**「トークンが無い」というブロッカーは解消している。**

## (2) 現在の実行経路（実測）

| 経路 | DDL 可否 | 備考 |
|---|---|---|
| Supabase MCP | **不可** | `--read-only`。`apply_migration` も本セッションでは**サーバ側から切断**されている |
| **Chrome → SQL Editor** | **可** | 現に publish の UPDATE を実行できた経路 |
| **Supabase Management API**（`POST /v1/projects/{ref}/database/query`） | **可**（トークン有効化により） | **PowerShell から直接叩ける＝Chrome を経由しない** |

**→ 経路は「Chrome → SQL Editor のみ」ではない。Management API という第2経路が今日から使える。**

## (3) DDL の内容とリスク

```sql
create table internal_links (
  id uuid primary key default gen_random_uuid(),
  source_type text not null check (source_type in ('works','actress','article')),
  source_id   text not null,
  target_slug text not null,
  anchor_text text not null,
  position    text not null check (position in ('fv','body','footer')),
  origin      text not null check (origin in ('rule','ai')),
  status      text not null default 'proposed' check (status in ('proposed','approved','live','retired')),
  created_at  timestamptz not null default now(),
  approved_at timestamptz
);
alter table editorial_articles add column og_copy text;
alter table editorial_articles add column og_accent text check (og_accent in ('green','blue','amber','rose'));
```

| リスク | 評価 |
|---|---|
| **新規テーブルの CREATE** | **既存に影響しない**。参照するコードが存在しないため、作っただけでは挙動が変わらない |
| **`editorial_articles` への ALTER（2列追加）** | **NULL 許容の純加算列**。既存 SELECT は列を明示指定（`select id, title, slug, description, body`）のため**影響しない**。`og_copy` は「NULL = タイトルのみ表示」のフェイルセーフ設計 |
| RLS | BRIEF_126 は「anon read / service_role write」+ **AI 実行キーには `proposed` INSERT のみ許可のロール**を要求。**このロール設計は DDL 案に含まれておらず別途必要** |
| 逆方向 | `drop table internal_links` / `alter table … drop column` で戻せる。**ただし `editorial_articles` への ALTER は本番テーブルへの変更**であり、慎重を要する |

**最大のリスクは DDL そのものではなく、「テーブルを作っても参照するコードが無いため、B2②-b の実装が別途必要」という点**（BRIEF_126 §6 の PR-1〜PR-4）。

## (4) 所要時間の見積り

| 工程 | 見積 | 枠 |
|---|---|---|
| DDL 適用（CREATE + ALTER 2列） | **5分未満**（Management API 1回 / SQL Editor 1回） | CTO 可（Management API 経由） |
| 適用確認（`list_tables` / 列の SELECT） | 2分 | CTO |
| RLS ロール設計・適用 | **未設計**＝見積不能 | 要設計 |
| B2②-b 実装（レンダラが `internal_links` を読む） | 中（PR-1 相当） | CTO |
| AI 提案バッチ（`propose-internal-links.ts`） | 中 | CTO |
| 承認運用（proposed 一覧 → CSO 承認 → live UPDATE） | 継続運用コスト | CSO + CTO |

**DDL の適用自体は5分。ボトルネックは DDL ではなく、その後の実装と承認運用。**

**※ 本便では DDL を適用していない。**

---

# タスクC 代替施策との比較材料

## (1) B2②-b の期待効果 → **ゲート①への寄与は小さいと見込まれる**

**根拠（事実のみ）**:

- B2②-b が変えるのは**リンク先の選定方法とアンカーテキスト**であり、**リンクの露出量（本数・位置）は主たる変更点ではない**（タスクA(3)）
- B2②-a（同じ位置・同じ露出）の実測 CTR は **0/600 = 0.00%**
- **CTR 0.00% の原因が「リンク先が作品と無関係だから」なのか「そもそも見られていないから」なのかは未分離**。前者なら B2②-b は効き、後者なら効かない
- **この分離こそが補助指標 ①-a の用途**（0件なら「導線が物理的に機能していない」）

## (2) Concierge パラメータの robots 対処 → **クロール予算の施策であり、ゲート①には直接効かない**

| 項目 | 値 |
|---|---|
| 回収量 | 未送信 **665件** / **346クロール/日** ≒ **1.9日分**（CSO 提示値） |
| ゲート①（articles 面クリック）への直接効果 | **なし**。クロール予算は**インデックス**の施策であり、**クリック**を増やす経路が無い |
| 間接効果 | articles がクロールされやすくなる可能性はあるが、articles は7本（現8本）で**クロール枯渇が律速である証拠はない** |

**→ 実施の是非はゲート①とは別の軸（クロール衛生）で判断すべき。**

## (3) works 詳細のアンカー配置の見直し — **実測**

### 【重要な差異】「3アンカー」の内訳は **B2②-a 1本 + U1 2本**

`https://app.vodnavi.jp/works/videoa/ebwh00155` の SSR HTML 実測（RSC payload を除外）:

| # | オフセット（SSR 内） | 由来 | アンカーテキスト |
|---|---|---|---|
| 1 | 10,712（**16.0%**） | **U1 `NewUserFvModule`**（mobile FV ブロック内） | **はじめてのFANZAガイド** |
| 2 | 20,076（**29.9%**） | **B2②-a `ArticleGuideLinks`** | **はじめてのFANZA — 登録3分の手順と、支払い・解約の不安への答え**（見出し「はじめての方へ」） |
| 3 | 21,522（**32.1%**） | **U1 `NewUserFvModule`**（lg 用の2つ目のインスタンス） | **はじめてのFANZAガイド** |

- **リンク先は3本とも同一**（`/articles/fanza-first-guide`）。**ユニーク slug は1つ**
- **`WORKS_GUIDE_LINKS` は要素1個**（`page.tsx:49-54`）＝ B2②-a が出すリンクは**1本**
- したがって「works 詳細に3アンカー」という台帳表現は**HTML 上の出現数**であり、**B2②-a の施策としては1本**

### 配置位置（デスクトップ 1145×906 で実測）

| 要素 | ページ上端からの Y | ファーストビュー（fold 906px）内か |
|---|---|---|
| H1 | 162px | 内 |
| 金 CTA | 632px | 内 |
| **B2②-a のアンカー** | **786px** | **内（ぎりぎり）** |
| U1 のアンカー | 919px | **外** |
| ドキュメント全高 | 4,156px | — |

### モバイルでの位置 → **取得不可**

`resize_window` が**2回とも「成功」を返しながら `window.innerWidth` が 1145 のまま変化しなかった**（運用則 §10 の事象）。3回目は試みず中断した。

**ただしコード上、以下は確定している**（`page.tsx:507` のコメントが明示）:

> ページ内で1回だけ描画する（**mobile FV 側には置かない**＝リンク重複を増やさない）

- **mobile FV ブロック（`lg:hidden`・L323-352）には B2②-a のリンクが無い**。あるのは金 CTA（`detail_fv_cta`）+ U1 + 女優/ジャンルのチップのみ
- mobile では 3:4 画像（max-h 220px）+ H1 + FV ブロック + メタデータ + `detail_main_cta` の**後**に B2②-a が来る
- **参考（GA4 物理監査 2026-06-24・コード内コメントに記録）**: 作品詳細の平均滞在 **1〜6秒** / **scroll 90% 到達は 4.6%**

## (4) CTO 側の候補（**提示のみ。実行していない**）

| # | 候補 | ゲート①への効き方 | コスト | 備考 |
|---|---|---|---|---|
| **α** | **B2②-a のリンクを mobile FV ブロック内へ複製昇格**（`detail_fv_cta` の直下） | **露出量を直接増やす**。金 CTA と同じ「3秒の視界ハック」の適用 | **小**（既存コンポーネントを1箇所追加描画） | L507 の「mobile FV 側には置かない」判断の**再検討**にあたる。金 CTA を減らさない前提は維持できる |
| **β** | **リンク先を1本→複数へ**（`fanza-tv-free-trial` / `fanza-payment-methods` を追加）| 選択肢が増える。**B2②-b なしで実施可**（定数配列に要素追加するだけ） | **極小** | B2②-b の「出し分け」ではなく「一律で複数」。起案書 §3 の B2②-a 原案（2〜3リンク）に戻すだけ |
| **γ** | **アンカーテキストの見直し** | 現行は32文字の説明文。金 CTA と競合する長文 | 極小 | 効果は未知 |
| **δ** | **U1 と B2②-a の統合** | 同一リンク先が3本ある状態の整理。**クリックを増やす施策ではない** | 小 | 重複はユーザー体験上の冗長 |

**いずれも α 以外は露出量を大きく変えない。**（4）の中で**露出量に効くのは α のみ**。

**なお下記タスクD のとおり、works 側の CTR をいくら上げても articles 表示回数が桁で足りないため、ゲート①（30件）には算術的に届かない。** 候補の優劣は「ゲート①達成」ではなく「①-a を0から1にする（導線が機能することの実証）」で評価するのが実態に合う。

---

# タスクD ゲート①の到達可能性の再算術

## (1) works 表示回数の月換算

| 項目 | 値 |
|---|---|
| 実測（GA4・2026-08-06 〜 08-11 05:12） | **600 表示** / アクティブユーザー 252 / 208ページ |
| 期間 | 5日5.2時間 ＝ **5.22日** |
| 日次 | **115.0 表示/日** |
| **月換算（30日）** | **約 3,450**（6暦日で保守的に割ると **3,000**） |

**参考（本日 20:0x の GA4 実測・直近28日）**: サイト全体の表示回数 **6,602** / アクティブユーザー **2,530** / **1,520ページ**。
※ **works の内訳は取得不可**。GA4 ページレポートのテーブル絞り込みが①`computer type`＋Enter ②ネイティブ setter + input/keydown イベント ③URL の `filterTerm` パラメータ の**3方式とも反応しなかった**（①②は §10 の事象、③は `intelligenthome` へリダイレクト）。

## (2) articles 表示回数の月換算

| 項目 | 値 |
|---|---|
| 実測（GA4・2026-08-06 〜 08-11 05:12） | **2 表示**（`fanza-first-guide` のみ・1ユーザー・1分32秒。他6記事は 0） |
| **月換算（30日）** | **約 10〜12** |
| **記事A（本日 18:31 公開）の寄与** | **0**（公開から約1.5時間・GA4 反映前。**新規記事の検索流入立ち上がりに通常2〜3ヶ月**＝`T-20260811-ARTICLE-A-OBSERVE` で事前登録済） |

## (3) ゲート①（30件）達成に必要な CTR

### 従来の算術（works→articles のクリック＝ゲート①の分子とみなす場合）

| 分母 | 必要 CTR |
|---|---|
| works 月換算 **3,000** | **1.00%** |
| works 月換算 **3,450** | **0.87%** |

### 【重要】この算術は「works からの到達者が100%アフィリエイトCTAを押す」を暗黙に仮定している

ゲート①の分子は **articles 面のアフィリエイトクリック**（`guide_tv_signup_cta` / `article_product_cta` ほか4種）であり、**works→articles の内部リンククリック（`article_guide_click`）ではない**（`GATE_20260930.md` の分子定義 / 台帳 L2680 が明示）。分解すると:

```
ゲート①の件数 = articles 表示回数 × articles 面 CTA の CTR
```

| 仮定する articles 面 CTA の CTR | 必要な **articles 表示回数/月** |
|---|---|
| **7.55%**（works 金 CTA の実測値を代入した**参考値**） | **約 397** |
| 15%（楽観） | 約 200 |
| **100%（上限）** | **30** |

**現状の articles 表示回数 月換算 ≒ 12。CTR が仮に 100% でも上限は 12件**であり、**30件には算術的に届かない。**

→ **ゲート①の律速は「articles 面の CTA が押されないこと」ではなく「articles が表示されていないこと」。**

### works からの転送で必要になる CTR（articles 397表示/月 を works から作る場合）

| 必要な works→articles CTR | 算式 |
|---|---|
| **11.5%** | 397 ÷ 3,450 |

## (4) 観測されている最良の CTR との倍率

| 比較対象 | 値 | 倍率 |
|---|---|---|
| **works→articles の実測 CTR** | **0.00%**（0 / 600） | **倍率は算出不能**（分子0） |
| 同一ページ内の別導線 `concierge_entry_click` | **0.17%**（1 / 600） | 従来算術（0.87%必要）に対し **約5.2倍** / （1.00%必要）に対し **約6.0倍** |
| 同 `concierge_entry_click` | 0.17% | **分解後の算術（11.5%必要）に対し約 68倍** |
| works 金 CTA（サイト内最良の CTR） | **7.55%** | 11.5% に対し **約1.5倍**。**サイト内で最も押されている導線の水準を上回る必要がある** |

## 判定材料としての要約（**目標値は変更しない**）

1. **articles 表示回数（月換算 約12）がゲート①の目標値 30 を下回っている**。CTR を上限の100%にしても届かない
2. 律速は **CTA の性能ではなく articles への流入量**
3. works から必要量を転送するには **works→articles CTR 11.5%** が必要で、これは**サイト内最良の導線（金CTA 7.55%）を上回る**
4. **これらは §6 の既定に従い「観測期間不足・継続観測」と記録すべき事実であり、目標値を下げる根拠にはしない**（`GATE_20260930.md` L42 の再変更禁止を遵守）
5. 補助指標 **①-a（works→articles 内部リンククリック ≥1件）** は、上記1〜3が「導線が機能していない」からなのか「流入がない」からなのかを分離する診断として機能する

---

# 禁止事項の遵守状況

| 禁止事項 | 状況 |
|---|---|
| `internal_links` の DDL 適用 | **していない**（内容とリスクの調査のみ） |
| B2②-b の実装・マージ・デプロイ | **していない**（実装コミットは元々0件であることを確認したのみ） |
| Concierge パラメータ対処の実行 | **していない** |
| `premium` / `video` / `tv`.dmm.co.jp へのアクセス | **していない** |
| af_id 990〜999 の人間向けCTAへの使用 | **していない** |
| R2 の先行実行 | **していない**（満了 8/13 00:31:05） |
| ゲート①の目標値の変更 | **していない**（30件のまま） |

---

> 本記録は実測値の転記と算術。取得できなかった項目（works 内訳の28日値・モバイルでの表示位置）は「取得不可」と明記した。
