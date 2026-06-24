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
