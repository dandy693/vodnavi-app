# 在庫枯渇の再発防止 — 案B 実施 / 前提確認 / 案A 作成・**テスト検証・有効化まで完了**

- 実施: **2026-08-03 01:58 〜 02:15 JST**
- CSO 承認: 閾値6件・木曜10:00 JST・通知先据え置き・`CLAUDE.md` への1行追加、および「案B先行 → 前提確認 → 案A」の順
- Phase 1 で停止

---

## 1. 案B（週次の定型タスク）— **実施済み**

| 対象 | 内容 |
|---|---|
| `CLAUDE.md`（**毎セッション自動ロード**） | 「## 週次チェック（毎週木曜・在庫枯渇の再発防止）」を新設。base/table ID・**閾値6件**・根拠（翌週月〜水＝3日分×2件/日）・8/2 の枯渇事故を1項目で記載 |
| `management/TASK_BOARD.md` | `T-20260803-STOCKGUARD` を追記。確認手段（読み取りのみの MCP クエリ）・埋没防止のため CLAUDE.md にも記載した旨・次段（案A）を明記 |

TASK_BOARD は現在 2,671 行。**追記だけでは埋没する**ため、自動ロード対象への記載を併用した（比較検討 §5 の設計どおり）。

## 2. 前提確認（実装前に確認すべしとした2点）

| # | 前提 | 結果 |
|---|---|---|
| ① | Conditional action group が現プランで保存できるか | **保存できる**。`get_create_automation_instructions(baseId)`（**base スコープ**の機能カタログ）に `conditionalGroup` / `cron` / `findRecords` / `length` がいずれも含まれ、実際に `create_automation` が **`isValid: true` / `errors: []`** で保存された |
| ② | 自動化の実行回数上限 | **数値は未確認**（UI に使用量の表示を見つけられなかった）。ただし本設計は**週1回＝月約4回**であり、Airtable の最下位プランの水準でも制約にならない。**プラン名も未確認**（revision history 2週間・`Upgrade` CTA からの推定に留める） |

## 3. 案A（Automation）— **作成・テスト検証・有効化まで完了（deployed）**

| 項目 | 値 |
|---|---|
| ID | **`wflfLOp2JJo89imzQ`** |
| 名称 | 在庫アラート(X投稿・毎週木10:00 JST) |
| URL | `https://airtable.com/app0VKGU2B16qny6c/wflfLOp2JJo89imzQ` |
| **状態** | **`deployed`＝ON（有効）**。2026-08-03 02:1x JST に Chrome 連携で Test automation → トグル ON を実施 |

### 構成

```
トリガー : cron / weeklyV2
           weekdays=[4]（木曜）, triggerTimes=[{hour:1,minute:0,second:0}], width=1
           ※ weeklyV2 に tz 指定は無く UTC 固定。01:00 UTC = 10:00 JST（同一曜日）
           start = 2026-08-02T17:15:00.000Z

ノード1  : findRecords（tblZMqvjtJY8MfaWZ）
           ステータス = 承認済（sel9i6IZZTBkKbt5M）
           AND 予約日時 >= { mode: daysFromNow, numberOfDays: 4, timeZone: Asia/Tokyo }

ノード2  : conditionalGroup
           branch「翌週分の在庫が6件未満」: length(ノード1.records) < 6
             └ sendEmail → moterist.com@gmail.com（件数を件名・本文に埋め込み）
```

### 【設計修正】基準日を「今日以降」→「4日後以降」に変更した理由

初版は `予約日時 >= today` としたが、**この条件では今回の失敗を捕捉できない**ことを検算で発見したため修正した。

| 実行日 | `>= today` の件数 | `>= 4日後` の件数 | 判定 |
|---|---|---|---|
| 2026-08-03（本日・実測） | **13件** | **6件** | どちらも通知なし（正常） |
| 2026-08-06（木・想定） | **8件**（8/6〜8/9 が該当） | **0件**（8/10 以降が該当） | `>= today` では **8 ≥ 6 で通知されない**／`>= 4日後` では **0 < 6 で通知される** |

木曜に「翌週月〜水」を見るのが運用則であるのに、`>= today` だと**今週末の在庫が件数に混ざり、翌週分が0件でも警報が鳴らない**。木曜+4日＝翌週月曜であるため `daysFromNow: 4` を基準にした。
**閾値6件・実行曜日・時刻・通知先は CSO 承認どおりで変更していない。**

### 検算（同一条件を MCP の読み取りクエリで実行・2026-08-03 02:0x JST）

- `ステータス=承認済 AND 予約日時 >= 4日後` → **6件**（W5-09/10/11/12/13/14＝8/7〜8/9 分）
- 8/3〜8/6 の 7件は除外されている＝意図どおり

### 【誤記の修正】

初回作成時、メール件名・本文・ブランチ名に **「閾値」を「閉値」と誤記**していた（`U+9589` 閉 / 正しくは `U+95BE` 閾）。`update_automation` で修正済み（`actionId: actcpvY7Ut0rvKvlM`）。オートメーションの説明文は初回から正しい表記だった。

---

## 4. テスト検証と有効化（Chrome 連携・CSO 指示により実施）

### 4-1. Test automation（**ライブ実行**）

UI の注意書き: 「This test will run as a live automation. Any configured messages or changes to data will be done and cannot be undone.」
本オートメーションは**データを書き込むノードを持たない**（`findRecords` + `sendEmail` のみ）ため、テストで変更されるものは無い。
また実行時点の在庫は 6件で `6 < 6` が false になるため、**メールも送信されない**見込みで実行した。

| ステップ | 結果 |
|---|---|
| At a scheduled time（トリガー） | **✓ 成功** |
| Find records | **✓ 成功**。Found records に `W5-12` / `W5-09` … が表示され、MCP の検算（6件・8/7〜8/9 分）と一致 |
| If Records length < 6 → Send an email | **スキップ（グレー表示）＝条件不成立**。**メールは送信されていない** |

→ 「在庫が閾値以上のときは鳴らない」という正常系の挙動を実機で確認した。

### 4-2. 有効化

- UI のトグルを **OFF → ON** に変更（`Last updated by モテリスト` と表示）
- API 側でも `deploymentStatus: "deployed"` を確認（`list_automations`）
- **既存「エラー通知」も `deployed` のまま変化なし**

## 5. 実施していないこと

- 既存「エラー通知」（`wflUyeGut6FflwgJu`）の編集・停止・テスト実行
- `Undo` / `Redo` / `Snapshots` / `Clear revision history` / `Trash` の実行
- 閾値・曜日・時刻・通知先の CSO 承認値からの変更

---

## 6. 繰越（時刻依存・別途リマインドが必要）

| 項目 | 期限 |
|---|---|
| W5-01（8/3 21:00 JST）の配信確認 | **2026-08-03 中**。在庫枯渇から2日ぶりの再開のため初回確認 |
| 8/10〜8/12 の在庫確保 | **2026-08-06(木) 10:00 JST に本アラートが自動発報する想定**（その時点で「4日後=8/10 以降」の在庫は 0件 → `0 < 6` で成立）。アラートは有効化済みのため、CTO 側の手動リマインドは不要になった |

> 本記録は事実の転記と、CSO 承認範囲内での実装内容。§3 の設計修正は承認値（閾値6件・木曜10:00・通知先）を変えずに、承認された意図「翌週月〜水を確保」を満たすための基準日の修正である。
