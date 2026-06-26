# STRATEGY_BRIEF_078: クリーン層アトリビューション防衛線の設計

> 出自: CSO `cso_*`（2026-06-27）。Claude Code の `site-brand/` 読み取り専用スキャン（T-20260627-04 audit）に基づく設計ブリーフ。

## 1. 物理監査ファクトの総括
`site-brand/` の物理スキャンにより、以下が特定された。
- **捕捉漏れ**: `layout.tsx` は `?source=` をパースせず、`google-analytics.tsx` の `useSearchParams()` が GA4 page_view に生クエリを流すのみ（メモリ/cookie への永続化なし）。
- **回遊時の消失**: SSG ページ間を回遊した時点で URL パラメータが消失し、ブリッジ遷移時にはアトリビューションが失われる。
- **ハードコードの限界**: `concierge-handoff.ts`（`buildConciergeHandoffUrl`、既定 `source='brand'`）、homepage `page.tsx`（`?source=brand`）、`compare/page.tsx`（`?source=brand_compare_hub`）、および `article.md` 内インラインリンク（`/lp?source=brand_pilot_001`）は全て固定値で、流入元の動的フォワードは皆無。

## 2. アーキテクチャ設計方針 (Next 16 App Router 準拠)
SSG のパフォーマンスと SEO 強度を維持しつつ動的アトリビューション保持を実現する「非破壊的レイヤーアプローチ」。

### A. 捕捉・永続化レイヤー（早期着火）
- `site-brand/src/components/` にクライアント `AttributionTracker.tsx`（cookie ベース）を新設。
- `layout.tsx` にマウントし、`useSearchParams()` で `source` を検知した瞬間ファーストパーティ cookie（30 日, `SameSite=Lax`）に焼き付ける。

### B. 動的フォワードレイヤー（ブリッジ書き換え）
- `buildConciergeHandoffUrl` を拡張し、cookie が存在する場合は `source` を上書きブレンド。
- **マークダウン内インラインリンクの救済策**: 記事レンダー側の正規表現置換、または client side でのブリッジ URL 動的差し替え（ハイドレーション・パッチ）。既存 `article.md` は 1 文字も破壊しない。

## 3. CTO 補足（実装上の必須留意点）
- **Suspense 必須**: `useSearchParams()` は static prerender を中断するため、`AttributionTracker` は `<Suspense>` 隔離が必要（既存 `google-analytics.tsx` と同じ制約）。さもないと `/`含む全 SSG ルートが dynamic 化し SEO/パフォーマンスを毀損する。
- **インラインリンクが本丸**: §2.B の「render 側正規表現置換」が本命。`[slug]/page.tsx` の `inline()` は `[text](url)` を `<a>` 化する箇所で、`app.vodnavi.jp/lp` 宛の href に cookie 由来 source を server/ client で注入できる。client hydration patch は SSG HTML と一時不一致（CLS/ちらつき）リスクがあるため、render-time 書換を優先検討。
- **cross-domain は URL パラメータで渡す**: cookie は clean 面（vodnavi.jp）の回遊保持専用。app.vodnavi.jp へは従来どおり**URL クエリ**で source を渡す（別サブドメインの cookie 読取に依存しない＝既存ハンドオフ規約と整合、[[reference_dmm_affiliate_id_registry]] 非関与）。
- **clean 境界の不変**: source は文字列識別子のみ。作品固有/成人パラメータは引き続き渡さない（`concierge-handoff.ts` の境界規約・年齢ゲートは app 側 proxy.ts）。
- **プライバシー反映**: ファーストパーティ cookie 新設は `privacy/page.tsx` の Cookie 記述に追記して整合させる（GA4 cookie 記載済の隣に source 計測 cookie を明記）。
- **値の衛生**: 受理する source は許可リスト or `/^[a-zA-Z0-9_]{1,32}$/` で正規化（[[reference_session_start_vs_ai_session_start]] のような raw 値ノイズ混入を防ぐ）。

## 4. 段階方針
spec のみ。実装は要 HUMAN 承認 + `tsc`/`next build` 検証。最小スコープは「A.捕捉 cookie + B.`buildConciergeHandoffUrl` 拡張」で、インライン link 動的化は第2段（render-time 書換）として分離する。
