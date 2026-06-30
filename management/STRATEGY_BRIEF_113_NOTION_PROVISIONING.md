# STRATEGY BRIEF 113 — VODNAVI Master Task DB の物理インスタンス化およびビュー配線

## 1. 目的
`BRIEF_111` の Notion 同期自動化（PoC）を Blocked している前提依存＝**Master Task DB の未 instantiate** を解消するため、`management/notion/DB_PROPERTY_DESIGN.md` のスキーマに基づき Notion DB 実体と 4 コアビュー（編集・SEO・QA・DB更新）を物理作成する要件を定義する。

## 2. 不変条件および構築規約
- **スキーマの完全同期**:
  - `DB_PROPERTY_DESIGN.md` snapshot のプロパティ（ステータス / 担当者 / インデックス方針 / 正規URL 等）を Notion 側へ 1:1 で移植する。
- **インデックス規約のガードレール**:
  - Notion に「インデックス方針: noindex」セレクトが存在しても、`?sort=` 等の動的クエリURLは**コードレイヤーの `self-canonical consolidation` を絶対正義**として死守し、Notion 値を `?sort=` へ転写しない（運用ドリフト永久禁止・[[project_sop_doc_topology_and_drift_fix]]）。

## 3. 前提・重複の整理（誤前提防止）
- **既存タスクとの重複整理**: 本ブリーフの作成対象は、既存 **`T-20260625-03`（Todo）「`DB_PROPERTY_DESIGN.md` スキーマで Master Task DB を起こし4ビュー疎通確認」と同一作業**。新規 `T-NOT-CREATE` / `T-NOT-VIEW` はその**実行細分化**であり、別トラッカーを並走させない（`T-20260625-03` を subsume）。
- **本セッションに Notion MCP/API は不在**（`.mcp.json` に notion エントリなし）。よって DB 実体作成は (a) Notion integration トークン + DB 親ページの HUMAN 提供、または (b) claude-in-chrome での notion.so UI 自動操作のいずれかが前提＝**現状は credential/手段ゲートで blocked**。捏造的「作成済」化はしない。
- 完成後、`BRIEF_111` の `T-NOT-API` / `T-NOT-VAL`（API 抽出・1:1 整合検証）の前提が解ける。
