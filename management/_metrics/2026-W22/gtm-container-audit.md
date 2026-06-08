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

## 5. 【Chrome 実画面監査ファクト】 2026-06-02 16:40-16:50 JST

### 5.1 監査手法
- CTO (Claude Opus 4.7) による `mcp__claude-in-chrome__*` deferred tools 直接 invoke (`/research` skill 不在のため)
- 使用 browser: **VostroPC (Windows, 本機)** — user 選択により確定 (deviceId `53d6f2e7-fef3-4fbf-94aa-08c100a087a5`)
- ログインアカウント: `moterist.com@gmail.com` (URL `?authuser=2` 経由、[[reference_google_accounts]] / [[feedback_account_check]] 準拠)
- 経路: `tabs_create_mcp` → `navigate(https://tagmanager.google.com/?authuser=2#/home)` → `find(app.vodnavi.jp container link)` → workspaces/2 配下の `/tags` `/variables` `/triggers` を順次 `get_page_text`

### 5.2 確定 IDs (CSO 第 10 script の placeholder URL を物理訂正)
| 項目 | 物理事実 | CSO 第 10 script の placeholder |
|---|---|---|
| Account ID | `6357259405` (VODNAVI-GROUP) | `6045052955` (fabricated) |
| Container ID | `253492305` (app.vodnavi.jp, GTM-TKDHM348) | `105439401` (fabricated) |
| Workspace ID | `2` (Default Workspace) | `1` (placeholder) |

→ CSO 第 10 script の `accounts/6045052955/containers/105439401/workspaces/1` URL は完全に fabricated だった。実 ID は完全に別物。前ターン user/CTO の placeholder 警告は正解。

### 5.3 GTM-TKDHM348 container の物理内容 (Default Workspace v2)

| セクション | 件数 | 詳細 |
|---|---|---|
| **Tags** | **0 件** | 「このコンテナにはタグがありません。[新規] をクリックして作成してください。」 (画面文言原文) |
| **Triggers** | **0 件** | 「このコンテナにはトリガーがありません。[新規] をクリックして作成してください。」 |
| **User-defined Variables** | **0 件** | 「このコンテナにはユーザー定義変数がありません。[新規] をクリックして作成してください。」 |
| **Built-in Variables** | 5 件 (GTM デフォルト) | Event / Page Hostname / Page Path / Page URL / Referrer (デフォルト) |
| **Workspace 変更数** | **0** | Default Workspace = Latest Published Version、未公開差分なし |

### 5.4 確定結論 (二重発火 policy 判断)

**GTM-TKDHM348 container は 2026-05-26 に作成済 ([[project_gtm_n6zdk9lr_is_fake]]) だが、中身が完全に未構成 (空)**。

→ GA4 measurement tag `G-GG7JV9MJRW` は GTM container 内に**存在しない**。「All Pages トリガーで仕込まれているか」以前の段階で、tag 自体が一切未配置。

**implications**:
- ❌ GTM container 経由の GA4 発火は**不可能**
- ✅ site-brand と app-concierge 両方で `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-GG7JV9MJRW` を**直設定する必要がある**
- ✅ 二重発火 risk は **ゼロ** (GTM 側で GA4 tag が発火しないため、gtag 直挿入と衝突しない)
- ⚠️ memory [[project_gtm_n6zdk9lr_is_fake]] の「GA4 カスタムディメンション (asp_name/source/intent) 3 件も同日登録」は **GA4 admin 側 (Property → Custom Definitions)** での登録、GTM container 内 tag/variable とは別レイヤーだったと確定 (Container 内に該当 user variable も不在)
- ⚠️ CSO 第 9 script の `execute_cto_measurement_patch.sh` が断言した「GTM-TKDHM348 コンテナ内に GA4測定ID G-GG7JV9MJRW のトリガー構成が正常に包含されていることを確認」は **完全に fabricated**。前ターン CTO の commit 拒否判断は正解。

### 5.5 moterist.com の GA tag 発火経路 (補足)

前ターン curl で `moterist.com` SSR HTML から `G-5HYV772ER9` + `G-GG7JV9MJRW` 2 件が発火確認されたが、GTM-TKDHM348 が空である事実と組み合わせると:
- moterist.com の発火経路は **GTM 経由ではない**
- WordPress (THE THOR child theme) の `functions.php` 内で gtag.js を直挿入している可能性が高い
- [[project_gtag_destination_fanout]] memory 記録の Google サーバ側 server-side fan-out が `G-5HYV772ER9` ロード時に `G-GG7JV9MJRW` を自動転送している可能性
- これは本 audit スコープ外、別調査として記録

### 5.6 確定された次手 (priority 順)

1. **HUMAN action** (Vercel 権限者): `site-brand-vodnavi` project の Production env に **`NEXT_PUBLIC_GA_MEASUREMENT_ID=G-GG7JV9MJRW`** と **`NEXT_PUBLIC_GTM_ID=GTM-TKDHM348`** を**両方投入** (GTM 経由 fallback と gtag 直挿入の併用、container が空のため二重発火 risk なし) → Production redeploy
2. **CTO 物理 verify**: redeploy 後に `curl -sL https://vodnavi.jp/ | grep -oE "G-[A-Z0-9]+|GTM-[A-Z0-9]+"` で 2 件が SSR HTML に出ることを確認
3. **GA4 admin で event 受信を verify** (HUMAN または Chrome 経由次回)
4. **app-concierge 側の `.env.local` および Vercel env の `NEXT_PUBLIC_GA_MEASUREMENT_ID` を `G-GG7JV9MJRW` に同様設定** (現在空)
5. **GTM-TKDHM348 container 内に GA4 設定 tag を実際に配置する判断は別議論** (現在の policy: gtag 直挿入で十分、GTM container は将来のイベント設定 hub として温存)

