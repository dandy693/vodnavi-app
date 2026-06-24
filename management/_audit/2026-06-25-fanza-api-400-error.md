---
audit_date: "2026-06-25"
target: "FANZA API Status 400 Total Vanish"
severity: "SEV-1（本番カタログ全滅・新規ページ全404・ホーム作品0件＝収益動線停止）"
status: "grounded"
method: "本番 curl 多面トライアンギュレーション（推測ゼロ）。DMMメッセージ本文のみ Vercel ログ要"
---
# FANZA API Status 400 エラー 物理構造特定レポート

## 0. 結論（実測）
**本番の全 FANZA `ItemList` 呼び出し（fresh fetch）が一律 400 で失敗している**。cid 単体取得・article=genre 一覧・プレーンなフロア一覧、いずれも種別を問わず 400。表示できているのは `revalidate=300` の **stale cache** に当たったページのみ。原因は**特定パラメータでも追加した20ジャンルIDでもなく、DMM API への全リクエストが拒否されている**こと。

## 1. 物理検知されたエラーの発生源
### 1-A. エラーURL/パラメータの実態
- **エンドポイント**: `https://api.dmm.com/affiliate/v3/ItemList`（`src/lib/fanza/client.ts:123` `fetchItemList`）。
- **throw 箇所**: `src/lib/fanza/client.ts:147-150`（HTTP `!res.ok` で `FanzaApiError(status=400)`）。
- **ホームの送信パラメータ実体**（`src/app/(site)/page.tsx:187` `ResultsSection`）: `site=FANZA, service=digital, floor=videoa, sort=date, hits=30, offset=1`（＋ api_id / affiliate_id は env）。
- **本番HTMLの物証**: ホームは `apiError` 分岐を描画 → `作品を取得できませんでした` ／ `FANZA API でエラーが発生しました (status: 400)`（EmptyState＋ErrorTelemetry kind=api）。`/works/` 商品カードリンク **0件**。

### 1-B. トライアンギュレーション実測（本番 curl, 2026-06-25）
| 対象 | 呼び出し種別 | 結果 |
|---|---|---|
| `/`（videoa/anime/amateur, sort=date/rank/review/price/-date, page=1/2, keyword） | プレーン floor 一覧 | **全て 400**（0作品） |
| `/genres/524`・`/genres/102`（sort=date/rank/review） | article=genre 一覧 | **404**（getGenrePage 失敗→notFound） |
| `/actresses/1006606`（sort=date/rank） | article=actress 一覧 | **404** |
| `/works/videoa/vrkm01868`・`jqre00028`・`umso00651`（**fresh** cid） | cid 単体取得 | **404**（getWork 失敗→notFound） |
| `/works/videoa/lulu00423`（**stale cache**） | cid 単体取得 | 200・¥500・関連12（※ FV監査時にキャッシュ済の残骸） |

→ **fresh fetch は全種別 400。表示成功は stale cache のみ**。当初「cid/articleは動く」に見えたのは、本セッションで先に読み込んだページのキャッシュ残骸だった。

### 1-C. データ正典（JSON）の健全性 — 仮説の反証
- 直近追加の20ジャンルID（1013, 4111, 4119, 5001 等）は**本件の原因ではない**。根拠: (1) `genres-editorial.json` は**フッター表示名専用でAPIクエリに一切渡らない**。(2) ジャンルと無関係な **cid 単体取得すら 400**。(3) 当該IDは本番 sitemap 由来の実在ID。
- 直近マージ（PR #55 計測 / #56・#57 UI）も**FANZA client・認証・取得パラメータを一切変更していない**。よって**コード起因ではなく、DMM API への到達/認証/許可レベルの問題**。

### 1-D. env 設定の状態
- `getCredentials()`（client.ts:103-115）は env **欠落時のみ** `FanzaConfigError`→ConfigErrorPanel を出す。本番は**その分岐ではなく 400 分岐**＝**env は存在するが DMM 側が値/アクセスを拒否**している（≠未設定）。

## 2. 次の一手（サージカルな修正方針）
### 2-A. 唯一の未確定点＝DMMのエラーメッセージ本文（要 Vercel ログ）
ページHTMLは秘匿のため `status: 400` のみ露出し、DMM の `result.message`/`errors[].message` は出さない（client.ts:88 `extractDmmErrorDetail` が **Vercel Function Logs にのみ**射出）。**根本原因の確定にはこのログ1行が必要**:
- Vercel → vodnavi-app → Logs（Functions/Runtime）で tag **`VODNAVI_SILENT_DEATH_GUARD`** / context `fetchItemList: HTTP エラー` を検索し、`message` を読む。
- そのメッセージで分岐:
  - `api_id`/`affiliate_id` 不正系（例: invalid api_id, authorization failed）→ **認証情報の失効/誤り**。DMM_API_ID / DMM_AFFILIATE_ID の値を DMM アフィリエイト管理画面の正規値（[[reference_dmm_affiliate_id_registry]]: API認証は 990 系が正規）と突合し Vercel env を再投入→redeploy。
  - アクセス拒否/IP 系 → **DMM が Vercel egress IP をブロック/スロットル**（[[reference_mixhost_ssh_classifier_block]] とは別件、[[project_actress_hub_pillar1]] のローカルIP 400 と同類の本番版の可能性）。DMM へ解除申請 or 取得経路見直し。
  - パラメータ系メッセージ → 当該パラメータを修正（ただし cid/article/plain 全滅のため可能性低）。

### 2-B. 暫定の被害局限（任意・別判断）
- 現状 stale cache 切れ後は新規ページが全 404 化し続ける。認証/IP 復旧が本筋。コード側の暫定策（キャッシュ延命・リトライ）は**根本原因確定前に入れると誤魔化しになる**ため、まず 2-A のログ確認を優先。

## 3. 確定事実と未確定の線引き（捏造回避）
- **確定**: 全 fresh `ItemList` が 400 / 表示は stale cache のみ / ジャンルID・直近PR は無関係 / env は存在し DMM が拒否。
- **未確定（要 Vercel ログ）**: 「認証失効」か「IPブロック」か「DMM側障害」か。本レポートはこれを**断定せず**、判別に必要な唯一の証跡（VODNAVI_SILENT_DEATH_GUARD の message）を指定するに留める。

---

## 4. 【UPDATE 2026-06-25】Vercel CLI ログ実測による確定
`vercel logs app.vodnavi.jp --json --query VODNAVI_SILENT_DEATH_GUARD`（auth: hdktchkw33-7057 / project prj_42GkXv2njAJTxYbmDoLdP8JoZbkx）で生ログを取得。

### 4-A. DMM の生エラーメッセージ（確定）
```
{"level":"high","tag":"VODNAVI_SILENT_DEATH_GUARD","context":"fetchItemList: HTTP エラー",
 "status":400,"message":"FANZA API request failed: 400 Bad Request — BAD REQUEST"}
```
- DMM の `result.message` は**汎用の "BAD REQUEST"**（`invalid api_id` 等の具体メッセージではない）。全 `ItemList` リクエストに対し一律。
- ログの request burst は `2026-06-24T16:42〜16:43Z`、`requestPath=/works/videoa/*` を高速連続（**クローラ/Googlebot**）、全て `responseStatusCode:404` `cache:MISS`。→ 障害は**遅くとも 2026-06-24 16:43Z には発生**、かつ**クローラに 404 を返し続け SEO/インデックスを能動的に毀損中**。

### 4-B. 認証情報の更新履歴（確定・秘密値非開示）
`vercel env ls production`：**`DMM_API_ID` / `DMM_AFFILIATE_ID` はともに 44日前作成、以降変更なし**。
→ **本件は当方の env 変更起因ではない**。44日間正常稼働した同一資格情報が、昨日以降 DMM 側で拒否され始めた。

### 4-C. 確定した原因の所在（DMM 側）
証拠（① 全種別 400 "BAD REQUEST" ② 資格情報 44日不変 ③ 当方コード/JSON 無関係）の合流点は **DMM 側の状態変化**。最有力は次のいずれか（断定せず、確認手順を付す）:
1. **DMM アフィリエイト・アカウント/API の停止・要再承認**（アダルト系は審査/凍結が起こりうる）。
2. **DMM API v3 側の仕様変更/障害**（必須パラメータ追加・エンドポイント変更等）。
3. **Vercel egress IP の DMM 側ブロック**。

### 4-D. 次の一手（人手・DMM 管理画面）
1. **affiliate.dmm.com にログイン → アカウント状態 / API 利用状況 / 通知（凍結・再承認要求）を確認**。これが 4-C の3択を一意に判別する。
2. api_id が管理画面で**有効か**を確認（無効なら再発行 → Vercel env 再投入 → redeploy）。
3. 上記で異常なしなら DMM サポートへ「v3 ItemList が全 api_id で 400 BAD REQUEST」を問い合わせ（IP/障害切り分け）。
- ※当方コード・JSON・直近PR は無関係のため、コード修正では復旧しない（暫定の stale-cache 延命やリトライは**根本原因を隠すだけ**で非推奨）。

## 5. 復旧執行と物理実測（2026-06-25・**部分復旧**）
- **執行**: 人手による Vercel env 更新（Step B: DMM_API_ID / DMM_AFFILIATE_ID）後、Claude Code が `vercel deploy --prod --force`（秘密値非関与）を執行。新 deploy `dpl_3og2H3vvh59keZRAFASco1YvXXD2` READY、`app.vodnavi.jp` へ alias 済。
- **✅ 復旧確認（catalog browse）**: ホーム `/` は `X-Vercel-Cache: MISS` / `Age: 0` の **fresh render で 200**、作品グリッド **22件**（`href="/works/..."`）を動的出力。プレーン `ItemList`（カタログ閲覧）は新資格情報で復旧し、「作品を取得できませんでした (status: 400)」は `/` から消失。
- **⚠️ 未復旧（deep pages）**: 作品詳細（cid）/ ジャンル（article=genre）/ 女優（article=actress）ページは **fresh render（`X-Vercel-Cache: MISS` / `Age: 0`）で依然 404**。ホームが現在出力している cid（例: jqre00028, bibivr00173）の詳細ページすら 404。**stale cache ではなく fresh 失敗**であることをキャッシュヘッダで確定。
- **未確定**: なぜ catalog browse は復旧し cid/article クエリは失敗するか。`vercel logs` 照会が `2026-06-24T17:16Z` で頭打ち（当日分が surface せず）のため、現時点の cid/article 失敗の DMM メッセージ（継続 400 か空応答か）は未取得。
- **真因の注記（断定回避）**: env 更新でホームが 400→200 に転じた事実は「旧資格情報が DMM に拒否されていた」ことと整合する。ただし **DMM 管理画面の確認結果（api_id 失効/アカウント状態）は本AIに共有されていない**ため、§5冒頭の「api_id失効・アカウント健全」は断定しない（要・人手の事実共有）。
- **SEV-1 ステータス**: **格下げ（catalog 復旧）だが未クローズ**。作品詳細/ジャンル/女優の SEO ページが 404 継続＝クローラへの 404 配信も継続。
- **次の一手**: (1) deep pages の **fresh ログ取得**（cid/article の現 DMM メッセージ確認、`vercel logs --since` 再試行）。(2) 依然 "BAD REQUEST" なら、新資格情報でも cid/article クエリのみ拒否される理由を DMM 管理画面/サポートで切り分け。(3) catalog だけ復旧した非対称の原因究明。
