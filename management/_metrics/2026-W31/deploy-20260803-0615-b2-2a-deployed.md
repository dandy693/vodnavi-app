# B2②-a デプロイ + ゲート指標①の分子定義 明確化 — **完了・検証7項目すべて合格**

- 実施: **2026-08-03 06:14 〜 06:22 JST**（PowerShell / Vercel API 実測）
- Phase 1 で停止

---

## 1. ゲート補足（分子定義の明確化）

**指標そのものの変更ではない**（CSO 承認 2026-08-03）。`management/_metrics/GATE_20260930.md` に追記。

### 分子に含む（articles 面での「アフィリエイトクリック」）

`guide_tv_signup_cta` / `article_product_cta` / **今後 articles 面に追加されるアフィリエイト CTA**

### 分子に含まない（「送客」の計装）

`works_to_articles_cta`（placement）/ `actresses_to_articles_cta`（placement）/ **`article_guide_click`（イベント名）**

### 別枠指標「送客量」

- 定義: works / actresses → articles への遷移数（`article_guide_click` の発火数）
- **指標①との比**で、送客が成約に結びついているかを評価する
- **判定には使用しない**（判定は指標①〜③のみ）

### 【併記・未確定事項】

articles 面のアフィリエイト placement はコード実装上 **4種**（`guide_tv_signup_cta` / `guide_tvplus_add_cta` / `article_sale_cta` / `article_product_cta`）ある。
CSO 指示で分子として明示されたのは **2種**であり、**`guide_tvplus_add_cta` / `article_sale_cta` の扱いは未確定**。
現時点で両者の発火は確認されていないため実害はないが、**発火実績が生じた時点で CSO 裁定を仰ぐ**。

---

## 2. マージ・デプロイ

| 項目 | 値 |
|---|---|
| PR | **#66**（`b2-2a-works-actresses-to-articles` → `main`） |
| マージ | `gh pr merge 66 --merge` — **classifier 遮断なし・exit 0** |
| **マージ完了時刻** | **2026-08-03 06:14:58 JST**（`2026-08-02T21:14:58Z`） |
| マージコミット | **`6e07942`** |
| デプロイ ID | **`dpl_E8c4HnwuhiXsu7S8AotcovURHh2P`**（`vodnavi-grktb4lki…`） |
| status / target | **● Ready / production** |
| **デプロイ開始** | **2026-08-03 06:15:01 JST**（Duration 1m） |
| **本番反映の完了時刻** | **2026-08-03 06:15:20 JST**（sitemap の build-time lastmod で確定） |
| alias | `https://app.vodnavi.jp`（`vercel inspect` の id が一致） |

> **今回はマージ直後（3秒後）に Git 連携が自動発火した。** 前回（PR #65）は13分待っても発火せず main への追加 push で再発火させたが、**今回は再発火操作を要していない**。前回の不発火は恒常的な障害ではなかったと考えられる（原因は未特定）。

### 公開後チェック 第4項（Canceled 確認）

| デプロイ | Status | 判定 |
|---|---|---|
| `vodnavi-grktb4lki…`（Production・06:15:01） | **● Ready** | **期待どおり**。コード変更を含むため `ignoreCommand` は exit 1 を返しビルドが実行された |
| `vodnavi-9tl6yv0qc…`（**Preview**・06:14:4x） | **Canceled**（2s） | ブランチ push 由来の Preview。`ignoreCommand` による正常なスキップ |

### 公開後チェック 第5項（sitemap 生成時刻）

- `sitemap.xml` **HTTP 200** / `<loc>` **3,012 件**
- 静的面の `lastmod` = `2026-08-02T21:15:20.872Z` = **JST 2026-08-03 06:15:20**＝**デプロイ時刻に更新済み**

---

## 3. デプロイ後の検証（登録済み期待値との照合）— **7項目すべて合格**

検証時刻 **06:21:03**（1〜4・6）/ **06:21:23**（5）/ **06:22:15**（7）JST

| # | 項目 | 期待値 | 実測 | 判定 |
|---|---|---|---|---|
| 1 | works 詳細の `/articles/` リンク | 2本 → **3本** | **3本**（`fanza-first-guide` ×3） | **合格** |
| 2 | actresses の `/articles/` リンク | 0本 → **1本** | **1本**（`fanza-tv-free-trial` ×1） | **合格** |
| 3 | genres・トップ | **0本のまま** | genres **0本** / トップ **0本** | **合格** |
| 4 | 各面 HTTP | **200** | works / actresses / genres / トップ すべて **200** | **合格** |
| 5 | live ガード | **exit 0** | **exit 0**（5面すべて 99x 0件・JSON-LD の af_id 0） | **合格** |
| 6 | 常時可視（`<details>` 内でない） | 新規リンクが `<details>` 外 | 下表のとおり | **合格** |
| 7 | `article_guide_click` の placement が面別に分岐 | 2値が配信 JS に存在 | 下表のとおり | **合格** |

### 第6項の詳細（`<details>` のネスト判定）

各 `/articles/` アンカーについて、直前までの `<details>` 開閉数を数えて内側かを機械判定した。

| 面 | slug | `<details>` 内 | 素性 |
|---|---|---|---|
| works 詳細 | `fanza-first-guide` | **True** | 既存 U1（mobile FV 側・折りたたみ内） |
| works 詳細 | `fanza-first-guide` | **False** | **本件で追加した「はじめての方へ」ブロック＝常時可視** |
| works 詳細 | `fanza-first-guide` | **True** | 既存 U1（lg 右カラム側・折りたたみ内） |
| actresses | `fanza-tv-free-trial` | **False** | **本件で追加＝常時可視** |

→ **追加した導線はいずれも `<details>` の外**。既存 U1 の2本が `<details>` 内のままなのは「U1 は現状維持」という裁定どおり。

### 第7項の詳細（配信 JS の実測）

各ページの `/_next/static/**.js` を**全14本取得して走査**:

| 面 | `works_to_articles_cta` | `actresses_to_articles_cta` | `article_guide_click` | 該当 chunk |
|---|---|---|---|---|
| works 詳細 | **存在** | **存在** | **存在** | `/_next/static/chunks/0r148tb6nw6k9.js` |
| actresses | **存在** | **存在** | **存在** | `/_next/static/chunks/06_c0phvbylor.js` |

→ 2値の placement とイベント名が**実際に配信されている**。面別の出し分けは `SURFACE_PLACEMENT` の写像で行われ、`surface` prop（works / actresses）で決まる。
※ **GA4 での受信確認は翌日以降**（検証用 Chrome は `/g/collect` を送信しないため、実クリックでの計上確認はこの環境では不可）。

---

## 4. §6 事前登録の再掲（判定時に参照）

1. 投入時刻 **2026-08-03 06:15:20 JST** を境界として前後を分離集計する。S4（00:59:37）・B2①（2026-08-02 23:19:32）の効果と混同しない
2. GSC インデックスレポートが 2026-07-24 で凍結中のため **SEO 効果の測定は不能**（8/8 再判定）
3. **内部リンクは権威の再配分であり新規獲得ではない**
4. 外部被リンクは `japanero.jp` 1本のみ。**移転量は小さい**
5. 効果が出なくても **「期間内に効果が確認できなかった」と記録する**
6. **actresses 面は現状クリック0件**。指標①への寄与は期待しない
7. 新 placement 2種と `article_guide_click` は **指標①の分子に含めない**

---

## 5. 実施していないこと

- U1（`NewUserFvModule`）の撤収・変更
- genres / トップへの導線追加
- 既存 CTA の削除・移動・文言変更
- `internal_links` の DDL 適用（**HUMAN 枠**。B2②-b の前提であり B2②-a は非依存）

> 本記録は事実の転記のみ。判断・評価・提案は書いていない（§1 の「未確定事項」は CSO 裁定を要する事実の併記）。
