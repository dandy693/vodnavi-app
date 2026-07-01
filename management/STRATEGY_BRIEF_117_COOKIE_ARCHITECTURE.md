# STRATEGY BRIEF 117 — 年齢確認・早期クッキー着火・計測リンカーの3型独立分離設計仕様

## 1. 目的
`FACT_GOVERNANCE.md` §1「クッキー3機構混載禁止」の**詳細設計仕様**として、`app-concierge/src/proxy.ts` エッジ層で age-gate / cookie-burn / linker を独立3機構として分離実装・拡張するデータパイプラインを定義する。

## 2. 独立3機構の物理定義
- **① age-gate（年齢確認）**:
  - クッキー名: `vodnavi_age_verified`（`proxy.ts` 検査）。
  - 役割: 法規遵守（閲覧制限）の判定フラグ。未通過時は `/api/concierge/*` を 403 遮断。ページルート `/concierge` はパススルー、`/works` は公開（SEO 面・matcher 非対象）。
- **② cookie-burn（早期クッキー着火）**:
  - 関数: `buildEarlyCookieURL`（`app-concierge/src/lib/concierge/url-builder.ts:162`・実在確認済）。
  - 役割: CTA クリック等クライアント側アクションに紐づく FANZA アフィリエイトの早期着火。`af_id` は env 解決（ハードコード禁止）。**`proxy.ts` に混載しない**。
- **③ linker（計測リンカー）**:
  - パラメータ: `_gl`（gtag.js が**自動消費**＝手動 dataLayer パースではない）。
  - 役割: GA4（`p489519780`）による `vodnavi.jp` ↔ `app.vodnavi.jp` 間のセッション/hostName 伝搬維持。`proxy.ts` は `/concierge` 着地時に `_gl` を `[GL_TRACKING]` console log で記録するのみ（GA4 イベント発火はしない）。

## 3. 実装トラッキング（重複回避・FACT_GOVERNANCE §4 準拠）
- 本仕様の**実装は既存タスクで追跡**＝`T-20260701-MIDDLEWARE-AUTH`（proxy.ts 年齢ガード + 3機構分離）/ `T-20260630-EDGE`（prototype）/ `T-20260630-MW`（定常監視）/ `T-20260701-CON`（`_gl` GL_TRACKING 検証）。
- CSO 原案の `T-CK3-PROXY` / `T-CK3-BURN` は上記と重複するため**新規起票しない**（並走トラッカー増設禁止・FACT_GOVERNANCE §4）。本ブリーフはその設計仕様の記録に留める。
