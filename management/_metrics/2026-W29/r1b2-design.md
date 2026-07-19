# R1-b②: FANZA API保護（同時実行上限+バックオフ）+ pics.dmm circuit breaker 設計案

- 作成: CTO (Claude) 2026-07-19（裁定⑤=設計GO・**実装はCSOレビュー後**・本書はコード変更なし）
- 位置づけ: R1-b①(stale-serve・安定2週目)が**影響緩和**、本②は**原因抑制**（r1b1設計書§6の役割分担どおり）。変更範囲は R1-b①と同じく `src/lib/fanza/client.ts` 内で完結し、呼び出し側6系統は無変更

## 1. 守るべき事象（実績ベース）

| 事象 | 実績 | ②での対策 |
|---|---|---|
| DMMスロットル起因の全滅400 | 7/6-7/10 SEV-1（ISR再生成のたび汚染焼き込み） | A: 同時実行上限で誘発を抑制 + C: 障害中の無駄叩き抑止 |
| ローカル/単一IPからの連打で400 | week2候補抽出時に実測 | A（本番側の同型リスク） |
| pics.dmm HEAD無応答→probe 2000ms張り付き→CPU微増 | 7/16-17（現在は収束・実害なし） | B: circuit breaker（防御案③の編入） |

## 2. 設計A: FANZA API同時実行上限（セマフォ）

- `fetchItemListUpstream` への進入を**モジュールスコープのセマフォで上限N=4**に制限（超過分はFIFO待機）。クローラー波・デプロイ直後のISR MISS束で同一インスタンス内に発生する同時リクエスト束を平準化する
- **待機上限**: `QUEUE_WAIT_MAX_MS = 5_000`。超過時は待機を打ち切り `FanzaApiError(status=0, "concurrency queue timeout")` 扱い → **R1-b①のstale-serveへ自然に落ちる**（レンダリング遅延の無限伝播を防ぐ）
- 制約の明示: Vercelサーバレスは**インスタンスごと**にモジュールスコープが分かれるため、これはグローバル上限ではない。ただし実測上のバースト源は「1レンダリング/1インスタンス内の並列fetch束」（一覧+詳細2段+サイドバー等）であり、支配的ケースはインスタンス内キャップで抑えられる。グローバル協調（Upstash等）は**過剰装備として不採用**（新規外部依存の追加は障害面を増やす）
- 観測ログ: 待機発生時のみ `[fanza-limiter] waited_ms=X queue_len=Y` を console.info（定常時は無音）

## 3. 設計B: pics.dmm circuit breaker（7/17防御案③の編入）

- `probeImageUrls` にモジュールスコープの失敗カウンタを追加: **HEADタイムアウト/ネットワーク例外（droppedByHeadのうち非HTTP系）が連続 `CB_THRESHOLD = 10` 回**に達したら回路open
- **open中（`CB_COOLDOWN_MS = 60_000`）**: 手順③(HEAD検証)を**スキップ**し、①URL欠落除外+②プレースホルダパターン除外まで通過した items をそのまま返す = **表示側に倒すfail-open**（NOW PRINTING露出の可能性は60秒間のみ許容。全滅表示より軽微、かつ②のパターン除外は生きている）
- open→cooldown経過後は half-open（次の1バッチで通常probe実行・成功でclose/失敗で再open）
- ログ: open/close遷移時に `[fanza-filter] circuit=open|close consecutive_fails=N` を射出 → 定常監視の「took_ms=2000張り付き頻度」項目に遷移ログを併記
- **併record（裁定余地・防御案①）**: probeタイムアウト既定 2000→**1200ms**（実測P99数百ms・マージン十分）。1行変更のため本デプロイに同梱可能。CSOレビューで採否指定を求む

## 4. 設計C: 障害時バックオフ（無駄叩き抑止）

- **自動リトライは採用しない**。DMMスロットルの実観測は「400 BAD REQUEST」でありパラメータ不正の400と識別不能=リトライは追い打ちになる。失敗は即R1-b①のstale-serveへ
- 代わりに**API側circuit breaker**: `FanzaApiError`（status≥400）が**連続 `API_CB_THRESHOLD = 5` 回**で回路open → open中 `API_CB_COOLDOWN_MS = 30_000` は**upstreamを叩かず直接stale-serve経路へ**（stale不在なら即throw=現行挙動）
- 効果: 7/6型の全滅障害中、ISR再生成のたびにDMMへ400連打する挙動が「30秒に1回のhalf-open試行」まで減衰=スロットル解除を早める方向に働く。GUARDログは half-open 試行分のみに減るが**open遷移ログで障害検知は維持**（`VODNAVI_API_CIRCUIT_OPEN` タグ・level: high）
- `FanzaConfigError`（env未設定）はカウント対象外（設定事故を回路で隠蔽しない=R1-b①と同じ原則）

## 5. 監視・ガバナンス

- 新規ログタグ: `VODNAVI_API_CIRCUIT_OPEN`（high・API回路open）/ `[fanza-limiter]`（info・待機発生）/ `[fanza-filter] circuit=…`（info・pics回路遷移）。既存 GUARD/STALE_SERVED の発火条件・内容は**一切変更しない**
- 定常監視への追記: 「API_CIRCUIT_OPEN>0 = スロットル/障害進行中（stale提供の有無はSTALE_SERVEDで判読）」
- 定数はすべてファイル先頭に集約（N=4 / 5s / 10回 / 60s / 5回 / 30s / 1200ms）。チューニングはR1-b①のstale/GUARDログを観測材料に行う
- ロールバック: 全機構がclient.ts内で完結し、セマフォN=Infinity・両CB_THRESHOLD=Infinityで実質無効化できる（環境変数化はしない=設定面の複雑化回避）

## 6. デプロイ計画

- **1コミット・1デプロイ**（client.ts + 定数 + ログのみ。DDL不要・env不要）
- デプロイ前提: R1-a ignoreCommand稼働中のため**コードcommitとdocs commitを分離**（7/16積み替えインシデントの教訓）。push後は**デプロイレコード生成の目視確認必須**（7/18 webhook取りこぼし観測の教訓）
- デプロイ後監視(30分): 全ページ200 / GUARD・STALE誤発火0 / [fanza-limiter]待機が定常で無音 / [fanza-filter]のout件数がデプロイ前と同水準
- 検証手段: 障害の人工再現はしない（本番でDMMを叩き壊す検証は不可）。circuit遷移ロジックは単体テスト（カウンタ/クールダウンのモジュールを純関数に切り出しvitest）で担保

## 7. CSOレビュー依頼事項

1. 設計C「自動リトライなし・回路open 30秒」の採否（保守的すぎる場合はhalf-open間隔の短縮指定を）
2. 防御案①（probeタイムアウト1200ms）の同梱可否
3. 定数初期値（N=4 / CB閾値10・5 / クールダウン60s・30s）の承認 or 指定
4. 実装時期（来週前半で実装可能・A19/A20配信やweek3投入と独立）
