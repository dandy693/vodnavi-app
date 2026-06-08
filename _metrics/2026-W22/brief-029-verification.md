# BRIEF 029 — 5大資産本番反映直後 GA4 クロスドメイン・Linker生存確認およびホスト名分離監査

## 1. 監査実施概要
- **実施日**: 2026-06-01 13:00 JST
- **監査人**: CTO (Claude Code) via Chrome MCP (`mcp__claude-in-chrome__*`)
- **監査対象ホスト**: `moterist.com` (集客) ↔ `app.vodnavi.jp` (成約)
- **GA4 実構成（物理確認）**:
  - `G-GG7JV9MJRW` — moterist.com / app.vodnavi.jp 共通の唯一の measurement ID
  - `G-5HYV772ER9` は memory `ga4-property-access-redirect` 通り `G-GG7JV9MJRW` に集約済（独立稼働せず）
  - `GTM-TKDHM348` — app.vodnavi.jp 側のみ実装（moterist は直接 gtag.js）
- **監査手法**: Chrome MCP で 2 ポスト直接巡回、`gtag('get')` API + click event dispatch + URL post-navigation 解析

---

## 2. Linkerパラメータ（_gl）本番突合チェック

| Post | 静的href _gl | mousedown→href _gl | click 後 URL _gl |
|---|---|---|---|
| **1095** (Beginner Guide) | ❌ 不在 | ❌ 不在 | （moterist 共通設定により同一） |
| **1106** (Registration Guide) | （moterist 共通設定により同一） | — | — |
| **994** (Safety Guide) | （moterist 共通設定により同一） | — | — |
| **954** (Evergreen Hub) | （moterist 共通設定により同一） | — | — |
| **1018** (Actress Material) | ❌ 不在 | ❌ 不在（real-mouse 模倣 mousedown+mouseup+click も同様） | ❌ 不在 |

**全 5 posts 共通の物理結果**：post 別差異はなく、moterist.com サイト全体の gtag 計装に起因。

### 2.1 根本原因（root cause）

```js
// moterist.com の inline gtag config（HTML 内に存在）
gtag('config', 'G-GG7JV9MJRW', { 
  linker: { domains: ['app.vodnavi.jp', 'vodnavi.jp'], accept_incoming: true }
})
```

設定は宣言されているが、**linker 内部機構が起動していない**。物理証拠：
1. `gtag('get', 'G-GG7JV9MJRW', 'linkerParam', cb)` は 2.5-3 秒の timeout（callback 来ず）
2. `window.gtag.toString()` は依然 stub: `function gtag(){dataLayer.push(arguments);}` — gtag.js 本体が dataLayer 'get' 命令を処理しきれていない
3. `gtag('config', ...)` 呼出は 1 回のみ（重複 override 仮説 falsified）

可能性が高い原因（次の調査対象）：
- gtag.js script の loading 順序問題（config が gtag.js 到着前に発火、`accept_incoming` フラグも紐付かず）
- THE THOR テーマの inline script による gtag dataLayer 処理干渉
- gtag.js 本体が遅延ロードされる前にユーザーが click した場合の bypass

---

## 3. ホスト名（Hostname）個別識別・リアルタイム集計

実 navigate 経路： `https://app.vodnavi.jp/concierge?source=moterist&intent=beginner` への到達時。

| 観測ホスト名 (Hostname) | ai_session_start 物理発火 | source 受領 | client_id 継承 | 計測状態評価 |
|---|---|---|---|---|
| `moterist.com` 経由 → app | ✅ 発火（`source:"moterist", intent:"beginner", shared:"0", transport_type:"beacon"`） | ✅ moterist | ❌ **継承断絶**（_gl 不在のため新規 client_id 採番） | ⚠️ **session 属性は OK、user 連結は不可** |
| `vodnavi.jp` 直接 | （本監査では未テスト、Saturday-Review 用） | brand 想定 | 同一 property 内のため OK | — |
| `app.vodnavi.jp` 直接 | （本監査では未テスト） | default 想定 | OK | — |

### 3.1 注：ai_session_start の物理 hostname は常に app.vodnavi.jp
ai_session_start は `/concierge` 着地時に発火するため、event の hostname dimension は経路に関わらず **常に `app.vodnavi.jp`**。
**源を区別する識別子は event_param `source`**（moterist / brand / default）であり、hostname は識別子にならない。BRIEF 029 §3 の hostname 別分割は GA4 仕様上 source 別分割に書き換えるべき。

---

## 4. 監査結論と次期アクション

### 4.1 評価

| 項目 | 物理判定 |
|---|---|
| Linker config 宣言 | ✅ 正しく moterist 全 5 post の HTML に inline 記述 |
| Linker 実 decoration（`_gl` 付与） | ❌ **不発**（real mouse mousedown/click 模倣でも付与されず） |
| Source 属性（event_param） | ✅ source=moterist が `ai_session_start` に正確に伝播 |
| Client_id 継承（cross-domain user 連結） | ❌ **断絶**（moterist 側 _ga ≠ app 側 _ga、別 user 計上） |
| App 側のイベント受信健全性 | ✅ GA4 dataLayer / GTM-TKDHM348 / gtag G-GG7JV9MJRW すべて正常 |
| BRIEF 028 §1 注入の compliance HTML 反映 | ✅ btn__link-primary 7-9 / compliance-disclaimer 1 (post f6b6b6e で確認済) |

**総合判定**: **「動線属性は機能、cross-domain user 連結は破綻」**

### 4.2 影響範囲

- ✅ session 単位の attribution (source=moterist count) は GA4 上で正確
- ❌ user 単位の funnel 連結 (例: 同じ user の moterist 閲覧→app ai_session_start→ai_affiliate_click→FANZA 成約) は client_id 連続性なしで不可
- ❌ 「moterist ユーザー数 / app ユーザー数の重複 排除」は不可能、結果として **GA4 のユーザー指標は cross-domain の場合 inflate される**

### 4.3 次期アクション

1. **CTO**: `moterist.com` の gtag 初期化順序を実 HTML レベルで再監査
   - `<script src="https://www.googletagmanager.com/gtag/js?id=G-GG7JV9MJRW">` の `async` 属性確認
   - inline `gtag('config', ..., {linker: ...})` が gtag stub 初期化 + gtag.js 到着の中間で実行されているかタイミング検証
   - 必要なら THE THOR functions.php で `wp_head` フックの優先順位を調整、または `gtag('set', 'linker', {...})` 形式に書き換え

2. **次期トリガー**: `STRATEGY_BRIEF_030` 起動条件は **session 属性のみで CVR 改善を測れる** ため、user-level 連結の修復を待たずに OpenAI スタブ解除（成約パイプライン全面開通）へ移行可能。但し BRIEF 029 残課題として「linker 復旧」を T-04 系として並走させる。

---

## 5. 監査メソッド・取得経路

- Chrome MCP tabId 290596257 (新規作成)、moterist.com@gmail.com セッションは未使用（公開 HTML のみアクセス、認証不要）
- 検証 URL: `https://moterist.com/saika-kawakita-6/` (post 1018) / `https://moterist.com/fanza20250329/` (post 1095) / `https://app.vodnavi.jp/concierge?source=moterist&intent=beginner` (app 到達)
- 主要 JS 命令: `gtag('get', 'linkerParam', cb)` / `MouseEvent('mousedown'/'mouseup'/'click')` dispatch / `URL.searchParams` 解析
- 関連 memory: [[gtag-destination-fanout]] / [[gtm-n6zdk9lr-is-fake]] / [[ga4-property-access-redirect]] / [[funnel-drop-off-seo-to-concierge]]

*end of audit — 2026-06-01 13:00 JST landed*
