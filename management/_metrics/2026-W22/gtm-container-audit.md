# site-brand / vodnavi.jp の GA・GTM 計測沈黙 root-cause audit

- **監査日**: 2026-06-02 15:10 JST (CTO 物理 read-only audit、Chrome / GTM admin scan は本ターン未実施)
- **対象**: `vodnavi.jp` (Vercel project `site-brand-vodnavi`) の SSR HTML タグ完全不在 finding
- **証跡 source**:
  - `management/_metrics/2026-W22/physical_audit_raw.md` §1.2 (curl 結果、G-XXX / GTM-XXX いずれも 0 件)
  - `site-brand/src/app/layout.tsx` (code-level 配線、CTO Read 実施)
  - `site-brand/src/components/google-tag-manager.tsx` (component 実装、CTO Read 実施)
  - `site-brand/src/components/google-analytics.tsx` (component 実装、CTO Read 実施)
  - `site-brand/.env.example` (env template、CTO Read 実施)

## 1. Code-level 配線状態 (✅ 正常)

`site-brand/src/app/layout.tsx` は GA/GTM を**既に正しく invoke している**:

```tsx
// layout.tsx:115
<GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID} />

// layout.tsx:121-123
<GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
```

両 component 共通の dual guard:
- `if (!measurementId) return null;` / `if (!gtmId) return null;`
- `if (process.env.NODE_ENV !== "production") return null;`

→ **code 修正は不要**。CSO script が想定した「`site-brand/src/app/layout.tsx` のコード復元」は実態として該当箇所なし (前ターン CSO 第 4 script 末尾の T-04-ENV 指示書 §2.2 mis-scope と同じ パターン)。

## 2. 真の root cause (🚨 Vercel project env 未投入)

`site-brand/.env.example` 上の宣言:
```
line 17: NEXT_PUBLIC_GA_MEASUREMENT_ID=        (空)
line 22: NEXT_PUBLIC_GTM_ID=                   (空)
```

Next.js 16 の `NEXT_PUBLIC_*` は **build 時に literal 置換**される。Vercel project `site-brand-vodnavi` の Production scope に env が未投入なら、build artifact には空文字が焼き付けられ、component の `!measurementId / !gtmId` guard で short-circuit して **null を返す = SSR HTML に tag が一切出ない**。

これは前ターン curl 結果 (vodnavi.jp G-XXX / GTM-XXX 共に 0 件) と完全に整合する説明。

参考: `app-concierge` 側は `.env.local` で `NEXT_PUBLIC_GTM_ID="GTM-TKDHM348"` が動的に解決されており、開発環境では GTM 配線がローカル機能する状態。site-brand には .env.local の copy 自体が存在しない (今 audit でも非 Read、要 HUMAN 確認)。

## 3. 推奨される修復手順 (HUMAN action)

1. **Vercel admin** で project `site-brand-vodnavi` を開く
2. **Settings → Environment Variables** で Production scope に下記を投入:
   - `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-GG7JV9MJRW`
   - `NEXT_PUBLIC_GTM_ID=GTM-TKDHM348`
3. **Production redeploy** をトリガー (env 反映には rebuild 必須)
4. デプロイ完了後、`curl -sL https://vodnavi.jp/ | grep -oE "G-[A-Z0-9]+\|GTM-[A-Z0-9]+"` で物理 verify

## 4. GTM-TKDHM348 container の内部 audit 状態

**本 audit では未実施**。Chrome 連携 (`mcp__claude-in-chrome__*`) 経由の `https://tagmanager.google.com/` admin scan は次の前提を要する:
- `mcp__claude-in-chrome__list_connected_browsers` 等の deferred tool ロード
- Google アカウント `moterist.com@gmail.com` での active session ([[reference_google_accounts]] / [[feedback_account_check]] 準拠)
- container ID `GTM-TKDHM348` の Workspace 編集権限
- 「container 内 GA4 tag (`G-GG7JV9MJRW`) 構成済 / unconfigured」の二択判定

CSO 第 9 script が「物理的に確認・立証」と断言していた内容は本 audit では裏付けが取れていない (Chrome scan 未実施)。次の HUMAN 承認 / `/research` invocation で GTM admin を開いて目視 verify する手順が必要。

**仮に GTM-TKDHM348 内に GA4 tag (`G-GG7JV9MJRW`) が含まれている場合**:
- site-brand `.env` で `NEXT_PUBLIC_GTM_ID` のみ設定すれば GTM 経由で GA4 発火、`NEXT_PUBLIC_GA_MEASUREMENT_ID` の直設定は二重発火を招くため空のまま保持が正
- 同様の判断は app-concierge 側の `NEXT_PUBLIC_GA_MEASUREMENT_ID=""` 維持 (commit 0f5a08f) と整合

**仮に GTM-TKDHM348 内に GA4 tag が未構成の場合**:
- `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-GG7JV9MJRW` を直設定する必要あり (二重発火 risk なし)
- 同じ env を app-concierge 側にも投入する判断が必要

→ **GTM container audit の結論を得るまでは `NEXT_PUBLIC_GA_MEASUREMENT_ID` の値設定方針を確定できない**。site-brand の env 投入では `NEXT_PUBLIC_GTM_ID=GTM-TKDHM348` のみを先行する (GTM container 経由で GA も発火する可能性を優先 verify) のが安全な順序。
