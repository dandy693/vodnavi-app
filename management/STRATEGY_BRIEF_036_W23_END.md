# STRATEGY_BRIEF_036_W23_END — 土曜データ駆動PDCA（2026-W23）公式総括

発行: 2026-06-07 / 採番: 035 の次 = **036**
基点データ: `management/_metrics/2026-W23/`（`saturday_pull_2026_06_06` / `moterist-infra-audit.json` / `gsc-panel-audit.json`）

## 1. 物理ファクトに基づく確定事項
- **moterist.com**: 技術クリーン（robots/noindex/X-Robots 非ブロック・手動ペナルティなし・5大ピラー 5/5 INDEXED）でありながら検索インプレッション「1」。→ 技術・ペナルティ・未インデックス要因は全て物理的に棄却。残る **Google SafeSearch/成人デランクによる構造的非表示が最有力**（「確定」ではなく検証可能な全代替仮説を棄却した結果の最有力推定）。SEO 技術改善・リライト・SSH 注入では検索流入は増えない公算大。
- **vodnavi.jp**: GSC 表示回数 81,800 / クリック 2,640 / 平均CTR 3.2% / 平均順位 8.7。一般クエリでの生存をファクト確認。集客の実体はこちら。
- **運営主体名義**: 表層屋号「VODNavi運営事務局」／実体法人「合同会社トレンドネット」のハイブリッド併記を `site-brand/about` へ実装（`60307f1`）。`layout.tsx` JSON-LD `legalName` と非矛盾。
- **E-E-A-Tインフラ**: `/about`・`/privacy`・`/terms` の3ルート + 共通 `site-footer.tsx` のトークン準拠リンク配線を実装。**`tsc --noEmit` exit 0 + `next build`（Next.js 16）exit 0**、3ページ static prerender を物理確認（`60eff84`）。

## 2. 経営戦略の方向性（Strategic Pivot — HUMAN 承認済境界に基づく）
オーガニック集客の主軸を `vodnavi.jp` 内 `site-brand/`（Next.js モノレポ）へ移転する方針。SEO 保護対象のクリーン面（一般教養・文化映画論）を磨き、E-E-A-T を満たして一般検索からユーザーを捕獲。成人向けコンテンツ（FANZA アフィリエイト）への接続は、サーバー側 **`proxy.ts`**（Next.js 16 で `middleware.ts`→`proxy.ts` に rename 済）の「年齢確認ゲート」を通過した後の `app.vodnavi.jp` 内部へ隔離する。
> 注: 本ピボットの戦略採否そのもの（Google organic 依存からの脱却・非 Google 経路への重心移動）は最終的に HUMAN/CSO の経営判断。本ブリーフは W23 で実装済の境界（BRIEF_034 §4 承認済）とインフラを総括するもの。

## 3. 次期保留タスクのトリガー条件（申し送り）
- **source × intent Exploration 保留解除トリガー**: 現状アプリ流入の 98.6% がダイレクトで `source`/`intent` タグ付きが僅少のため Deferred（`source-intent-exploration.json`）。新設クリーン教養コラムから `?source=brand&intent=*` のタグ付きインバウンドが稼働し有効セグメントが発生した時点で、GA4 Exploration（約20ステップの自動ブラウザ駆動）を起動し内訳を定量取得する。
- **未確定の HUMAN 判断**: ①集客ピボットの戦略採否 ②privacy/terms の正式 legal review（現状は汎用 boilerplate）③確定CVR（DMM 管理画面）。

## 4. W23 セッション landed 一覧
`a405554`(skeleton) → `ac96a15`(data pull) → `bc8fe7e`(infra audit) → `a22ba4c`(GSC panel) → `f8c4eee`(BRIEF_034) → `fd70895`(境界承認) → `6e4f17a`(exploration deferred) → `531c95e`(BRIEF_035) → `7796e50`(scaffold 前提修正) → `8f2247d`(E-E-A-T pages) → `60307f1`(hybrid naming) → `6812569`(footer) → `60eff84`(clean policy + T-04 close)
