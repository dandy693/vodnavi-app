# S4 デプロイ記録（PR #65 マージ → 本番反映 → 検証）

- 実施: **2026-08-03 00:44 〜 JST**（PowerShell 実測）
- Phase 1 で停止

---

## 1. マージ

| 項目 | 値 |
|---|---|
| PR | **#65**（`s4-afid-990-to-004` → `main`） |
| 含まれるコミット | `4949114`（§6事前登録）/ `29d5d69`（S4本体＋回帰ブロック）/ `2e531b0`（resolveAffiliateId 修正） |
| マージ方式 | `gh pr merge 65 --merge`（**classifier 遮断なし・exit 0**） |
| **マージ完了時刻** | **2026-08-03 00:44:55 JST**（GitHub `mergedAt` = `2026-08-02T15:44:55Z` を JST 変換） |
| マージコミット | **`7a3c416`** |

### CI（新規追加した af_id ガード）の結果 — マージコミット `7a3c416`

| ジョブ | 結果 |
|---|---|
| `static` | **success** |
| `live` | **skipped**（設計どおり。live は schedule / workflow_dispatch のみ実行） |

---

## 2. 【事実】マージ後、Git 連携による自動デプロイが発火しなかった

| 時刻(JST) | 観測 |
|---|---|
| 00:44:55 | マージ完了 |
| 00:46 〜 00:53 | `vercel ls` を12回ポーリング。**新規デプロイの行が出現せず**（最新の Production は 31m→37m と加齢するのみ） |
| 00:53:12 | 最新 Production = `vodnavi-mghz7sj60…`／`vercel inspect` で **created = 2026-08-03 00:15:06 JST**＝**マージ前**。alias に `https://app.vodnavi.jp` |
| 00:57:55 | 同上（43m 経過）。**マージから13分、7a3c416 のデプロイは存在しない** |

### 誤読を訂正して除外した観測

GitHub の commit status API は `7a3c416` に対し `state: pending / statuses: []` を返したが、
`app-concierge/vercel.json` に **`"github": { "silent": true }`** が設定されており、
**Vercel は GitHub へ commit status を送らない設定**である。したがって
**「statuses が空である」ことはデプロイ欠落の証拠にならない**（この点は当初の推測を撤回する）。
デプロイ欠落の根拠は上表の `vercel ls` / `vercel inspect` の実測のみ。

### `ignoreCommand` の挙動（`app-concierge/vercel.json`）

```
if git diff --quiet ${VERCEL_GIT_PREVIOUS_SHA:-HEAD^} HEAD -- . 2>/dev/null; then exit 0; else exit 1; fi
```

- 「**前回デプロイ SHA と HEAD の差分が、プロジェクトルート（`app-concierge`）配下に無ければビルドを飛ばす**」という定義
- 直近の Production デプロイは **`802f5b2`（ドキュメントのみ）** 由来で 00:15:06 に成功している
- したがって次に main へ push が起きた時点の比較は **`802f5b2` → 新 HEAD** となり、その差分には **S4 のコード変更が含まれる**＝ビルドは実行される

## 3. 実施した対応（同一機構での再発火）

デプロイ手段を変更せず（`vercel --prod` 等の手動デプロイは**使用しない**）、
**main への次の push で Git 連携を再発火させる**方針を採った。本記録ファイルのコミットがその push にあたる。

※ `vercel --prod` を使わなかった理由（事実）: 作業ツリーに `.vercel/project.json` が存在せず、
非対話の手動デプロイは**新規プロジェクトを作成してしまう恐れ**があるため。既存の
`vodnavi-app` プロジェクト（alias `app.vodnavi.jp`）を壊さない選択をした。

---

## 4. デプロイ完了

| 項目 | 値 |
|---|---|
| デプロイ ID | **`dpl_DYN76kM5PuTQsoBijfhSC8ZWxfpV`**（`vodnavi-5as3t8s63…`） |
| target / status | **production / ● Ready** |
| **created（デプロイ開始）** | **2026-08-03 00:59:17 JST** |
| Duration | **1m**（`vercel ls`） |
| **sitemap 生成時刻（＝ビルド時刻の実測）** | **2026-08-03 00:59:37 JST** |
| alias | **`https://app.vodnavi.jp`** ほか（`vercel inspect https://app.vodnavi.jp` の id が上記と一致） |
| トリガ | main への push（`27f352e`・00:59:16 JST）。この HEAD にはマージ済みの S4 コードが含まれる |

→ **本番反映の完了時刻は 2026-08-03 00:59:37 JST**（sitemap の build-time lastmod で確定）。
検証は **01:08:40 JST** に実施。

### 公開後チェック 第4項（Canceled 確認）

| デプロイ | Status | 判定 |
|---|---|---|
| `vodnavi-5as3t8s63…`（本デプロイ・00:59:17） | **● Ready** | **期待どおり**。コード変更を含むため `ignoreCommand` は exit 1 を返しビルドが実行された |
| `vodnavi-mghz7sj60…`（00:15:06・ドキュメントのみ） | ● Ready | — |
| `vodnavi-7kmx5rxeh…` / `vodnavi-q7qcvf0ms…` | **Canceled**（2s） | ドキュメントのみの push で `ignoreCommand` がビルドを飛ばした結果＝**正常** |

### 公開後チェック 第5項（sitemap 生成時刻）

- `sitemap.xml` **HTTP 200** / `<loc>` **3,012 件** / `/articles/` は **7 件**（B2① の対象7記事がすべて収録）
- 静的面の `lastmod` = **`2026-08-02T15:59:37.006Z` = JST 2026-08-03 00:59:37**＝**デプロイ時刻に更新済み**
  （`sitemap-builder.ts` L188 が `now`＝ビルド時刻を代入する実装どおり）

---

## 5. デプロイ後の検証（指示の5項目）— **全項目合格**

実施 **2026-08-03 01:08:40 JST**（面別計測）/ **01:09:00 JST**（live ガード）

### 5-1. 4面すべてで href 内 990 が 0 件 → **合格**

`<script>` を除去した素の HTML の `href` 属性のみを計数。

| 面 | HTTP | **href 内 99x** | href 内 004 | 置換前の 990 本数 |
|---|---|---|---|---|
| トップ | **200** | **0** | 46 | 23 |
| genres | **200** | **0** | 42 | 21 |
| actresses | **200** | **0** | 56 | 28 |
| concierge（cids 3件） | **200** | **0** | 7 | 3 |
| **合計** | | **0** | **151** | 75 |

### 5-2. 004 リンクの lurl が置換前と一致 → **合格（75/75）**

各カードの詳細リンク `/works/{floor}/{cid}` から floor を取り、フロア別マップで生成される
lurl と、実際に描画されている 004 リンクの lurl を1枚ずつ突合。

| 面 | カード枚数 | **lurl 一致** | 不一致 |
|---|---|---|---|
| トップ | 23 | **23** | **0** |
| genres | 21 | **21** | **0** |
| actresses | 28 | **28** | **0** |
| concierge | 3 | **3** | **0** |
| **合計** | **75** | **75** | **0** |

実測サンプル（原文）:

```
https://al.dmm.co.jp/?lurl=https%3A%2F%2Fvideo.dmm.co.jp%2Fav%2Fcontent%2F%3Fid%3Dsavr01132&af_id=moterist-004&ch=link_tool&ch_id=link
https://al.dmm.co.jp/?lurl=https%3A%2F%2Fvideo.dmm.co.jp%2Fav%2Fcontent%2F%3Fid%3Dsavr01132&af_id=moterist-004&ch=link_tool&ch_id=link&utm_source=shared   ← concierge（utm 保持）
```

置換前（2026-08-02 23:47:30 実測）は `https://al.fanza.co.jp/?lurl=…&af_id=moterist-990&ch=api` であり、
**lurl 部分は完全に同一**。変わったのは host / af_id / ch の 3 点のみ。

### 5-3. API 経由の商品取得が正常（4面で作品カードが正しく描画）→ **合格**

| 面 | 作品カード枚数 | 置換前 |
|---|---|---|
| トップ | **23** | 23 |
| genres | **21** | 21 |
| actresses | **28** | 28 |
| concierge（cids 3件） | **3** | 3 |

→ **枚数は置換前と完全一致**。FANZA API 経由の商品取得・描画に異常なし
（＝`DMM_AFFILIATE_ID` による API 認証は非接触という設計どおり）。
※ RSC payload 上の 990 の有無は**裁定済みのため問わない**。

### 5-4. 各面 HTTP 200 → **合格**（4面すべて 200。works 詳細も 200）

### 5-5. live ガードが 990 を 0 件として通過 → **合格（exit 0）**

```
  · live 検査対象ベース: https://app.vodnavi.jp
  · top: アフィリエイト href 46 本 / 99x 0 件 / JSON-LD 1 ブロック(af_id 0)
  · genres: アフィリエイト href 42 本 / 99x 0 件 / JSON-LD 1 ブロック(af_id 0)
  · actresses: アフィリエイト href 56 本 / 99x 0 件 / JSON-LD 1 ブロック(af_id 0)
  · works(detail): アフィリエイト href 17 本 / 99x 0 件 / JSON-LD 1 ブロック(af_id 0)
  · concierge: アフィリエイト href 7 本 / 99x 0 件 / JSON-LD 0 ブロック(af_id 0)

✓ af_id ガード合格（live）
```

- **置換前（2026-08-03 00:0x JST）は同じスクリプトが exit 1 で 4面75件の 990 を検出していた**。同一スクリプトが置換後は exit 0 になった＝検査が機能した上での合格
- **JSON-LD の af_id は全面 0**（c237e51 の禁則も維持）

---

## 6. §6 事前登録との対応（`prereg-20260802-2348-s4-afid-990to004.md`）

| 登録内容 | 現時点の扱い |
|---|---|
| 1. 004 のクリック増は**計測範囲の拡大**であり施策効果ではない | 登録どおり。以後の 004 数値はこの前提で読む |
| 2. 一覧系の DMM クリックは 7/25 以降ゼロ。**増加しない可能性が高く、増えなくても S4 の失敗ではない**（規約適合が目的） | 登録どおり |
| 3. 004 の EPC 変動は**ブレンド効果の可能性**。B2① の効果と混同しない | 登録どおり |
| 4. **デプロイ時刻を JST 秒単位で記録し前後を分離して集計** | **2026-08-03 00:59:37 JST**（本節 §4）を境界として集計する |

> 本記録は事実の転記のみ。判断・評価・提案は含まない。
