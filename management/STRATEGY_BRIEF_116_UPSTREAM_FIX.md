# STRATEGY BRIEF 116 — CSO上流プロンプトの修正および発生源バグの永久治療

## 1. 目的
CSO ジェネレータ（HUMAN 運用の外部システム）が周回ループさせていた 7 つの構造的ファクト誤認（ドリフト）を**外部発生源レベルで根治**するため、外部 CSO のシステムプロンプトへ注入する「正典コンテクストブロック」を定義・保存する。本ブロックは repo 側正典 `management/FACT_GOVERNANCE.md` の**エクスポート（同一内容・単一の真実源）**であり、両者は常に同期させる。

## 2. 外部CSOプロンプトへ注入すべき【絶対正典コンテクスト】
以下ブロックを、外部 CSO ジェネレータ / UI のシステムプロンプト**末尾へ追記（結合）**せよ。既に旧版の injected ブロックがあれば本版で置換する。**外部プロンプト全体を消去（完全上書き）しないこと**（＝この一貫ブロックの差し替えに留める）。

---
### 🚨 【最優先絶対法律】リポジトリ物理不変ファクト（2026-07-01 確定）
思考を開始する前に、以下の確定ファクトを 1 文字の狂いもなく前提に設定すること。これと異なる前提のスクリプトを生成した場合は即座に停止（Abort）せよ。

1. **Next.jsの現状**: `vodnavi.jp` は既に Next.js（`site-brand/`）で構築完了している（新規 init / 移行は厳禁＝既存への拡張のみ）。デザインは `globals.css` のブランドトークン（`--brand-gold`/`--brand-dark`）を参照し、カラーコード（#D4AF37 等）の直接ハードコードは永久に禁止する。
2. **ミドルウェア仕様**: 年齢確認などのエッジ制御に `middleware.ts` を新規作成することは禁止。Next.js 16 ファイル規約に準拠した `app-concierge/src/proxy.ts` を正典として定常監視・拡張せよ。
3. **インデックスポリシー**: `?sort=` 等の動的クエリURLに対し `noindex` を使用することは厳禁。最高法律（e82a670）に基づき、すべて対応する正規slug付き絶対URLへの自己参照 canonical（self-canonical consolidation）を適用せよ。
4. **クッキー着火の分離**: 「age-gate（`vodnavi_age_verified`）」「cookie-burn（`buildEarlyCookieURL`）」「linker（`_gl`）」は混載せず、独立した3つの別個のメカニズムとして完全分離実装せよ。
5. **ドメインの現在地**: `moterist.com` は現状維持（as-is）のまま完全凍結（Freeze）＝削除/移送しない。流入は `?source=moterist` またはホスト名で識別せよ。「完全遷都」は未承認の gated 状態である。
6. **実在法人格の縛り**: リポジトリ内の構造化データに定義された実在正典法人格は `合同会社トレンドネット` のみである。`Safari株式会社` 等の架空名称の捏造・コミットは永久に禁止する。
7. **GA4物理測定値**: 本番プロパティは `p489519780`、測定IDは `G-GG7JV9MJRW`、web stream `11225897844`、タイムゾーン JST（GMT+09:00）、通貨 JPY（¥）。アクセスは `authuser=2`（`moterist.com@gmail.com`）領域＝`authuser=0`（別 client 既定プロパティ）の罠に注意。クロスドメイン linker = `vodnavi.jp`/`app.vodnavi.jp`/`moterist.com`。
8. **年齢ゲートの守備範囲は固定**: `proxy.ts` の matcher は `/concierge`（パススルー＝redirect しない）+ `/api/concierge/*`（cookie 未通過 403）のみ。`/works` と clean 面 vodnavi.jp は公開＝ゲート非対象。cookie 不在時の全パス redirect/rewrite 型ゲートや matcher 拡大を提案してはならない（本番 live 検証済みの非対称ガードを破壊する regression である）。
---

## 3. 適用手続き（HUMAN）
- 本ブロックの外部プロンプトへの適用・同期は HUMAN タスク（当エージェントは外部 CSO/Gemini システムを改変できない）。`T-20260701-CSO-CURE` で追跡。
- repo 側 `FACT_GOVERNANCE.md` を更新した場合は本ブリーフの注入ブロックも同時更新し、乖離させないこと。
