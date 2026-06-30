# STRATEGY BRIEF 111 — Notion 4大業務実務SOPとリポジトリ・タスクボードの同期自動化要件

## 1. 目的
2026年6月28日 snapshot の Notion DB Property Design（4大業務実務SOP）に基づき、Notion上のタスク管理データベースと、リポジトリ内の `TASK_BOARD.md` 間のステータス乖離を防ぐため、GitHub Actions またはローカルスクリプトによる無人同期の要件を定義する。

## 2. 不変条件および設計規約
- **インプレース（追加・Edit）ルールの継承**:
  - 同期スクリプトは、`TASK_BOARD.md` の過去1,200行に及ぶ歴史ログを `cat >` 等で破壊的に全面上書きすることを**構造的に禁止**し、インプレースな追記（`>>`）または特定行の部分置換（`Edit`）のみを実行可能とせよ（[[feedback_preserve_task_board_in_place]] / BRIEF_103 §3）。
- **インデックス規約の厳守（ドリフト防御）**:
  - 本同期仕組みの開発・検証タスクの進行中においても、`?sort=` クエリ等に対する `self-canonical consolidation`（正規化統合）の原則を変更することは永久に許されない。

## 3. 前提依存と現状ファクト（誤前提防止）
- **Notion Master Task DB はまだ instantiate されていない（前提依存）**: スキーマ設計は `management/notion/DB_PROPERTY_DESIGN.md`（`AI_PROTOCOLS.md` §1「Notion DB Property Design」snapshot 2026-06-28）に存在するが、実 DB の起票＋4ビュー疎通は **`T-20260625-03`（Todo・未了）**。本同期 PoC（NOT-API/NOT-VAL）は **T-20260625-03 の完了**および **Notion API トークン/DB ID の存在確認**を第一歩の前提とし、捏造前提で進めない（DB/credentials 不在なら PoC は blocked と記録）。
- **noindex の越境禁止**: Notion スキーマの「インデックス方針」プロパティには noindex 選択肢が存在するが、`?sort=` は code-layer self-canonical（e82a670）で per-row noindex は不要（TASK_BOARD 行13 既確認）。同期は **Notion 側の noindex 値を `?sort=` へ転写してはならない**（最高法律違反になる）。
- **正典の所在**: SOP/checklists は `b63eb22` で repo（`AI_PROTOCOLS.md`）へ consolidate 済＝**repo が consolidated canonical**。Notion は task 運用 DB として併存する位置づけ。
