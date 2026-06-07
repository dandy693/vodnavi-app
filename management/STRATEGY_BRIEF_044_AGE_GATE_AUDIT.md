# STRATEGY_BRIEF_044 — 年齢確認ゲート（proxy.ts）の現状確認と2ドメイン要塞化

発行: 2026-06-07 / 採番: 043 の次 = **044** / 前提: BRIEF_043（moterist 凍結・2ドメイン集中）
※ CSO 原案の「middleware.ts 新規実装」は**事実誤認のため訂正**（下記 §2）。

## 1. 目的
moterist 凍結に伴い開発リソースを vodnavi.jp（メディア）と app.vodnavi.jp（成約アプリ）へ集中。年齢確認ゲート（リーガル 18禁防衛）は **既に実装・本番 build 通過済**であり、本ブリーフは「再実装」ではなく **現状の正確な記録 + 監査 + 残作業の整理**を行う。

## 2. 年齢確認ゲートの現状（既実装・正確な仕様）
- **ファイル**: `app-concierge/src/proxy.ts`（Next.js 16 の `proxy.ts` 規約。旧 `middleware.ts` の後継・deprecation 解消）。**`middleware.ts` を新規作成してはならない**（`project_age_gate_shield_is_proxy_ts`）。
- **非対称ガード設計（意図的）**:
  - **ページルート**（`/concierge` 等）: 常に **pass-through（リダイレクトしない）**。`source`/`intent`/`_gl` クエリをブラウザに無傷で着地させ、GA4 + `ai_session_start` を発火。視覚的な年齢確認は **client-side モーダル**（`/age-gate/age-gate-modal.tsx`、`/age-gate/page.tsx`、`/api/age-gate/route.ts`）で担保。
  - **API ルート**（`/api/*`）: cookie 未通過なら **HTTP 403** でサーバー側物理遮断（LLM/FANZA API へのアクセスを JS 改竄から防衛）。
  - **Cookie**: `vodnavi_age_verified=1`。
- ⚠️ **原案の「エッジで /age-gate へ内部リライト」は不採用**: 現設計は意図的にページを redirect せず pass-through する（tracking param 保全のため）。リライト化はこの設計を壊すので行わない。
- ⚠️ **`_gl` の扱い**: `proxy.ts` は `_gl` 着地を Vercel Logs へ構造化ログ emit（実効件数計測）するのみ。`_gl` は GA4 client-side linker（gtag）の param であり、middleware が「デコードして FANZA cookie へ引き継ぐ」ものではない。FANZA 早期クッキー着火は別機構（`buildEarlyCookieURL` / 着火カード、BRIEF_040）。

## 3. W26 実作業（既実装の再実装はしない）
- [ ] proxy.ts + `/age-gate` 一式の**動作監査**（`tsc`/`next build` 通過は確認済、必要なら本番 curl で cookie/403 挙動を確認）。新規 `middleware.ts` は作らない。
- [ ] vodnavi.jp 側メディア記事格納環境の選定（WP 構成 or Next.js 内展開、BRIEF_043 §4）。
- [ ] app.vodnavi.jp の SNS（X）着地クリーン LP 設計（既存 age-gate と統合、BRIEF_043 §4）。

## 4. ガバナンス不変条件
- `middleware.ts` を新規作成しない（`proxy.ts` が正典）。
- proxy.ts の「ページ pass-through + client モーダル + API 403」非対称設計を壊さない（ページを redirect 化しない）。
