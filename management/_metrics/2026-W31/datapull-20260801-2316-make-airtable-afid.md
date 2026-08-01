# Make.com シナリオ5615632 / Airtable posts の af_id 実態【CSO指示・閲覧のみ】

- 取得実施: **2026-08-01 23:02:38 〜 23:16:15 JST**(PowerShell 実測)
- 実施操作: **閲覧のみ**。Run once / 保存 / 有効・無効の切替 / モジュール編集は**一切行っていない**。シナリオは **DIAGRAM(読み取り専用)** と **実行ログ画面 `/logs/<runId>`** で参照し、**編集モード(Edit)には入っていない**
- 取得元: Make.com = Chrome連携 / Airtable = **Airtable MCP(読み取り専用)**
  - Airtable で MCP を用いた理由: CSO制約「誤操作リスクが高いため参照のみ」に対し、`list_tables_for_base` / `list_records_for_table` は**読み取り専用で編集操作が発生しない**。加えてフィールドIDと値を機械取得でき、af_id 混入判定を**フィルタ検索で全件網羅**確認できるため
- 判断・提案は書かない(事実の転記のみ)。Phase 1 で停止

---

## 0. 【要訂正】ログインアカウントの取り違え

同日 **23:02〜23:08 の初回確認は誤ったMakeアカウント**で実施していた。HUMAN による再ログイン後に正しいアカウントで再確認した。**初回の「シナリオ5615632は存在しない」という報告は撤回する。**

| | 誤(初回・23:02) | 正(再ログイン後・23:10〜) |
|---|---|---|
| 組織 | `My Organization`(id 7613354・Freeプラン) | (別アカウント) |
| チーム | `My Team`(id **2275606**) | id **1963533** |
| アカウント表示名 | モテリスト | — |
| シナリオ | **5030377「VODNaviお問い合わせフォーム」1本のみ**(CustomWebHook → sendAnEmail → Ignore) | **5615632「VODNAVI X Scheduler v1」** |

---

## 1. シナリオ 5615632 の構成

### 1-0. 基本情報

| 項目 | 値 |
|---|---|
| シナリオ名 | **VODNAVI X Scheduler v1** |
| ID | **5615632**(チーム 1963533) |
| 状態 | **Active(有効)** |
| 所有者 | **Hideki Tachikawa** |
| 作成 / 最終更新 | 2026/07/09 / 2026/07/11 |
| 累計実行 | 359 回 / 138.8 KB |
| 直近7日の消費 | 113 credits / 42 KB |
| トリガー | **Schedule** |

### 1-1. モジュール構成（DIAGRAM 実測）

1. **Airtable — Search Records**：ラベル「配信キュー取得（承認済のみ・1件）」
2. ルートフィルタ：**「1st / 承認済レコードあり」**
3. **HTTP (legacy) — Make an OAuth 2.0 request**（X への投稿）
4. ルートフィルタ：**「1st / 投稿成功(201のみ通過)」**
5. **Airtable — Update a Record** ×2（成功系／もう1本の分岐）
6. **続行（シナリオを全停止させない）**＝エラーハンドラ

### 1-2. Airtable からの取得条件（Module inspector 実測・原文転記）

| 項目 | 値 |
|---|---|
| Base | **`app0VKGU2B16qny6c`** |
| Table | **`tblZMqvjtJY8MfaWZ`**（= posts） |
| **Formula** | **`AND({ステータス}='承認済', {予約日時}<=NOW())`** |
| **Limit** | **`1`** |
| Sort | (Array) 1:(Collection) ※内訳は折りたたみのまま**未展開** |
| Use Column ID | false |
| Parameters | Empty |

### 1-3. X投稿モジュールの本文組み立てロジック（Module inspector 実測・原文転記）

| 項目 | 値 |
|---|---|
| **URL** | **`https://api.x.com/2/tweets`** |
| **Method** | **`post`** |
| **Request content** | **`{"text":"` `escapeJSON(` `1. 投稿文` `+` `newline` `+` `1. リンクURL` `)` `"}`** |
| Request compressed content | true |
| Query String | (Array) Empty |
| Headers | (Array) Empty |
| Timeout | (空) |
| Use Mutual TLS | false |
| Self-signed certificate | (空) |
| Evaluate all states as errors (except for 2xx and 3xx) | false |
| useNewZLibDeCompress | true |

→ **投稿本文 = モジュール1(Airtable)の `投稿文` ＋ 改行 ＋ `リンクURL` を `escapeJSON()` で包んだもの**。固定文字列の連結はこれ以外に存在しない

### 1-4. 投稿ウィンドウ（20:45–24:00 JST）の実装箇所

**実行履歴（HISTORY・直近24件の実測）**

| 日 | 初回 | 最終 | 間隔 | 回数 |
|---|---|---|---|---|
| 2026/07/31 | **20:45:06** | **23:45:12** | **15分** | 13回（20:45 / 21:00 / 21:15 / 21:30 / 21:45 / 22:00 / 22:15 / 22:30 / 22:45 / 23:00 / 23:15 / 23:30 / 23:45） |
| 2026/08/01 | **20:45:06** | 23:00:14（取得時点で進行中） | **15分** | 10回 |
| 2026/07/30 | — | 23:45:03（履歴末尾） | — | — |

- **20:45 開始・23:45 終了・15分刻み**で稼働しており、**20:45–24:00 JST の窓と整合**
- **ただし「20:45–24:00」を強制しているスケジュール設定そのもの（実装箇所）は未確認**。シナリオのスケジュール設定ダイアログは**開いていない**（編集UIに入らない制約のため）
- 実質のウィンドウ制御に寄与している確認済み要素は次の2点:
  1. Search Records の Formula `{予約日時}<=NOW()`
  2. Airtable `予約日時` の格納値が **21:00〜23:00 JST の範囲**に限られていること（§3）
- 1回の実行で処理するのは **Limit=1**。実際、投稿が発生した実行は operations=3、発生しなかった実行は operations=1

---

## 2. 生成される投稿URLの af_id【最優先】

### 2-1. 本文テンプレート内の直書き

- HTTP モジュールの Request content は **`投稿文` と `リンクURL` の2フィールド参照のみ**。**af_id を含む固定文字列は存在しない**
- Airtable `投稿文` フィールドを全35件フィルタ検索:
  - `af_id` を含むレコード = **0件**
  - `http` を含むレコード = **0件**
  - `al.dmm` を含むレコード = **0件**
  - `al.fanza` を含むレコード = **0件**
- → **本文テンプレート内の af_id 直書きは無い**

### 2-2. Airtable 側フィールド値の参照

- af_id は **Airtable `リンクURL`（url型・fldkk8CfCKXyqPNFO）の値**にのみ存在する

### 2-3. 006 以外（004・990系）の混入

全35レコードに対し `リンクURL` のフィルタ検索（`contains` = `moterist-00` OR `moterist-004` OR `moterist-99`）を実行:

| 判定 | 件数 |
|---|---|
| af_id を含むレコード | **9件** |
| うち **`af_id=moterist-006`** | **9件（100%）** |
| **`moterist-004`** | **0件** |
| **`moterist-99x`（990系）** | **0件** |

**af_id を含む9件の内訳（原文転記）**

| # | レコード名 | タイプ | リンク先ホスト | af_id |
|---|---|---|---|---|
| 1 | N5 T3 ブックスSALE再訴求 | T3セール | al.dmm.co.jp → book.dmm.co.jp/book/feature/supersale/ | **006** |
| 2 | N3 T6 TV入れ替わり制訴求 | T6TV | al.fanza.co.jp → premium.dmm.co.jp/ | **006** |
| 3 | A7改 巨乳CP最終夜 | T3セール | al.dmm.co.jp → video.dmm.co.jp/av/list/ | **006** |
| 4 | B11 T3 ブックスSUMMER SALE | T3セール | al.dmm.co.jp → book.dmm.co.jp/book/feature/supersale/ | **006** |
| 5 | B7 T3 週末×セール（A10編入） | T3セール | al.dmm.co.jp → video.dmm.co.jp/av/list/ | **006** |
| 6 | B3 T6 TV訴求別パターン（A6編入） | T6TV | al.fanza.co.jp → premium.dmm.co.jp/ | **006** |
| 7 | A16 T6 TV無料トライアル（A1流用） | T6TV | al.fanza.co.jp → premium.dmm.co.jp/ | **006** |
| 8 | A3 巨乳CPセール速報 | T3セール | al.dmm.co.jp → video.dmm.co.jp/av/list/ | **006** |
| 9 | A1 TV無料トライアル | T6TV | al.fanza.co.jp → premium.dmm.co.jp/ | **006** |

※規約第7条「申請していないサイトでのID利用禁止」に関わる項目として記録。**004・990系の混入は0件**

---

## 3. Airtable posts テーブル

### 3-1. スキーマ（base `app0VKGU2B16qny6c` / table `posts` = `tblZMqvjtJY8MfaWZ`・総35レコード）

| フィールド名 | 型 | フィールドID |
|---|---|---|
| Name（主キー） | singleLineText | fldSFgqqf40w8D2hQ |
| 投稿文 | multilineText | fldFMfnZXxnhSviDr |
| タイプ | singleSelect | fldWn1DLzKGacDC26 |
| ステータス | singleSelect | fldiGogHs9F7w5t2q |
| 画像 | multipleAttachments | fldS0ZPIPHSzR5y25 |
| リンクURL | url | fldkk8CfCKXyqPNFO |
| リンク種別 | singleSelect | fldohCPGnEjkTQRV6 |
| 予約日時 | dateTime | fldDrNzqVRb9LxxqD |
| ポストID | singleLineText | fldLdjZEjuCqGt0UH |
| エラー詳細 | multilineText | fldvwbyc1oosQ1k23 |
| 作成メモ | multilineText | fldne3ecIJaK6KRmA |

- **af_id 専用フィールドは存在しない**
- `タイプ` の値（6種）: **T1改 / T3セール / T6TV / TG / T5コンシェルジュ / リンクなし**
- `リンク種別` の値（3種）: **006直貼り / サイト / なし**
- `ステータス`: 投稿済 34件 / ストック 1件（Search Records が拾う `承認済` は取得時点で0件＝投稿後に `投稿済` へ更新される運用）

### 3-2. 種別ごとの集計（全35件）

| タイプ | 件数 | リンク先 | af_id |
|---|---|---|---|
| **T1改** | **9** | `app.vodnavi.jp/works/videoa/[content_id]` | **なし（自社URL）** |
| TG | 6 | `app.vodnavi.jp/articles/[slug]`（utm付き） | なし（自社URL） |
| T5コンシェルジュ | 2 | `app.vodnavi.jp/lp` | なし（自社URL） |
| **T3セール** | **5** | al.dmm.co.jp → book.dmm.co.jp / video.dmm.co.jp | **006** |
| **T6TV** | **4** | al.fanza.co.jp → premium.dmm.co.jp | **006** |
| リンクなし | 9 | — | — |
| 計 | **35** | | |

### 3-3. 直近レコードの af_id 一覧（予約日時 降順・上位15件／時刻は UTC→JST 換算併記）

| 予約日時(JST) | レコード名 | タイプ | リンク先 | af_id |
|---|---|---|---|---|
| 08/01 22:30 | TG-6 ガイド誘導 支払い手段 | TG | app.vodnavi.jp/articles/fanza-payment-methods | — |
| 08/01 21:00 | N5 T3 ブックスSALE再訴求 | T3セール | al.dmm.co.jp → book.dmm.co.jp | **006** |
| 07/31 22:30 | N4 小ネタ セール明け | リンクなし | — | — |
| 07/31 21:00 | N3 T6 TV入れ替わり制訴求 | T6TV | al.fanza.co.jp → premium.dmm.co.jp | **006** |
| 07/30 22:30 | A7改 巨乳CP最終夜 | T3セール | al.dmm.co.jp → video.dmm.co.jp/av/list | **006** |
| 07/29 22:30 | TG-5 ガイド誘導 解約の不安解消 | TG | app.vodnavi.jp/articles/fanza-kaiyaku | — |
| 07/29 21:00 | N1 T1改 乙アリスVR | **T1改** | **app.vodnavi.jp/works/videoa/savr01167** | — |
| 07/28 22:30 | A8 コンシェルジュ別切り口 | T5 | app.vodnavi.jp/lp | — |
| 07/28 21:00 | A5 豆知識 支払い | リンクなし | — | — |
| 07/26 22:30 | B10 小ネタ 今週の振り返り | リンクなし | — | — |
| 07/26 21:00 | B9 TG-4 ガイド誘導 登録前の全体像 | TG | app.vodnavi.jp/articles/fanza-first-guide | — |
| 07/25 22:30 | B11 T3 ブックスSUMMER SALE | T3セール | al.dmm.co.jp → book.dmm.co.jp | **006** |
| 07/25 21:00 | A9 豆知識 見放題の範囲 | リンクなし | — | — |
| 07/24 22:30 | B7 T3 週末×セール（A10編入） | T3セール | al.dmm.co.jp → video.dmm.co.jp/av/list | **006** |
| 07/24 21:00 | B6 T1改 博多彩葉 VR解禁 | **T1改** | **app.vodnavi.jp/works/videoa/sivr00503** | — |

- `予約日時` の格納は **UTC**。観測値(UTC) = 12:00 / 12:05 / 12:12 / 12:30 / 13:30 / 13:38 / 13:51 / 14:00 → **JST 21:00 / 21:05 / 21:12 / 21:30 / 22:30 / 22:38 / 22:51 / 23:00**
- **全35件が 20:45–24:00 JST の窓内**（最早 21:00・最遅 23:00）

---

## 4. 台帳ルールとの照合（事実の転記のみ）

### 4-1. リプライにアフィリエイトリンクが含まれていないか

- **判別不能**。posts テーブルに**リプライを識別するフィールドが存在しない**（`タイプ` の6値・`リンク種別` の3値のいずれにも reply 系の値なし）
- シナリオ側も `POST https://api.x.com/2/tweets` の単発投稿のみで、**リプライ（`reply.in_reply_to_tweet_id`）を組み立てるパラメータは Request content に存在しない**

### 4-2. 直接リンク投稿（T3・T6）の1日1件上限

| 日(JST) | 直接アフィリエイトリンク投稿 | 件数 |
|---|---|---|
| 07/11 | A1（T6TV・21:12） | 1 |
| 07/12 | A3（T3セール・21:05） | 1 |
| 07/17 | A16（T6TV・21:30） | 1 |
| 07/21 | B3（T6TV・21:00） | 1 |
| 07/24 | B7（T3セール・22:30） | 1 |
| 07/25 | B11（T3セール・22:30） | 1 |
| 07/30 | A7改（T3セール・22:30） | 1 |
| 07/31 | N3（T6TV・21:00） | 1 |
| 08/01 | N5（T3セール・21:00） | 1 |

- **9日すべて1日1件。上限超過は0日**

### 4-3. T1改 の遷移先

- **T1改 9件すべてが `https://app.vodnavi.jp/works/videoa/[content_id]`**（works 詳細ページ）
- content_id: `savr01167` / `sivr00503` / `mida00705` / `mird00284` / `mdvr00437` / `dass00985` / `snos00258` / `ipzz00893` / `ebwh00359`
- **直接アフィリエイトURL（al.dmm.co.jp / al.fanza.co.jp）を用いているレコードは T1改 に 0件**

---

## 5. 未取得・未展開の項目

| 項目 | 状態 | 理由 |
|---|---|---|
| シナリオのスケジュール設定（実装上の 20:45–24:00 の指定箇所） | **未確認** | スケジュール設定ダイアログは編集UI側のため、制約に従い開いていない |
| Search Records の `Sort` の内訳 | **未展開** | Module inspector で折りたたまれたまま（クリック追加を回避） |
| Airtable Update a Record ×2 の書込内容 | **未確認** | 同上（本タスクの取得項目外） |
| リプライ投稿の有無 | **判別不能** | posts テーブルに識別子が存在しない（§4-1） |

> 本記録は事実の転記のみ。判断・評価・提案は記載していない。
