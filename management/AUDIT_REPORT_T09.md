# AUDIT_REPORT: T-20260607-09 — `/lp` → `/concierge` 年齢ゲート/クッキー e2e 検証

実施: 2026-06-08 / 監査: CTO（実 dev サーバ起動 + curl）/ 対象: app-concierge（`/lp`, `proxy.ts`, `/api/concierge`）

## 1. 結論
- ✅ **年齢ゲート（proxy.ts）の挙動は runtime 検証済**。
- ✅ **`/lp` は production build 検証済**（param 透過ロジックは code-level で正）。
- ⚠️ **`npm run dev` での page 描画は不可**（globals.css の token import に起因する **Turbopack dev 限定**の panic、production build は正常）。pre-existing で `/lp` 固有でも production 問題でもない。

## 2. 物理検証結果（実 HTTP）
- `POST /api/concierge`（cookie なし）→ **HTTP 403**。proxy.ts の API age-gate が未認証アクセスをサーバー側で物理遮断することを runtime 確認。
- `POST /api/concierge`（`cookie: vodnavi_age_verified=1`）→ **HTTP 503**（proxy.ts を pass-through し downstream の handler に到達、dev に FANZA/LLM env 未設定のため 503）。**= proxy.ts が cookie 通過時にゲートを開けることを確認**。
- `GET /lp?source=sns_x&intent=actress` → 500（下記 §3 の dev tooling 起因。CTA href は採取不可）。

## 3. `/lp` dev 500 の根本原因（fix 推奨・production 影響なし）
- Turbopack dev panic: `app-concierge/src/app/globals.css:8` の `@import "../../../design-tokens.css"`（monorepo ルート直下の単一情報源）が、Turbopack dev の project root（app-concierge/）を超える＝"leaves the filesystem root"。
- **production build（`next build`）は正常**（本セッションで /lp = ƒ dynamic 生成を確認済）。Vercel 配信も同様に正常のはず。
- **影響範囲**: root layout 経由で globals.css を読む**全ページ**が `npm run dev` で 500。`/lp` 固有ではない。
- **推奨 fix（別タスク）**: site-brand 同様、app-concierge にも `design-tokens.css` の synced ローカルコピーを置き、globals.css は `../../design-tokens.css`（ローカル）を import する（root `../../../` をやめる）。これで dev page 描画が復活する。

## 4. e2e フロー（code + build + runtime の合成検証）
X → `/lp?source=sns_x&intent=*`（proxy.ts matcher 非対象＝pass-through、production で描画）→ CTA `href=/concierge?source=…&intent=…`（`URLSearchParams` で無損失、build verified）→ `/concierge`（proxy.ts page pass-through + `ConciergeGate` モーダル）→ cookie `vodnavi_age_verified=1` set → 以降 `/api/concierge` は通過（未 set なら 403）。**ゲート核は runtime 実証済**、page 描画は production build 実証（dev は tooling で不可）。

## 5. 判定
T-20260607-09 = **部分完了 [/]**。年齢ゲート/クッキー挙動（最重要）は runtime 検証済。`/lp` page 描画の live click-through は dev tooling 問題で未実施＝production build を以て検証とする。dev 描画復活は §3 の globals.css fix（別タスク）。
