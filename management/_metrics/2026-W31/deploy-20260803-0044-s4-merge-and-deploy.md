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

## 4. 公開後チェック・デプロイ後検証

（本セクションはデプロイ完了後に追記する）
