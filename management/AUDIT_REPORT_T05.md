# AUDIT_REPORT: T-20260607-05 — `proxy.ts` 年齢確認ゲート 物理コード監査

実施: 2026-06-07 / 監査: CTO（read-only コードレビュー）/ 対象: `app-concierge/src/proxy.ts`（74 行）

## 結論
✅ **既存設計どおり正しく実装されている。修正不要。** 非対称ガード（ページ pass-through + API 403）/ `_gl` 計測 / cookie 判定はいずれも整合。新規 `middleware.ts` は不要。

## 検証項目
### 1. ✅ 年齢確認 cookie（`vodnavi_age_verified=1`）
`COOKIE_NAME="vodnavi_age_verified"` / `COOKIE_VALUE="1"`。API ルートで `req.cookies.get(COOKIE_NAME)?.value === COOKIE_VALUE` を厳密判定。proxy.ts は READ のみ（SET は `/api/age-gate/route.ts`）。整合。

### 2. ✅ ページ pass-through（`/concierge`, `/concierge/*`）
常に `NextResponse.next()`、リダイレクトしない → `source`/`intent`/`_gl` を無傷で着地（GA4 + ai_session_start を阻害しない）。`_gl` 付き着地時のみ `console.log("[GL_TRACKING] …")` で計測し、**PII 防止のため `_gl` は先頭 10 文字のみ記録**。良好。

### 3. ✅ API 403 ガード（`/api/concierge/*`）
cookie 未通過なら status **403** + JSON body `{error:"age_verification_required", message:…}` + `cache-control: no-store`。`useChat` の fetch が parse できる JSON を返す点も適切。`matcher: ["/concierge","/concierge/:path*","/api/concierge/:path*"]` は **`/api/age-gate` を含まない** → cookie SET 前に到達する必要があるため正しい。

## 観察（軽微・修正不要）
- **attestation grade**: cookie は client が devtools 等で手動 set 可能（モーダルクリックと同等の 18+ 自己申告）。ソースコメント「JS 改竄を許容しない核心防衛線」は厳密には言い過ぎだが、法的 **18禁自己申告**ゲートとしては妥当（暗号学的境界ではない）。意図された用途には十分。
- `tsc --noEmit` / `next build` は本セッションで exit 0 を物理確認済（age gate ルート `/age-gate`・`/api/age-gate` も static/dynamic 生成を確認）。

## 判定
**T-20260607-05 = 完了（修正不要）**。age gate は `proxy.ts` として既に live・設計どおり。W26 の次は T-06（vodnavi メディア環境選定）/ T-07（app SNS LP 設計）。
