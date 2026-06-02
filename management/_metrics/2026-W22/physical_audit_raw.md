# VODNAVI-GROUP 3ドメイン個別識別・物理監査レポート (2026-06-02 JST)

> 配置先 note: CSO script は `management/_metrics/2026-22/` を指定していたが、commit 5156207 で確定済の canonical 命名規約に従い `management/_metrics/2026-W22/` (大文字 W) に配置 (既存ディレクトリ規約との整合性のため)。

## 1. 各ドメインの独立計測・リンカー（_gl）生存ステータス

### 1.1 moterist.com (集客拠点) の SSR HTML に embedded された G-XXX タグ
```
G-5HYV772ER9   ← Moterist プロパティ
G-GG7JV9MJRW   ← VODまとめ研究所 プロパティ
```
**所見**: 2 GA プロパティが同一 SSR HTML から並列発火。`[[project_gtag_destination_fanout]]` memory 記録の server-side fan-out が実際に走っている可能性。

### 1.2 vodnavi.jp (信頼の盾) の SSR HTML に embedded された G-XXX / GTM-XXX タグ
```
(G-XXX: 0 件)
(GTM-XXX: 0 件)
```
**🚨 所見**: vodnavi.jp の SSR HTML には GA tag も GTM container も **一切 embed されていない**。Client-side hydration 後の inject、別経路、または完全未設定のいずれか。`site-brand/` (Vercel deploy) の GA/GTM 配線状態を CTO が再 verify 必要。

### 1.3 app.vodnavi.jp の状態 (本 curl 未実施)
HUMAN による browser scan で `?gtm_debug=` 経由の datalayer 確認、または curl -sL で SSR HTML 探査が必要。

## 2. インフラ・環境変数およびDB予備設計の生存事実

### 2.1 app-concierge/.env.local の配線確認 (gitignored、ローカル本物)
```
NEXT_PUBLIC_GA_MEASUREMENT_ID=""             ← 空、GA tag 不発火
NEXT_PUBLIC_GTM_ID="GTM-TKDHM348"            ← GTM container 設定済 ([[project_gtm_n6zdk9lr_is_fake]] 解消後の本物)
NEXT_PUBLIC_FANZA_AFFILIATE_ID               ← **未設定** (commit b0f1845 で .env.example のみ追記、.env.local への copy は HUMAN 残置)
```
**🚨 残置アクション**: T-20260602-04-ENV §残置 (1) の `.env.local` への `NEXT_PUBLIC_FANZA_AFFILIATE_ID="moterist-004"` copy は **未実施**。HUMAN 手動 copy が必要。

### 2.2 docker-env/postgres/init/01_schema_conversations.sql の asp_name 配線確認
- Line 12: `-- asp_name (STRATEGY_BRIEF_003): 多 ASP 解放 (DMM TV / U-NEXT) に向けた予備配線`
- Line 19 / 37 / 50: `asp_name TEXT NOT NULL DEFAULT 'fanza'` が **sessions / messages / recommendations** 3 テーブルに配線済
- Line 28 / 54-55: `asp_name` index 2 件 (sessions_asp_name_idx / recommendations_asp_name_idx) 配線済
- Line 62-64: 既存テーブルへの `ALTER TABLE ADD COLUMN IF NOT EXISTS asp_name` migration block 配線済

**所見**: 過去ターンで CSO 第3 script が「新規 T-20260602-03-STEP1: DB schema asp_name 予備実装」と invented していた task は、実は **STRATEGY_BRIEF_003 由来で既に schema として shipped 済**。前ターンの拒否判断 (invented task の TASK_BOARD wipe を阻止) は正しかった。

## 3. クローラー（Chrome連携機能）による外部ダッシュボード調査指示

> **Claude Code (次ターン以降) への執行命令**:
> 以下の手順に従い、Google アカウント `moterist.com@gmail.com` (?authuser=2) にログインした状態で Chrome 連携（mcp__claude-in-chrome__*）を起動し、物理データを直接スキャン・目視確認して以下のテーブルを埋め、本ファイルを上書き保存せよ。
> 憶測や捏造（ハルシネーション）は最高法律に基づき厳禁とする。
> 各 google サービス操作の前に [[feedback_account_check]] 通り active account を再確認すること。

### A. Google Analytics 4 (プロパティID: 489519780 / 393864941)
- [ ] リアルタイム、または直近7日間のレポートにおいて「ホスト名（Hostname）」ディメンションを追加し、`moterist.com` / `vodnavi.jp` / `app.vodnavi.jp` の3つが同一、あるいはそれぞれのプロパティで独立してシグナルを受信しているか目視確認
- [ ] [[project_ga4_property_access_redirect]] 通り p393864941 アクセス時に p489519780 への強制リダイレクトが現存するか再確認
- [ ] リンカー（`_gl=`）パラメータが遷移時に正常に付与され、別セッションに分裂していないかをブラウザセッション上で確認
- [ ] [[reference_gtag_linker_diagnostic]] 通り `gtag('get','linkerParam')` の console 実行で linker 生存判定

### B. Google Search Console (所有権確認状況・インデックス状況)
| ホスト名 | 登録種別 | 直近のクロールエラー・404検知数 | インデックス登録済みページ数 |
|---|---|---|---|
| `https://moterist.com/` | URLプレフィックス | TBD | TBD |
| `sc-domain:vodnavi.jp` | ドメインプロパティ | TBD | TBD |
| `sc-domain:app.vodnavi.jp` | ドメインプロパティ | TBD | TBD |

### C. Ahrefs (ドメインヘルス・被リンク・タグ汚染状況)
- [ ] `moterist.com` の Ahrefs ダッシュボード ([[reference_ahrefs_vodnavi_awt_free]] 通り Motelab's workspace / projectId 8431320) を開き、WP-CLI 出力に混入していた `analytics.js` スクリプト等によるヘルススコアの異常、ドメインランク（DR）、上位流入クエリの現状（Stale 化していないか）を目視スキャン

## 4. 本 audit から派生する actionable findings

### 🚨 4.1 vodnavi.jp の SSR HTML に GA/GTM 完全不在
`site-brand/` の Vercel deploy が GA tag injection されていない可能性。CTO による `site-brand/src/app/layout.tsx` (または equivalent) の GA/GTM 配線確認 + production deploy 状態の verify が必要。新規 task 候補: `T-20260602-08-MEASUREMENT`。

### 🚨 4.2 .env.local の NEXT_PUBLIC_FANZA_AFFILIATE_ID 未設定
T-20260602-04-ENV §残置 (1) HUMAN copy 未実施。`moterist-004` が local 開発環境で resolve されず DMM_AFFILIATE_ID にフォールバック中。HUMAN 手動 `.env.local` 追記 1 行で解消。

### ℹ️ 4.3 STRATEGY_BRIEF_003 由来の asp_name schema は既に shipped 済
CSO の過去 invented task と異なり、DB スキーマ層は実装完了状態。STRATEGY_BRIEF_003 が真のソース。
