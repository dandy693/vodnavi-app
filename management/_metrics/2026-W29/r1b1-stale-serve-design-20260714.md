# R1-b①: stale-serve フォールバック設計案（2026-07-14・実装はCSO承認後）

- 作成: CTO (Claude)。裁定③（2026-07-14）= R1-b優先順位①。目的: FANZA API 400/障害時に「作品0件・新規404」(7/6-7/10障害の主被害) をキャッシュ提供で吸収する
- **本書は設計のみ・コード変更なし**

## 1. 現行 fetch 層の実態

- 単一の入口 `src/lib/fanza/client.ts` `fetchItemList()`。Next fetch data cache `next.revalidate = options.revalidate ?? 300`
- 呼出系統（7呼出箇所・6系統）:
  | 系統 | 箇所 | エラー時の現行挙動 |
  |---|---|---|
  | sitemap | `app/sitemap.ts`（revalidate 3600） | catch → 当該フロアの走査打切り（収録欠落） |
  | ホーム一覧 | `(site)/page.tsx`（revalidate 300） | graceful-hide（作品0件表示） |
  | works詳細 | `(site)/works/[floor]/[id]/page.tsx` ×2段（revalidate 300） | フォールバック経路失敗 → notFound() = **404** |
  | genres | `(site)/genres/[id]/page.tsx` ×2段（revalidate 300） | 同上系 |
  | actresses | `(site)/actresses/[id]/page.tsx` ×2段（revalidate 300） | 同上系 |
  | concierge | `app/concierge/page.tsx`（cid逆引き）+ `lib/concierge/tools.ts` | 候補欠落（提案劣化） |
- エラー検知: `logFanzaSilentDeath()` = `VODNAVI_SILENT_DEATH_GUARD` タグで Vercel Logs へ構造化出力（throw は維持）
- 7/6-7/10 障害の実害: 全系統400 → ISR再生成のたびに「作品0件」「詳細404」が本番へ焼き込まれた（revalidate 300のため最短5分で健全キャッシュが汚染に置換）

## 2. 組込み方式（呼び手変更ゼロ・client.ts 内で完結）

`fetchItemList()` 本体を薄いラッパで包む（エクスポート名は不変・**6系統すべてが自動で恩恵を受ける**）:

1. **write-through（正常時）**: 応答を Supabase `fanza_response_cache` へ upsert
   - `cache_key` = 正規化パラメータの安定ハッシュ（api_id/affiliate_id は**キーにも値にも含めない**=秘密値非保存の現行方針を踏襲）
   - `payload` jsonb / `fetched_at` timestamptz
   - **fire-and-forget**（await しない・失敗無視）→ 主経路のレイテンシ増ゼロ・Supabase 障害が FANZA 経路へ波及しない
2. **stale-serve（エラー時）**: `FanzaApiError`/ネットワーク例外を catch →
   - `logFanzaSilentDeath()` は**現行どおり必ず発火**（検知の後退なし）
   - Supabase から `cache_key` 一致かつ鮮度上限内の行を取得
   - **あれば payload を返却** + 追加ログ `VODNAVI_STALE_SERVED`（context / cache_key / age_s / upstream_status）
   - **なければ現行どおり throw**（graceful-hide / notFound の既存挙動へ）

## 3. 鮮度上限（stale をどこまで許容するか）の推奨値

| 用途 | 推奨上限 | 根拠 |
|---|---|---|
| 一覧系（sort=date/rank 等・sitemap 含む） | **24時間**（`STALE_MAX_AGE_LIST_S = 86_400`） | ランキング/新着の1日分の鮮度劣化は「作品0件」より遥かに軽微。7/8型の短期障害を丸ごと吸収 |
| cid 単品（works 詳細の逆引き） | **7日**（`STALE_MAX_AGE_CID_S = 604_800`） | 作品メタは実質不変。障害中の詳細404化（SEO実害が最大の箇所）を最長1週間防護 |

- 7/6-7/10 実績は約4日 → 一覧24hでは後半戦は上限超過で現行挙動に戻る。**上限を48hへ広げるかは CSO 裁定余地**（判断材料: 「2日古い一覧」対「空の一覧」の比較では前者が優位、ただし料額・セール表記の陳腐化リスクを併記）

## 4. SILENT_DEATH_GUARD との関係整理

- **GUARD の発火条件・内容は一切変更しない**（検知は現行水準を維持）
- 変わるのは「発火後のユーザー影響」のみ: エラー表示/404 → stale 提供（stale が存在する場合に限る）
- stale 不在（初回アクセス・上限超過・Supabase不達）時は**完全に現行挙動** = fail-safe
- 挙動を変える範囲の特定: client.ts の throw 直前 2箇所（HTTP エラー / result.status>=400）のみ。`getCredentials()` の設定不備エラーは対象外（設定事故を stale で隠蔽しない）

## 5. 監視性の担保

- `VODNAVI_STALE_SERVED` 構造化ログ（level: warn 相当）で「stale 提供が起きている」ことを GUARD と独立に検知可能
- 運用: 定常監視（get_runtime_errors / get_runtime_logs）に「GUARD>0 かつ STALE_SERVED>0 = 障害中だがユーザー影響は緩和中」「GUARD>0 かつ STALE_SERVED=0 = 現行同様の実害進行中」の2状態判読を追記
- 週次で `fetched_at < now()-7d` の行を機会的削除（upsert 時に随伴 or Supabase cron）— テーブル肥大防止（一覧系キーは有限・cid系はロングテール数千行、無料枠500MBに対し十分小）

## 6. R1-b②（同時実行上限+バックオフ）との実装順序・同時実装可否

- 役割分担: ②=**原因抑制**（デプロイ/ISR再生成時の同時リクエスト束がDMMスロットルを誘発するのを防ぐ）、①=**影響緩和**（それでも起きた障害の被害を吸収）。相補関係で技術的には同居可（いずれも client.ts 内）
- **推奨: ①先行 → 効果観察 → ②**。理由: (a) ユーザー可視の被害（0件表示・404）を先に断つのが実害最小化として優先度高 (b) R1-a 検証後の初コード変更は変更点を単一化し、障害時の切り分けを可能にしておくべき (c) ②はバックオフ定数の調整余地が大きく、①の stale ログが②のチューニング観測にも使える
- 同時実装は可能（合計1デプロイに圧縮できる）が上記 (b) の理由で非推奨

## 7. デプロイ回数見積

| 項目 | デプロイ | 前提作業 |
|---|---|---|
| R1-b①（本設計） | **1回**（client.ts ラッパ + 定数 + ログ、単一コミット） | Supabase DDL 1本（`fanza_response_cache`・service-role のみ・anon 権限なし） |
| R1-b②（参考） | 1回 | なし |
