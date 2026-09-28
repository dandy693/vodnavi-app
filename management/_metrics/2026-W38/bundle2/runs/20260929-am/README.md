# 束2 段階② 朝の抽出（2026-09-29）

**5軸**: ①X リスト `vodnavi-targets` ②窓＝**2026-09-28 21:26 JST（夜の抽出）以降** ③X 読み取り（Chrome）＋ Airtable MCP ④自アカウント実測 ⑤窓内の非リポスト 12 件。

## 0. 接続・事前確認

- **Supabase MCP はセッション起動時に接続失敗（`CONNECT_TIMEOUT`）**＝作品知識なし（A/C のみ・B なし・Q は提示不能）。9/28 夜に続き 2 回連続。
- **配信前再検査（§13-5-2）**: 当日予約 1 件（`W12-04 T1改 九野ひなの MIDV-855`・21:00 JST・承認済）→ **PASS**（検査不能 g9 のみ）。`preflight.json`。
- `targets.json` / `replies.json` を MCP で読み戻し（x_targets 42・稼働 34／x_replies 58）。
- 走査 **05:32〜05:4x JST**（Chrome の時刻実測 05:32:45 開始）。非表示タブで JS・`computer scroll` のタイムアウトが断続（45 秒 × 数回）。窓の下端（9/28 12:26Z）を越える 09:12Z まで到達を確認。

## 1. 窓内の処理

| 区分 | 件数 | 内訳 |
|---|---|---|
| 入力 | 8 | FANZAdougaX（MOODYZ 30%OFF キャンペーン・水卜さくら BEST）／MOODYZ（VR 予約開始・mdvr00444・美園和花）／attackers 2（桜みお same00251／こだわりのフェラ 第5弾 9/30 9:59 まで）／Aizawa_miyu03（本中 大共演 VR）／shirot（Emika 恋におちる瞬間・白上咲花）／IDEAPOCKETTER（花咲澪）／S1（希望みう デビューイベント終了） |
| 除外（件数のみ） | 2 | shinnakanodream（社内の雑談＝作品に触れない）／shirot の同一スレッド 1（入力行に統合） |
| FANZAdougaX の同一スレッド | 1 | 入力行に統合 |

- content_id は投稿本文に表示された遷移先 URL の文字列から読んだもの（mdvr00444・same00251）。**al.fanza 以降へはアクセスしていない。**

## 2. 生成

- 8 行・生成 6 行（attackers の 2 行目は別実行 `drafts2.*`）。**ガード不通過 2**: attackers 桜みお（本文に具体なし・R14）／IDEAPOCKETTER（同）。
- priority 3（S1）は今週（9/28〜）1/2 → 提示すれば 2/2。
- **Aizawa の C 案（配信開始はいつ頃）は、同じ投稿の返信欄で本人のサブ垢が「10/26 0:00〜配信開始」と既に答えている**＝C は不向き。
- attackers こだわりのフェラ 第5弾は 9/28 夜の kawaii_pr（同企画）に続く 2 日目（3 日連続ルール内）。

## 3. フォロー候補（取得元 (a)・Aizawa_miyu03 9/28 23:01 の返信欄）

- 提示 6: 前回送り 4（@HoHzs／@sakuli131／@roku_ni_san／@mgt_xknkmtc）＋新規 2（@kamipGentle／@syucreate）。
- 除外（件数のみ）: 本人のサブ垢 1／海外・定型文 1／自己紹介に判断材料が乏しい 1。
- 9/28 夜に提示した @hiyokoyahiyo のフォロー報告は未着（follows.json 累計 18 のまま）。

## 4. 投稿と記録（HUMAN 投稿 2026-09-29 06:08〜06:09 JST）

| # | 対象 | 案 | 投稿 | 配信（snowflake） |
|---|---|---|---|---|
| 1 | https://x.com/FANZAdougaX/status/2104662456249545042 | A（手直しなし） | 2104679692313956621 | 21:08:36.362Z |
| 2 | https://x.com/MOODYZ_official/status/2104600780779262265 | A（手直しなし） | 2104679819028070543 | 21:09:06.573Z |
| 4 | https://x.com/Aizawa_miyu03/status/2104572240004292739 | A（手直しなし） | 2104679962234200338 | 21:09:40.716Z |

- 見送り（HUMAN）: attackers（第5弾は kawaii に集約）・shirot・S1（priority 3 の枠温存＝今週 1/2 のまま）。
- X 実在: 3 件とも HTTP 200（Twitterbot の `<title>` で宛先一致）・無効 ID 対照 404。
- 記録: `record.mjs --create --texts` → MCP create（createdTime 06:16:26 JST・`rec92P5FDmvylHkje` / `reczBfDi4dgZKyU41` / `recj6SyFo9L0pKfCw`・reply_post_id / posted_at 同梱）→ x_targets `last_reply_at` 3 件 → **読み戻し 3＋3 件とも全項目一致**。**x_replies 累計 61 件。**

## 5. フォロー（HUMAN・2026-09-29 朝）

- 実施 7 件（提示 6＋昨夜提示の @hiyokoyahiyo）→ `follows.json` 追記・読み戻し一致（累計 25・推定フォロー中 181・停止閾値 300 まで 119）。

## 6. E28-3 適用（CSO裁定 2026-09-28 夜 ⑤・06:30 以降・朝の抽出と記録の後）

- 事前（06:1x）: active **version 6**・ルール 2（E28-1 / E28-2）。**MCP `get_firewall_config` は 404 `Seawall Config not found`（9/22 と同じ）→ Vercel CLI 54.0.0 `vercel api` で実施。**
- **06:30:17 JST** `PATCH /v1/security/firewall/config`（`rules.insert`）→ 応答本文は `{}`（成否を示さない）→ **読み戻しで確認**: **version 7**（updatedAt 21:30:21Z）・ルール 3・**`rule_e28_3_as_45102_challenge_1qqJ3T`**＝active・`geo_as_number eq 45102` → `challenge`・`valid: true`。E28-1 / E28-2 は不変。全文 → `management/_metrics/2026-W39/cn-works-20260928/e28-3-firewall-active-readback-20260929.json`。
- **healthcheck 1 回（06:31:20〜29 JST）＝ALL PASS**（sitemap works 1200 / home grid / llm.concierge）。プローブ: Chrome UA で `/`・`/works/videoa/miab00677` とも 200（国内 IP・AS 45102 外）。
- 効果測定: 前窓＝9/22〜9/28（FACT §29-5）・後窓＝9/29〜10/5（`/works/` の SG リクエスト数と `served:500`）。

## 7. Supabase MCP の起動時接続失敗（2 朝連続）の切り分け（06:3x JST・読み取りのみ・値は表示していない）

| 切り分け | 実測 | 判定 |
|---|---|---|
| **PAT** | User / Process とも `SUPABASE_ACCESS_TOKEN` あり（長さ 44）。Management API `GET /v1/projects` を PAT 付きで **200**（無認証は 401） | **失効ではない** |
| **ネットワーク** | `api.supabase.com` 応答 0.3〜0.6 秒 | **問題なし** |
| **サーバ本体** | `.mcp.json` と同じ起動コマンド（`cmd /c npx -y @supabase/mcp-server-supabase@latest …`）を単独で起動 → initialize 応答まで **11.0 秒**（v0.13.0）→ `list_tables` で **7 表**（fanza_response_cache ほか）を返した | **単独なら動く** |
| **プロセス起動** | 起動時のエラーは `CONNECT_TIMEOUT: Request timed out`。`npx -y …@latest` は起動のたびにレジストリで最新版を解決する（今回の単独起動で 11 秒） | **これが該当（推定）** |

- **分類＝プロセス起動（起動時間が接続待ちの上限を超えた）。PAT・ネットワークではない。** Claude Code の起動時は他の MCP サーバと同時に立ち上がるため、単独時の 11 秒より長くなりうる。**起動時の所要時間そのものは測れていない**（推定と明記）。
- **是正の候補（設定変更＝CSO 承認後・未実施）**: ①`.mcp.json` の `@latest` を `@0.13.0` に固定（毎回のレジストリ解決をなくす）②接続待ちの上限（環境変数 `MCP_TIMEOUT`）を延ばす ③両方。
- **当面の回避（HUMAN）**: Claude Code で `/mcp` を開き supabase を再接続すれば、今夜の抽出で B 案と引用が出せる見込み。
