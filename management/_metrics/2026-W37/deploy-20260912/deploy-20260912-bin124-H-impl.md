# 第124便 裁定5・H 実装便 — E19（ignoreCommand 明示化）+ E6①（上流失敗時 404→500）を同一 push・1 ビルドで適用（2026-09-12）

> **状態: 実装・デプロイ・本番検証 完了（09:41 JST）。** **E6①(c) の成功基準（次に自然発生するバーストで GUARD 行の served が 500）は未観測＝観測待ち（誘発しない）。**
> **裁定（CSO・第124便 裁定5）**: E19 採用（起案どおり）／E6① 案A 採用（500・小変更。案B/C/D は「旧案」として保持）／同梱 1 ビルド・ロールバック単位は全体（§4-3）／Lighthouse CLS 不要／FANZA 照会文面 承認（送信は HUMAN）／E6② は別起案（束4）。

## 1. 変更（commit 2 件・push 1 回）

| commit | 内容 | 差分 |
|---|---|---|
| `1aff344` | **E19** `scripts/vercel-ignore-build.sh`（新規・POSIX sh・61 行）／`vercel.json` の `ignoreCommand` → `sh scripts/vercel-ignore-build.sh`／`.gitattributes`（`*.sh text eol=lf`） | 実行文の変更なし |
| `e2f5b50` | **E6① 案A** `src/lib/fanza/upstream-failure.ts`（新規・`resolveAcrossFloors` / `classifyUpstreamError` / `logUpstreamServed`）＋ 単体テスト 16 件／`works/[floor]/[id]/page.tsx`（`getWork` の `catch { return null }` → served ログ + rethrow）／`actresses/[id]/page.tsx`・`genres/[id]/page.tsx`（フロア巡回を `resolveAcrossFloors` へ・page と `generateMetadata` の catch を廃止）／`error.tsx`（works 文言更新・actresses / genres に新設） | `actresses` +38/−38・`genres` +38/−38・`works` +13/−1・`error.tsx` +4/−3 |

**設計条件の実装対応（裁定5）**:

| 条件 | 実装 |
|---|---|
| (a) 404 は「API 正常応答・該当 item なし」のみ | works: `items` 空 → `null` → `notFound()`（従来どおり）。**throw されたものはすべてリクエスト失敗として rethrow**（種別で分岐しない）。actresses / genres: **全フロアが正常応答・該当なし** のときだけ `items: []` → `notFound()`。**1 フロアでも失敗し見つからなければ throw**（不在と断定しない） |
| (b) error.tsx 文言 | h1「一時的に作品情報を取得できません」／p「しばらくして再読み込みしてください。」（3 面共通）。時点注記なし。**noindex は Next が 5xx 応答に `<meta name="robots" content="noindex">` を自動付与**（ローカル実測） |
| (c) GUARD ログに served | `VODNAVI_SILENT_DEATH_GUARD` タグで `served: 500` / `upstream_kind` / `upstream_status` / `error_name` / `context`（例 `works/videoa/xxx`）を **本番のみ** 射出。upstream 側の GUARD 行（client.ts）は不変 |
| (d) stale-serve | `fetchItemList` 内で鮮度上限内キャッシュがあれば resolve するため **不変（200 ステイル）**。MISS 時のみ本改修が効く |

## 2. push 前検証（裁定5 指定の全項目）

| 項目 | 結果 |
|---|---|
| `npx tsc --noEmit` | exit 0 |
| `npx eslint`（変更 8 ファイル） | exit 0 |
| `npm run guard:affiliate` | 合格（href 直渡し 0 / af_id ハードコード 0） |
| `npm run build` | exit 0（警告 0） |
| **`npm test`** | **88 pass / 0 fail**（新規 16: FanzaApiError 400/500/503・FanzaConfigError・AbortError・TypeError・unknown → throw／全フロア該当なし → empty／失敗+該当なし → throw／失敗+後続で発見 → found／served=500 ログの本番限定） |
| **E19 スクリプトのローカル実行** | rc0（`PREV=HEAD` / `PREV=81747c8`＝docs 5 件後）→ `skip build` exit 0／rc1（`PREV=81747c8^`・globals.css 差分）→ `build` exit 1／**rc128（不在 SHA）→ `git diff failed (rc=128)` → `deepen=50/200/1000` → `fetch origin <PREV> --depth=1` → `diff impossible even after retry → build (fail-open)` exit 1**／unset → `build` exit 1。CR 混入 0 |
| **ローカル `next start`（DMM_API_ID 空＝設定事故経路・FANZA へリクエストしない）** | works / actresses / genres の 3 面とも **HTTP 500**・`Cache-Control: private, no-cache, no-store`・`Retry-After` なし。**headless Chromium で h1 / p / ボタン（もう一度試す / ホームへ戻る）の文言を確認**。サーバ log に `served:500` の GUARD 行 |
| ローカル `next start`（有効 env） | 既存 works / actresses / genres → 200。**不在 cid `zzzz99999notexist` / 不在 id `999999999` → 404 を維持** |

- **【厳守】FanzaApiError（400）の経路はローカルで意図的に起こしていない**（FANZA へ不正リクエストを投げない）。**「throw されたものはすべて rethrow」であることは単体テストで担保し、実経路は本番の自然発生バーストで観測する**。

## 3. デプロイ・本番検証

| 項目 | 実測 |
|---|---|
| push | **09:39:59〜09:40:02 JST**（`4755125`（docs）+ `1aff344` + `e2f5b50`・単一 push） |
| デプロイ | **`dpl_BjT4XYE4SVBFsb17tfRa22tqEmQ2`**・BUILDING 09:40:04 → **READY 09:41:15**・`lambdaRuntimeStats {"nodejs":5}` |
| **E19 の初回実行（ビルドログ原文）** | `Running "sh scripts/vercel-ignore-build.sh"` → **`[ignore-build] changes under /vercel/path0/app-concierge vs 81747c8feddfe4328b85077d85b5c5bbd86759fd -> build`** → `Running "vercel build"` |
| 本番 status（09:41:28〜37） | `/works/videoa/savr01180` **200** / `/works/videoa/zzzz99999notexist` **404** / `/actresses/1012507` **200** / `/actresses/999999999` **404** / `/genres/6925` **200** / `/genres/999999999` **404** / `/works/nikkatsu/5342gp14809`（9/9 の 404 事例・sitemap 収録）**200**。全件 `x-vercel-cache: MISS` |
| sitemap 再生成 | root `lastmod` **`2026-09-12T00:40:37.372Z`＝09:40:37 JST**（本日 8 回目）。`<loc>` 2,543 / works 1,200 / genres 200 / actresses 1,126 / articles 8＝全損なし |

**E19 初回実行から確定したこと**:

- **`VERCEL_GIT_PREVIOUS_SHA` の実値が初めて観測された＝`81747c8`（直前 READY）。** §22-8-1-1-b(3) で「導出であり実測ではない」としていた PREV は、公式定義どおりの値で実測に一致した。
- **cwd は `/vercel/path0/app-concierge`**（Root Directory＝`app-concierge/`・現行 `-- .` の前提と一致）。
- **距離 8（`81747c8..e2f5b50`）で `git diff` は計算できた**（rc=1・再試行経路に入らず）。**shallow か否かは失敗経路でしかログしないため本回は未観測。**

## 4. 未観測・観測待ち（誘発しない）

| # | 項目 | 観測方法 |
|---|---|---|
| 1 | **E6①(c) 成功基準**: 次に自然発生する上流 400 バーストで、GUARD 行の `served` が 500（404 でない） | Vercel Runtime Logs で `VODNAVI_SILENT_DEATH_GUARD` × `served` を読む。同リクエストの status 列も 500 |
| 2 | 本番 error.tsx の描画（実バースト時） | 同上のタイミングで目視（任意） |
| 3 | **E19 の skip 経路**（`no changes → skip build`・CANCELED）が Vercel 上で出ること | **次の docs コミットのビルドログ**（本記録の push で観測予定） |
| 4 | E19 の再試行経路（`git diff failed` → deepen）と shallow 有無 | 距離 ≥ 10 の docs コミットが自然に発生したとき（観測目的の push は禁止） |
| 5 | GSC「見つかりませんでした(404)」867 件の推移 | 週次記録。**§16-1 により「減った＝効果」とは書かない** |

## 5. 併記

- **§7 の GUARD 監視（行数ベース）**: 本改修により **500 で返した works / actresses / genres のリクエスト 1 件につき GUARD 行が 1 行増える**（`served` フィールド付き）。**行数の比較では `served` 有無で分けること。**
- **E6① は §24-12(B)① の「503 + Retry-After」ではなく 500**（裁定5: 5xx 全般で目的の大半を達成。案C は案A の実効を観測してから再検討）。
- **E6②（MISS 時の Supabase スナップショット）は別起案（束4）・未着手。**
- **FANZA サポート照会文面（起案 E6① §7）は承認済み。送信＝ひでき（HUMAN）。回答は要旨のみ台帳へ（§9）。**
- **ロールバック単位は全体（§4-3）**: 不成立時は `e2f5b50` → `1aff344` の順に `git revert`（本便は成立のため未実施）。
