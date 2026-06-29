---
title: "STRATEGY BRIEF 087: DMM 6月下旬クリックスパイク 物理監査（ライブ実測）"
last_updated: "2026-06-29"
status: "done"
author: "CTO（CSO script `execute_cso_tactical_sync.sh` の事実整合補正版）"
related_tasks: ["T-20260629-02", "T-20260628-08"]
---

# STRATEGY BRIEF 087 — DMM 成約消失アラート 物理監査最終報告

> 採番: 086 の次 = **087**（原 CSO script は当初 `038` を名乗ったが既存 `STRATEGY_BRIEF_038_SNS_CREATIVE.md` と衝突。空き番号 087 に是正。[[feedback_cso_brief_number_collision]]）。
> 原 script の `cat > management/TASK_BOARD.md`（全文上書き）は 1,151 行のガバナンス履歴を毀損するため**不採用**＝本書 + board in-place 記録（T-20260629-02）に是正。[[feedback_preserve_task_board_in_place]]

## 1. 取得方法（ファクトベース）
- claude-in-chrome MCP で DMM アフィリエイト レポートトップ（**法人登録済**アカウント）を 2026-06-29 にライブ取得。
- 集計: 「最近1週間」/ ID = **すべて**（全サブID横断）。`get_page_text` で日別テーブルを実値抽出。

## 2. 物理実測値（2026/06/23–06/29・ID すべて）

| 日付 | クリック数 | 購入報酬（ダイレクト+カテゴリ+新規） |
|---|---:|---|
| 06/23 | 25 | **1件 280円**（ダイレクト） |
| 06/24 | 212 | 0円 |
| 06/25 | 109 | 0円 |
| 06/26 | 87 | 0円 |
| 06/27 | 371 | 0円 |
| 06/28 | 522 | 0円 |
| 06/29 | 0 | （※本日分クリックは翌日反映） |
| **期間合計** | **1,326** | **1件 280円のみ** |

## 3. アラート言説の是正
- CSO アラートの「6/25-27 = 408click・27日 = 221click」は**不正確**。実測は **6/25-27 = 567click（109+87+371）・6/27 = 371click**。
- クリック推移は単調増加ではない（212→109→87 で一旦低下）が、**6/27→6/28 で 371→522 と escalating**。直近は明確な増勢で、スパイクは単発ボットバーストではない。

## 4. 結論：技術破綻ではない（T-20260628-08 の核心を物理再確証）
- DMM「クリック 1,326」と GA4 `ai_affiliate_click`（6/25-27 で最大 23）は**約24倍乖離**＝**別定義**（DMM = 全ID横断の生クリック／ボット・クローラ・API由来含む、GA4 = app の計装済 outbound CTA のみ）。**アプリ側 UI・動線は正常・修正不要**。
- `fanza_cta_click` は依然**実在しないイベント名**（[[reference_app_ga4_event_taxonomy]]）。

## 5. 留保（断定しないこと）
- 「購入報酬 0」はレポートトップの数値。**D友報酬は報酬別レポートに別掲**で本数値に**非包含**＋**購入確定lag**があるため、「CV完全ゼロ」とは断定しない。真のCV転換率は報酬別レポートでの追跡が必要（→ §7）。

## 6. ID別帰属（推定・未確定）
- per-ID フィルタ（native `<select>`）の自動確定適用に失敗 → ドリルダウン打ち切り（DMM 実画面での per-ID 確定値は未取得）。
- ただし [[project_moterist_zero_search_inflow]]（moterist GSC 流入 ≈ 0）＋ T-20260628-08（hostname = app 主体・moterist click 0）から、スパイクは **app.vodnavi.jp(004) / vodnavi.jp(003) 由来・凍結域 moterist(001) は非関与**と**推定**。
- アフィリエイトID登録（実画面確認）: 001=moterist / 002=X / 003=vodnavi.jp / 004=app / 005=motelab / 990–999=商品情報API（[[reference_dmm_affiliate_id_registry]] を 990–999 まで実画面で再確認）。

## 7. 次の物理監査アクション（T-20260629-02）
- 報酬別レポートで **D友報酬** と **購入確定lag** の推移を監視し、真の CV 転換率を追跡。
- 必要時のみ per-ID / 商品別レポートの手動確定取得。
