# STRATEGY BRIEF 108 — vodnavi.jp における E-E-A-T 物理補強および構造化データ設計

## 1. 目的
実集客の主軸である `vodnavi.jp` の Next.js メディア要塞化において、検索エンジンに対する E-E-A-T（専門性・権威性・信頼性）のシグナルを最大化し、同時に不正なクエリパラメータによる評価分散を徹底防衛する。

## 2. 不変条件および実装要件
- **実在ファクトに基づく構造化データ**:
  - トップページおよび主要ハブページに対し、実在する検証済み組織情報に紐づいた `Organization` および `WebSite` JSON-LD を厳格に配置せよ（架空法人名の捏造は永久に禁止する＝検証値は **合同会社トレンドネット**、"Safari株式会社" 等は不採用）。
- **インデックス統合（最高法律の継承）**:
  - パラメータ汚染（`?sort=` 等）を排除するための `self-canonical consolidation` ロジックを Next.js のメタデータ生成レイヤーに配線し、すべての評価シグナルを正規絶対URLに集約せよ（`noindex` は使用しない＝consolidation を阻害するため）。

## 3. 現状の実装ファクト（新規捏造ではなく検証/拡張）
- `Organization` と `WebSite` の**両 JSON-LD は既に** `site-brand/src/app/layout.tsx` の `@graph` に集約済（line 69「Organization と WebSite を 1 ペイロードに集約」/ 75 / 92）、`legalName: "合同会社トレンドネット"`（layout.tsx / terms / privacy / about / footer に浸透した**検証済値**）。EAT タスクはこの**既存ペイロードのスキーマ検証**であり、新規作成・新規法人情報の捏造ではない。
- `generateMetadata` + self-canonical（`alternates.canonical = https://vodnavi.jp/{slug}`）は既に `site-brand/src/app/[slug]/page.tsx`（dual-read, BRIEF_100）に実装済。MET タスクはその**既存ロジックのコードレビュー**であり、絶対URL canonical の出力健全性を確認する。
