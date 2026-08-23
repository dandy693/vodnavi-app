# 第101便 補遺 — push / デプロイ / PAT 反映の読み戻し

**実施日時**: 2026-08-24 06:20〜06:35 JST
**push**: `299d49e` → **`57b0d31`**（`79e7c93` を含む2コミット）
**デプロイ**: **`dpl_6hA4WSG7ivDLczcGEVkz31S8i9rP` / state `READY` / target `production` / commit `57b0d31`**

---

## タスクA — push とデプロイ

### A(1) push（実施済み）

**push 前に `ignoreCommand` の判定材料を確認した**（`git diff --name-only origin/main..HEAD -- app-concierge/`）:

```
app-concierge/src/app/api/cron/snapshot-prices/route.ts
app-concierge/src/lib/x-post/airtable.ts
app-concierge/src/lib/x-post/t3-auto.ts
```

**→ `app-concierge/` に差分があるため `ignoreCommand` を通過する見込み**であることを、push 前に確認した。

### A(2) デプロイ — **READY**（CANCELED ではない）

| 項目 | 実測 |
|---|---|
| id | **`dpl_6hA4WSG7ivDLczcGEVkz31S8i9rP`** |
| **state** | **`READY`** |
| target | `production` |
| commit | **`57b0d31`** |
| created | **1787520058810 ms ＝ 2026-08-24 06:20:58 JST** |
| bundler | turbopack |

- **`ignoreCommand` は実際に通過した**（ビルドが走り READY になった）。**2026-08-22 に観測した CANCELED の再現はない。**

---

## タスクB — PAT 反映の確認（**値には触れていない**）

### B(1) cron ログでの確認 — **未実施。14:00 JST 枠を待つ**

**理由**: **本日の 06:00 枠は 2026-08-23 21:00:01 UTC ＝ 2026-08-24 06:01 JST に実行済みで、これは本デプロイ（06:20:58 JST）より__前__である。**

**06:00 枠の実測（デプロイ前・`dpl_B3NDf9HxPRsbeiJXKZjvHcpuMLYU` ＝ 掃除処理を含まない版）**:

```
### 21:00:01 GET /api/cron/snapshot-prices 200 [info/serverless]
{"tag":"VODNAVI_PRICE_SNAPSHOT","ok":true,"snapshot_date":"2026-08-24",
 "batch_at":"2026-08-23T21:00:01.555Z","new_campaigns":[],
 "detection_skipped":false,"detection_error":null,
 "t3_autopost_enabled":false,"t3_autopost":null,
 "found":462,"rows":462,"saved":462,"skipped":false,
 "okFloors":["videoa","anime","nikkatsu","videoc"],"failedFloors":[],"errors":[],"took_ms":2643}
```

- **`t3_autopost` が `null`** なのは **新規キャンペーンが検知されなかったため**（`autoPostT3` を呼んでいない）。**PAT の有無とは無関係。**
- **`t3_cleanup` の項目そのものが無い**＝**掃除処理を含まないビルドで動いていた**ことの裏付け。

**【重要・B(1) の観測条件の訂正】指示は「`VODNAVI_T3_AUTOPOST` ログで `skipped` が『PAT 未設定』でなくなることを確認」だが、__このログは新規キャンペーンが検知された実行でしか出ない__。** 新規キャンペーンの出現は制御できないため、**この条件だけに頼ると確認できない日が生じる。**

**代わりに、毎回必ず出る `VODNAVI_PRICE_SNAPSHOT` の本文に `t3_cleanup` を含めてある**（実装済み）。**次回 14:00 JST 枠では次を見る**:

| 見る場所 | PAT が反映されている場合 | 反映されていない場合 |
|---|---|---|
| `t3_cleanup.skipped` | **`null`** | **`"AIRTABLE_POSTS_PAT が未設定"`** |
| `t3_cleanup.writeEnabled` | `false`（`T3_CLEANUP_ENABLED` は OFF のまま） | 同左 |
| `t3_cleanup.candidates` | **候補の配列（タスクC(1) の答え）** | `[]` |
| `t3_cleanup.cutoffUtc` | 実行時刻 −45分 | `null` |

- **指示の「※ 直近枠まで時間がある場合はその旨を報告し、枠後に確認」に従い、本便では報告に留める。**
- **次の観測機会は 2026-08-24 14:00 JST（`0 5 * * *`）。**
- **【厳守】手動でのトリガは行っていない。**

### B(2) Vercel の変数一覧 — **確認できた**

| 項目 | 実測 |
|---|---|
| Key | **`AIRTABLE_POSTS_PAT`** |
| バッジ | **`Sensitive`** |
| Environment | **`Production`** |
| 追加時刻 | **`Added 8m ago`**（06:2x 時点の表示 ＝ **約 06:14 JST**） |
| 値の表示 | **錠アイコンのみ。値は表示されない**（`Sensitive` の挙動と一致） |

- **追加（≈06:14）はデプロイ（06:20:58）より前**＝**本デプロイが env を取り込む順序になっている。**
- **値は取得していない。**

### B(3) Airtable のトークン一覧 — **確認できた**

**一覧（`airtable.com/create/tokens`）**: **トークンは1件のみ。**

| NAME | ACCESS | SCOPES | DATE CREATED |
|---|---|---|---|
| **`vodnavi-t3-autopost`** | **`1 base`** | `data.records:read a…`（一覧では省略表示） | **Aug 24, 2026** |

**詳細画面での読み戻し**:

| 項目 | 実測 |
|---|---|
| **Name** | **`vodnavi-t3-autopost`** |
| **Scopes** | **`data.records:read`（See the data in records）** / **`data.records:write`（Create, edit, and delete records）** の**2つのみ**。他のスコープは無い |
| **Access** | **MY FIRST WORKSPACE の `VODNAVI X Calendar` のみ**。**`Add all resources` は使われていない** |

- **指定（第101便 タスクA(2)）と完全に一致する。**
- **`Save changes` は押していない**（読み戻しのみ）。
- **トークンの値は画面に表示されない**（Airtable は Create 直後の1度しか表示しない仕様）。**一覧に `TOKEN ID` 列があるが、これは識別子であり値ではない。本記録には転記しない。**

---

## タスクC — 掃除候補の読み戻し

### C(1) — **未実施。14:00 JST 枠を待つ**

**理由**: **`posts` テーブルを読む経路は PAT を持つ本番ランタイム（cron）だけである。**
**PAT は Vercel の Sensitive 変数としてのみ存在し、CTO のローカルには無い**（§13-0 のとおり値を扱っていない）。**したがって候補一覧は `t3_cleanup.candidates` として cron のログに現れるのを待つほかない。**

- **`rec8ccPuB7JWca8qf`（`接続テスト（後で削除）` / `承認済` / 予約 `2026-07-10T15:30:00.000Z`）の現存確認も同じ経路で行う。**
  - **予約日時が45分どころか1ヶ月半以上過去のため、現存していれば必ず候補に入る。**
  - **現存しなければ候補に現れない。** どちらであるかは 14:00 の実測で分かる。

### C(2) — **`T3_CLEANUP_ENABLED` は OFF のまま。変更していない。**

- 実装上も **`writeEnabled: false` のとき候補を返すだけで一切書かない**（第101便 B(2)）。
- **候補一覧を見てから CSO が ON を裁定する。**

---

## 稼働前チェックリスト（更新）

| # | 先行条件 | **状態** |
|---|---|---|
| **1** | **Make.com フィルタ** | **完了**（第100便）。**201/402 の実挙動は未検証** |
| **2** | **専用 PAT** | **配置は完了**（Airtable 側のスコープ／アクセス範囲と、Vercel 側の Sensitive/Production を読み戻しで確認）。**ただしランタイムで実際に使えるかは未検証**——**14:00 JST 枠の `t3_cleanup.skipped` が `null` になって初めて確認できる** |
| **3** | **稼働フラグ `T3_AUTO_POST_ENABLED`** | **未実施（CSO の最終確認後）** |
| **追加** | **`T3_CLEANUP_ENABLED`** | **未実施。候補一覧を見てから CSO が裁定** |

---

## 主張ごとの検証状態（§15-2-2）

| 主張 | 状態 |
|---|---|
| push 前に `app-concierge/` 差分があった | **実測により支持** |
| デプロイが READY になった | **実測により支持**（`dpl_6hA4WSG7ivDLczcGEVkz31S8i9rP`） |
| `AIRTABLE_POSTS_PAT` が Sensitive / Production で存在する | **実測により支持** |
| 変数の追加がデプロイより前に行われた | **実測により支持**（Added 8m ago ＝約06:14 / デプロイ 06:20:58） |
| Airtable のトークンが指定どおりのスコープ・アクセス範囲である | **実測により支持**（read+write の2つのみ / 1 base のみ） |
| トークンは1件だけで、余分な発行が無い | **実測により支持**（一覧に1行） |
| **PAT がランタイムで実際に使えること** | **未検証**（14:00 JST 枠の `t3_cleanup.skipped` で確認する） |
| **掃除候補の有無** | **未検証**（同上） |
| **`rec8ccPuB7JWca8qf` の現存** | **未検証**（同上） |
| 本日 06:00 枠がデプロイ前だったこと | **実測により支持**（21:00:01 UTC / `t3_cleanup` 項目が本文に無い） |
