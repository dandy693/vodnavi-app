# E28 起案 — クローラ対策（Vercel Firewall ルール 2 本 ＋ robots.txt の PerplexityBot Disallow）

- **起案**: CTO・2026-09-21 09:1x JST（CSO 判定 2026-09-21・`access-20260921.md` 第1報への回答「起案（実装は CSO 承認後・別束）」）
- **【厳守】本書は設計と変更量の報告である。実装は CSO 承認後。CTO は Challenge／Deny・閾値・実施日を決めない（§6 に要裁定として列挙）。**
- **読み取りのみで作成**（Firewall 設定・robots.ts・コードはいずれも変更していない）。

---

## 0. CSO 指示（転記）

> Vercel Firewall で PerplexityBot を Challenge または Deny、/concierge への非ブラウザ UA アクセスを Rate Limit。robots.txt に PerplexityBot の Disallow を併記。Googlebot・bingbot は触らない。効果測定: served:500 日次と Firewall Allowed 件数の前後比較（7 日）。設計と変更量を報告。

## 1. 現状（実測・2026-09-21）

| 項目 | 実測 | 出典 |
|---|---|---|
| Vercel Firewall（Past Day＝9/20 08:47〜9/21 08:47 JST） | Allowed **151.8k**／Denied 398（DDoS Mitigation）／**Custom Rules 0**／Bot Protection **Inactive**／BotID **No Data** | `access-20260921.md` §6-2 |
| Top User-Agents（同 24h） | **PerplexityBot 88.8k（58.5%）**／bingbot 14.9k／Chrome (X11; Linux aarch64) 5.1k／Amazonbot 4.7k／AteveSearchSourceUrlDiscovery 4.7k | 同上 |
| Top Request Paths（同 24h） | **`/concierge` 40.0k**／`/` 1.1k／`/sale` 730／`/robots.txt` 208 | 同上 |
| Top AS / IPs | Amazon.com 93.5k／Microsoft 15.0k／Oracle 9.8k。IP 上位は `18.97.9.96〜101`（各 11.0〜11.6k） | 同上 |
| `served:500`（GUARD 行・上流 400 起因） | 9/12〜9/21 08:4x＝**7,882 行**（9/14〜9/20 の 7 日＝**6,462 行**） | `access-20260921.md` §6-1 |
| Firewall 設定 API | `get_firewall_config(active)` → **404 "Seawall Config not found"**＝カスタム設定は未作成 | MCP 実測 09:0x |
| **robots.txt の現状** | **`PerplexityBot` を__明示 Allow__している**（`app-concierge/src/app/robots.ts` の `aiCrawlers` ＝ GPTBot / OAI-SearchBot / **PerplexityBot** / ClaudeBot / Google-Extended・コメント原文「主要 AI 検索クローラーを明示的に許可し、LLMO の引用対象として意図を宣言する」・`23669e9` 2026-06-21 で AI クローラー明示 allow・§7） | コード実測 |
| Bot Category 別（8/6 実測・§6） | `/concierge` 24h 16,017 件の 98.9% がボット分類付与（ai_crawler 39.3%／SEO 28.7%／browser_impersonation 26.8%） | §6 |

- **【停止して報告・矛盾の候補】CSO 指示「robots.txt に PerplexityBot の Disallow」は、現行コードの「PerplexityBot を明示 Allow（LLMO 方針）」と逆向きである。** 台帳に LLMO 方針の裁定記録は見当たらず（コードコメントと `23669e9` のみ）。**Disallow へ転じることの採否は要裁定（§6 ③）。** CTO は決めない。

## 2. 設計

### 2-1. Firewall ルール 1 — PerplexityBot の Challenge／Deny

| 項目 | 設計 |
|---|---|
| 条件 | `user_agent` **`sub`（部分一致）** `"PerplexityBot"`（Vercel WAF の条件型 `user_agent`）。**代替＝`bot_name eq perplexitybot`**（Vercel 側のボット名の実表記は未確認＝実装時に Dashboard の候補で確認） |
| 除外 | Googlebot・bingbot は条件に含めない（UA 文字列が異なるため本ルールには当たらない） |
| アクション | **案 A: `challenge`**／**案 B: `deny`**（要裁定 §6 ①） |
| 併記 | `challenge` は JS を実行できないクライアントを通さない＝クローラに対しては deny と実質同じ結果。`deny` は 403 を返す（明示的）。**どちらも Firewall の「Denied／Challenged」に計上され「Allowed」から外れる**（§4 の計測系の変化） |
| 影響範囲 | 全パス（PerplexityBot は `/concierge` 以外も巡回しうる）。**PerplexityBot 由来の索引・引用が止まる**（LLMO 方針との衝突＝§1） |

### 2-2. Firewall ルール 2 — `/concierge` への非ブラウザ UA の Rate Limit

| 項目 | 設計 |
|---|---|
| 条件（AND） | ① `path` **`pre`** `/concierge`（`/concierge` と `/concierge/*`・`/api/concierge` は含まない）② **非ブラウザ UA**＝次のいずれか（OR）: (a) `user_agent` `re` `(?i)bot|crawler|spider|curl|python|scrapy|httpclient|java/|go-http|wget` (b) `user_agent` **`nsub`** `"Mozilla/5.0 ("`（一般ブラウザの UA は `Mozilla/5.0 (` で始まる）③ 除外: `user_agent` `nsub "Googlebot"` ∧ `nsub "bingbot"`（CSO「触らない」） |
| アクション | `rate_limit`＝`{ algo: "fixed_window", window: 60, limit: N, keys: ["ip"] }`・超過時 `deny` |
| **N（要裁定 §6 ②）** | **候補 60/分/IP**（1 req/s）: 24h の `/concierge` 40.0k ≒ 27.8 req/分（全 IP 合算）・上位 IP `18.97.9.x` は各 11k/日 ≒ **7.6 req/分**＝**60/分では上位 IP にも当たらない**（実測から）。**候補 10/分/IP**: 上位 IP の 7.6 req/分は当たらない・バースト時のみ当たる。**候補 5/分/IP**: 上位 IP に当たる。**どの値が「非ブラウザ」の実アクセス分布に対して効くかは、IP 別の分単位分布を取っていないため本書では判定できない**（Firewall 画面は 24h 合計のみ） |
| 併記 | (b) の条件は **UA を偽装するボット（browser_impersonation・8/6 実測で 26.8%）を通す**。PerplexityBot の UA は `Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; …)` で `Mozilla/5.0 (` を含まないため (a)(b) 両方に当たる（ルール 1 が先に当たる） |
| ルールの評価順 | Vercel WAF はルールを上から順に評価する。**ルール 1（PerplexityBot）→ ルール 2（rate limit）の順に置く** |

### 2-3. robots.txt — PerplexityBot の Disallow（**採否は要裁定 §6 ③**）

| 項目 | 設計 |
|---|---|
| ファイル | `app-concierge/src/app/robots.ts` |
| 変更 | `aiCrawlers` から `"PerplexityBot"` を外し、`rules` に `{ userAgent: "PerplexityBot", disallow: "/" }` を追加。コメントを更新（LLMO 方針の例外を明記） |
| 出力 | `User-agent: PerplexityBot` / `Disallow: /` の 1 グループが加わる（他の AI クローラー 4 種の Allow と `*` の baseRule は不変） |
| 併記 | robots.txt は__要請__であり、遵守するかはクローラ側の実装による。**強制はルール 1 が担う。**両方を入れる意味は「遮断（Firewall）」と「宣言（robots）」を揃えること。**外部の一般論（PerplexityBot が robots.txt を遵守するか）は当サイトで未検証**（§15-2 軸4）。**`/robots.txt` は 24h に 208 回取得されている**（§1）＝反映は取得のたび |
| デプロイ | `app-concierge/` 配下の差分＝**1 ビルド（READY）→ sitemap 再生成（articles `lastmod` が動く・§16-5(1)）**。観測窓（X・9/15〜10/12・§26-2）は sitemap に依存しないが、交絡として記録する |

### 2-4. 実施経路（要裁定 §6 ④）

| 経路 | 内容 | 併記 |
|---|---|---|
| **(i) Vercel Dashboard** | Firewall > Rules で 2 本を作成（CSO ログイン済みセッションを CTO が操作・Make の編集と同型・§13-6-8 のとおり操作ログは所有者名で残る） | 画面で条件・アクションを目視できる。**本日は Dashboard の重い画面（Traffic の Query Builder）で拡張がタイムアウトした**（§10 手順 5）＝Rules 画面でも同じ可能性 |
| **(ii) MCP `put_firewall_config`** | JSON で `firewallEnabled: true` ＋ `rules[2]` を送る | **全置換**（`get` が 404＝未作成のため置換される既存設定は無い）。**送信前に JSON を台帳へ保存し、送信後に `get_firewall_config(active)` で読み戻す**（§10） |

## 3. 変更量

| 対象 | 変更 | デプロイ | テスト |
|---|---|---|---|
| Vercel Firewall | **カスタムルール 2 本の新規作成**（コード変更なし・デプロイなし・即時反映） | なし | 反映の読み戻し＝`get_firewall_config(active)`／Firewall 画面 Rules 一覧／PerplexityBot UA での `curl`（`-A "…PerplexityBot/1.0…"`・1 回・**403 or challenge 応答の確認**） |
| `app-concierge/src/app/robots.ts` | **1 ファイル・+4 行／−1 行程度**（`aiCrawlers` から 1 語除去・rules に 1 要素追加・コメント 2 行） | **1 ビルド**（READY・sitemap 再生成） | `npx tsc --noEmit`／本番 `curl /robots.txt` の目視（`User-agent: PerplexityBot` + `Disallow: /`）。robots.ts の単体テストは無い（実測） |
| 台帳 | ROUTINE §1 に「効果測定（7 日）」1 行・FACT §29 に実施記録 | — | — |
| **合計** | **設定 2 本＋コード 1 ファイル（数行）＋台帳** | **1 ビルド**（robots を採る場合のみ） | — |

## 4. 効果測定（CSO 指定＝served:500 日次 と Firewall Allowed 件数の前後 7 日）

| 指標 | 取得手段 | 前（7 日）の取得可否 | 後（7 日） |
|---|---|---|---|
| **served:500 日次**（GUARD 行数） | Runtime Logs MCP `group_by=statusCode`・query `"served":500`・JST 日 | **可**——本日実測で 9 日前（9/12）まで集計が返った。**実施日 T に対し T−7〜T−1 を T 当日に取得すれば揃う**（保持期間は未確認・「9 日は返った」が実測） | 毎日 1 回（06:00 の束2 ループに同梱可） |
| **Firewall Allowed 件数** | Firewall 画面 Past Day（**24h のみ・遡及不可**） | **不可（遡及できない）**——前 7 日を揃えるには__実施の 7 日前から毎日同時刻に読む__必要がある。**代替＝Runtime Logs の日次総行数（`group_by=statusCode`・query なし）を「リクエスト量の代理」として遡及取得**（ログ行数≠リクエスト数・§7 の但し書き） | 毎日同時刻に Past Day を読む |
| 併記 | **`served:500` の発生は上流 FANZA API の 400 に起因し、ボット負荷が主因かは未判定**（§24-12(A-1)＝自前負荷起因は不支持・外部負荷起因は未判定）。**前後比較は「変化したか」を測るものであり、因果の判定ではない** | | |

**本日時点のベースライン（前窓の材料）**: `served:500` 9/14〜9/20＝1,019／965／962／207／791／1,293／1,225（計 6,462）／Firewall Allowed（9/20 08:47〜9/21 08:47）151.8k・PerplexityBot 88.8k・`/concierge` 40.0k。

## 5. リスク・併記（判断しない）

1. **LLMO 方針との衝突**（§1）——PerplexityBot 由来の索引・引用が止まる。他の AI クローラー（GPTBot／OAI-SearchBot／ClaudeBot／Google-Extended・24h 上位 5 に Amazonbot 4.7k）は本起案の対象外。
2. **計測系の変化**——Challenge／Deny により Firewall の「Allowed」が減り「Denied／Challenged」が増える。**§6（Vercel リクエスト数を人間指標にしない）は不変。**
3. **ルール 2 の取りこぼし**——UA 偽装（`Mozilla/5.0 (` を名乗る）ボットは (b) を通る。8/6 実測の browser_impersonation 26.8% 相当。
4. **誤検知**——(a) の正規表現は `bot` を含む UA をすべて対象にする（`Googlebot`／`bingbot` は除外条件で外す）。**除外漏れが無いかは実装時に Vercel の `bot_name` 一覧で確認する。**
5. **Rate Limit の可用性**——画面に「Rate Limited」列があり Pro プランで利用可の表示。**上限（ルール数・窓）は Vercel の公開情報で実装時に確認**（本書では未確認）。
6. **`put_firewall_config` は全置換**——(ii) を採る場合、送信 JSON を台帳に保存し読み戻す。
7. **`served:500` の削減はルール 1・2 の直接の目的ではない**——GUARD は上流 400 の応答であり、ボット由来の `cache=MISS` リクエストが減れば行数が減る__可能性__があるが、因果は測定で確かめる（§4）。

## 6. 要裁定（CTO は決めない）

| # | 項目 | 選択肢 |
|---|---|---|
| ① | ルール 1 のアクション | `challenge`／`deny` |
| ② | ルール 2 の閾値 N（/分/IP） | 60／10／5（§2-2 の算術） |
| ③ | robots.txt の PerplexityBot Disallow | 実施（LLMO 明示 Allow の撤回）／見送り（Firewall のみ） |
| ④ | 実施経路 | (i) Dashboard／(ii) MCP `put_firewall_config` |
| ⑤ | 実施日と測定窓 | T（実施）・前窓 T−7〜T−1（served:500 は遡及可・Allowed は代理指標か毎日読み） |
| ⑥ | ルール 2 の対象パスに `/api/concierge` を含めるか | 含める／含めない（本書は含めない） |

---

## 7. 【CSO 裁定 2026-09-21・6 点】と実施設計の確定

| # | 裁定 | 実施設計への反映 |
|---|---|---|
| ① | **PerplexityBot は Deny／Challenge を採らない。`rate_limit`（60 秒窓・IP キー・閾値 30/分）。LLMO 方針（robots.ts の明示 Allow・`23669e9`）は維持。7 日後に Allowed が 20k/日を下回らなければ Challenge へ格上げを再裁定** | ルール 1＝`user_agent sub "PerplexityBot"` → `rate_limit { algo: fixed_window, window: 60, limit: 30, keys: ["ip"], action: deny }` |
| ② | **`/concierge` の非ブラウザ UA → `deny`。Googlebot・bingbot はページ本体（`/concierge`）のみ除外して許可。`/api/concierge` は Googlebot・bingbot を含む全非ブラウザ UA を deny** | ルール 2＝条件グループ 4 本（OR）→ `deny`（§7-1） |
| ③ | **robots.ts は変更しない**（ビルド・sitemap 再生成の交絡を避ける／LLMO 方針の反転をしない） | コード変更 0 |
| ④ | **CTO が MCP `put_firewall_config` で実施**（現行設定が未作成＝全置換の上書きリスクなし）。実施後 `get_firewall_config` で読み戻し、ルール 2 本の定義を報告 | 送信 JSON＝`e28-firewall-config.json`（本書と同じ棚） |
| ⑤ | **実施日 2026-09-22（火）06:30 以降・朝の抽出が終わってから。前窓＝served:500 9/14〜9/20（6,462 行）・後窓＝9/22〜9/28。Firewall Allowed は実施日から毎日 Past Day を記録。Runtime Logs 行数は代理指標として併記** | ROUTINE §1 に測定 1 行（実施時に追記） |
| ⑥ | ①は 30/分。②は deny のため閾値なし | — |

### 7-1. 送信 JSON の要点（全文＝`e28-firewall-config.json`）

- ルール 1: `conditionGroup=[{ user_agent sub "PerplexityBot" }]` → `rate_limit(fixed_window, 60s, 30, keys=[ip], 超過=deny)`。
- ルール 2: `conditionGroup` 4 グループ（**配列要素は OR・要素内の条件は AND**＝Vercel WAF の仕様）→ `deny`。
  - G1: `path pre /concierge` ∧ `user_agent re (?i)bot|crawler|spider|curl|python|scrapy|httpclient|java/|go-http|wget` ∧ `nsub Googlebot` ∧ `nsub bingbot` ∧ `nsub vodnavi-affiliate-guard`
  - G2: `path pre /concierge` ∧ `user_agent nsub "Mozilla/5.0 ("` ∧ `nsub Googlebot` ∧ `nsub bingbot` ∧ `nsub vodnavi-affiliate-guard`
  - G3: `path pre /api/concierge` ∧ `user_agent re (?i)bot|…`
  - G4: `path pre /api/concierge` ∧ `user_agent nsub "Mozilla/5.0 ("`
- `path pre "/concierge"` は `/concierge`・`/concierge/*` に一致し `/api/concierge` には一致しない（先頭一致）。
- **`vodnavi-affiliate-guard` の除外**＝GH Actions「Affiliate ID Guard (live)」が `/concierge` を UA `vodnavi-affiliate-guard/1.0` で取得する（`guard-affiliate-id.mjs:202`）。除外しないと live ジョブが毎回 403 で失敗する。

### 7-2. 追加の確認（read-only・CSO 指示）— `/concierge` の表示・`/api/concierge` へのアクセスは従量課金の呼び出しを起こすか

| 経路 | 上流呼び出し | 課金 | 根拠 |
|---|---|---|---|
| **GET `/concierge`（ページ表示）** | **Anthropic API: 呼ばない。** FANZA API: `?cids=` が付いた場合のみ `fetchItemList(cid)`（`src/app/concierge/page.tsx` `resolveCidsToWorks`）。チャットの送信はフォーム submit 時のみ（`sendMessage`・マウント時の自動送信なし＝`concierge-chat.tsx`） | **Anthropic 課金なし**。FANZA API は無償（レート制限あり）。**Vercel 関数実行（SSR）は発生する** | コード実測 |
| **POST `/api/concierge`** | `proxy.ts` が cookie `vodnavi_age_verified` 未通過を **403**（Anthropic に到達しない）→ 通過時のみ `streamText`（`@ai-sdk/anthropic`・**課金**） | **cookie 通過時のみ課金** | `src/proxy.ts:44-57`・`src/app/api/concierge/route.ts:125-` |

**9/20 08:47〜9/21 08:47 JST（Firewall の 24h 窓と同一）の実測（Vercel Runtime Logs・`group_by`・取得 09:3x）**:

| 項目 | 件数 |
|---|---|
| `/concierge` の関数実行（SSR） | **39,763**（`requestPath` 別: `/concierge` 39,763／`/api/concierge` 4。source 別: function 39,767／middleware 39,767） |
| `/api/concierge` に到達（statusCode 200） | **4** |
| うち Anthropic に到達（`[concierge] finish` ログ） | **4**——03:35:52Z／10:42:15Z／15:30:44Z／20:22:38Z・全件 `source=default intent=- seed_cid=- steps=1 input_tokens=4275`・output 86／98／131／209 |
| その 4 件の正体 | **GH Actions「API Health Check (FANZA + LLM)」の `llm.concierge` 検査**（cron 6 時間ごと・`healthcheck-api.mjs` が cookie 付きで「こんにちは」を POST）。**run 作成 03:35:41Z／10:42:04Z／15:30:33Z／20:22:25Z の各 +11〜13 秒に一致**（`gh run list`） |
| **→ ボット由来で課金対象（Anthropic）に到達した件数** | **0**（40.0k のうち 0 件。Anthropic への到達は自前の健全性検査 4 件のみ＝入力 4,275 トークン × 4／日） |
| cookie 未通過で proxy が 403 にした POST | Runtime Logs の `/api/concierge` は上記 4 件のみ＝この窓では観測されていない（middleware 単独の 403 が `group_by` に現れるかは未確認＝「未取得」） |

- **判定（CSO 条件「課金あり なら②を本日中に前倒し」）**: **Anthropic の従量課金はボット由来 0 件＝「課金あり」に該当しない。②の前倒しは行わず、裁定⑤どおり 9/22 06:30 以降に実施する。**
- **併記**: `/concierge` の 39,763 SSR は Vercel の関数実行（Pro プランの含有量に対する使用量）。**含有量に対する位置と超過課金の有無は Usage 画面が要る（未取得・Dashboard が拡張からタイムアウト）。** FANZA API 呼び出し（`?cids=` 付き）の件数は `requestPath` にクエリが含まれないため未取得。

### 7-3. 実施前に裁定を要する点（②の除外・**9/22 06:30 までに**）

| # | 事実 | 選択肢（CTO は決めない） |
|---|---|---|
| ① | **自前の GH Actions 2 本が非ブラウザ UA で叩く**——(a) `guard-affiliate-id.mjs`（UA `vodnavi-affiliate-guard/1.0`・GET `/concierge`）(b) `healthcheck-api.mjs`（**UA 指定なし＝node 既定・POST `/api/concierge`・cookie 付き**）。ルール 2 をそのまま入れると **(a) は §7-1 の除外で通るが、(b) は G3/G4 の deny に当たり `llm.concierge` 検査が 6 時間ごとに失敗する**（LLM 認証監視が失われ、失敗メールが続く） | **(i)** G3/G4 に `cookie vodnavi_age_verified ex`（cookie 保持なら対象外）を足す＝コード変更なし・proxy の 403 と同じ境界（cookie を持つスクリプトは通る＝現状と同じ）／**(ii)** `healthcheck-api.mjs` に UA `vodnavi-healthcheck/1.0` を付けてルールで除外＝**`app-concierge/scripts/` の変更＝1 ビルド・sitemap 再生成**（裁定③が避けた交絡）／**(iii)** `llm.concierge` 検査の失敗を受容（監視を失う） |
| ② | **Google の URL 検査は UA `Google-InspectionTool`**（`Googlebot` を含まない）。裁定②の除外（Googlebot・bingbot）のままだと `/concierge` の URL 検査が 403 になる | 除外に `Google-InspectionTool` を加える／加えない |
| ③ | ルール 1（rate_limit）は Vercel Pro で利用可の表示（画面「Rate Limited」列）。**ルール数・窓の上限は未確認**＝送信時の応答（`validationErrors`）で確定 | — |

### 7-4. 効果測定の前窓（確定値）

| 指標 | 前窓 |
|---|---|
| `served:500`（GUARD 行数） | 9/14〜9/20＝1,019／965／962／207／791／1,293／1,225（**計 6,462**） |
| Firewall Allowed（Past Day） | 9/20 08:47〜9/21 08:47＝**151.8k**（1 点のみ・実施日から毎日記録） |
| Runtime Logs 行数（代理） | `/concierge` 関数実行 39,763／24h（同窓）。日別は実施時に `group_by` で 9 日遡及して取得 |
| 再裁定（裁定①） | **7 日後（9/29）に Allowed が 20k/日を下回らなければ Challenge へ格上げを再裁定** |

### 7-5. 【CSO 裁定 2026-09-21・実施前の 2 点】

| # | 裁定 | 反映 |
|---|---|---|
| 1 | **healthcheck の UA を固定文字列 `vodnavi-healthcheck/1` に変更し、ルール 2 に `user_agent eq その文字列 → 除外` を追加。IP 除外は採らない（Vercel 側の IP が変わる）。コード 1 行・1 ビルド（sitemap 再生成の交絡は受容）。9/22 06:30 の実施はこのビルドが READY になった後。順序＝コード変更 push → READY 確認 → Firewall 適用 → 読み戻し → healthcheck 1 回実行で通過を確認** | `app-concierge/scripts/healthcheck-api.mjs`: `USER_AGENT = "vodnavi-healthcheck/1"` を定数化し `fetchText` の全リクエストに `user-agent` ヘッダとして付与（`init.headers` があればそちらを優先・cookie 等は不変）。JSON: G3・G4（`/api/concierge`）に `user_agent neq "vodnavi-healthcheck/1"` を追加（グループ内 AND のため「等しければ対象外」＝除外） |
| 2 | **`Google-InspectionTool` は Googlebot と同扱い＝`/concierge` ページ本体は許可・`/api/concierge` は deny。除外条件に追加** | JSON: G1・G2（`/concierge`）に `user_agent nsub "Google-InspectionTool"` を追加。G3・G4 には追加しない（`/api/concierge` は deny のまま） |

- 確定した送信 JSON → `e28-firewall-config.json`（ルール 2＝G1〜G4 の条件は上記のとおり）。
- **未回答の確認事項（再掲・§7-2）**: `/concierge` の表示は Anthropic に到達しない（`?cids=` 付きのみ FANZA API）。`/api/concierge` は cookie 通過時のみ Anthropic。**9/20 08:47〜9/21 08:47 の 40.0k のうち Anthropic に到達したのは 4 件＝すべて自前の healthcheck（ボット由来 0 件）。** 実施報告（9/22）にも同表を再掲する。

### 7-6. 【実施記録 2026-09-21 17:17〜17:21 JST】コード push → READY → sitemap 再生成の確認（順序の第 1〜2 段）

| 段 | 実測 |
|---|---|
| push | `c65d8e3`（`healthcheck-api.mjs` ＋ JSON ＋ 台帳）17:17:33 JST |
| デプロイ | **`dpl_6pDA1JrAXtYfYQmejb2kjp7uwkBV` READY**（作成 17:17:35・BUILDING 17:17:36・READY **17:18:40 JST**・build 1 分 4 秒）。`ignore-build` ログ＝`changes under /vercel/path0/app-concierge vs dbd29e7… -> build`（距離 1・`app-concierge/` 差分ありの正常経路） |
| sitemap | **`lastmod 2026-09-21T08:18:01.767Z`＝17:18:01 JST**（ビルド開始 +25 秒）。`<loc>` 2,594／works 1,200（videoa 400／anime 400／nikkatsu 400）／genres 200／actresses 1,177／articles 8＝**前回（06:35 生成）と同数・全損なし**（交絡＝articles の `lastmod` 更新のみ・CSO 受容済み） |
| **UA の着地確認（ローカル・本番と Anthropic には触れない）** | ローカル HTTP 受け口（127.0.0.1）に `HEALTHCHECK_BASE` を向けて `healthcheck-api.mjs` を 1 回実行 → **3 リクエストとも `user-agent: vodnavi-healthcheck/1`**（GET `/sitemap.xml`／GET `/`／POST `/api/concierge`＋`cookie: vodnavi_age_verified=1`）。**対照＝変更前（`dbd29e7` 版）は 3 件とも `user-agent: node`**（node の既定値＝`Mozilla/5.0 (` を含まないため旧 G4 で deny になる側だった） |
| 併記（記録のみ） | ローカル Windows（node v24.14.1）では `ALL PASS` 出力後の終了時に `Assertion failed: !(handle->flags & UV_HANDLE_CLOSING) src\win\async.c:76`・exit 127 が出る。**変更前の版でも同一に再現＝本変更とは無関係（環境由来）。GH Actions（ubuntu）では未観測。追わない** |

- **残る段（2026-09-22 06:30 以降・朝の抽出後）**: ③ `put_firewall_config`（`e28-firewall-config.json` から `_readme` を除いて送信）→ ④ `get_firewall_config(active)` 読み戻し → ⑤ healthcheck 1 回実行（本番・`gh workflow run api-healthcheck.yml` または `node app-concierge/scripts/healthcheck-api.mjs`）で `llm.concierge` PASS を確認 → 実施報告（§7-2 の課金回答を再掲）。
- **GH Actions の cron（0 */6 UTC＝JST 03:xx／09:xx／15:xx／21:xx）は次回から新 UA で走る**（checkout が `main` の最新を取るため）。Firewall 適用前は UA に関わらず通る。

### 7-7. 【実施記録 2026-09-22 08:55〜08:58 JST】③ Firewall 適用 → ④ 読み戻し → ⑤ healthcheck 1 回（順序の第 3〜5 段・朝の抽出後に実施）

| 段 | 実測 |
|---|---|
| 前提 | `c65d8e3` READY（9/21 17:18:40）済み・朝の抽出（08:1x〜08:5x）とリプ案／Q 案の生成後に着手（06:30 以降の条件を満たす） |
| 現行設定の確認 | `get_firewall_config(active)`（MCP）→ **404 `Seawall Config not found`**＝起案どおり未作成 |
| **MCP での適用は不可** | `put_firewall_config`（MCP）→ **404 `Seawall Config not found`**（全置換のはずが未作成 config に対しては 404）／`update_firewall_config`（MCP・`firewallEnabled`）→ 同じ 404。**→ Vercel CLI 54.0.0（ログイン済み・`vercel api`）で REST を直接叩く方式へ切替**（値の入力・再認証はしていない） |
| 初期化 | `PUT /v1/security/firewall/config`（`{"firewallEnabled":true}`）→ **version 1**（08:55:59 JST・`id waf_lzcN8K1PPQbs`・CRS は既定の全 inactive/log） |
| 起案 JSON の送信 | **400 `Invalid rule [E28-2 …]`**（PUT はアトミックのため未適用）。**原因 2 点**（いずれも API の実形との差・意味は不変）: ①「含まない」の op `nsub` は存在しない → `sub`＋`neg: true` ②正規表現の先頭 `(?i)` が不正 → `[Bb]ot|[Cc]rawler|…` の文字クラスで表現（**全大文字 `BOT` 等は対象外＝不一致を許容**）。**`neq`（healthcheck UA の除外）はそのまま有効** |
| 適用 | ルール 1 のみ PUT → **version 2**（08:56:40 JST）→ ルール 2 を `rules.insert`（PATCH）**→ 最初の試行の応答を grep で読み落として再送し、同一ルールが 2 本入った（version 3・4）** → `rules.remove` で重複 `…_vg9yYo` を削除（version 5）→ `rules.update` で regex を文字クラス形へ（**version 6・08:57:52 JST**） |
| **④ 読み戻し（`/v1/security/firewall/config/active`・08:57:5x JST）** | **version 6 / firewallEnabled true / rules 2**: **E28-1** `rule_e28_1_perplexity_bot_rate_limit_KydRrK`（active・`user_agent sub PerplexityBot` → `rate_limit fixed_window 60s limit 30 keys [ip] action deny`）／**E28-2** `rule_e28_2_concierge_non_browser_deny_KQwbUo`（active・deny・4 グループ＝`/concierge`×{非ブラウザ UA regex, `Mozilla/5.0 (` を含まない}×{Googlebot / bingbot / vodnavi-affiliate-guard / Google-InspectionTool を含まない}／`/api/concierge`×{同 regex, `Mozilla/5.0 (` を含まない}×`user_agent neq vodnavi-healthcheck/1`）。全文 → `e28-firewall-active-readback-20260922.json` |
| 挙動プローブ（08:58:16〜18 JST・7 リクエスト） | GET `/concierge`: `curl/8.4.0` **403（59 B）**／`python-requests` **403（59 B）**／Googlebot UA **200**／Chrome UA **200**。POST `/api/concierge`: Googlebot UA **403（93 B）**／`curl` **403（93 B）**（**Firewall の deny か `proxy.ts` の cookie 未通過 403 かは本プローブでは区別していない**——cookie 付きの検証は Anthropic 課金を伴うため行わない）。対照 GET `/works/videoa/miab00677`（curl UA）**200**＝ルールは `/concierge` 系に限定されている |
| **⑤ healthcheck** | `node app-concierge/scripts/healthcheck-api.mjs`（本番・UA `vodnavi-healthcheck/1`）**08:58:33〜08:58:38 JST → `fanza.sitemap works=1200` / `fanza.home grid` / `llm.concierge stream` すべて PASS・ALL PASS**＝ルール 2 の `neq` 除外が機能（Anthropic 到達 1 回＝定常の GH 検査と同じ） |
| 課金回答の再掲（§7-2） | 9/20 08:47〜9/21 08:47 JST の `/api/concierge` 到達 4 件はすべて GH Actions の healthcheck。**ボット由来で Anthropic 課金に到達した件数 0**。適用後は非ブラウザ UA が `/api/concierge` に到達しない（healthcheck UA を除く） |

- **効果測定**: 前窓＝`served:500` 9/14〜9/20（6,462 行）・後窓＝9/22〜9/28。**Firewall Allowed の Past Day は本日から毎日記録**（Firewall 画面は Chrome 連携でのみ取得＝夜の抽出時に初回を取る）。**9/29 に ① の格上げ（Challenge）を再裁定**（Allowed が 20k/日を下回らなければ）。
- **【併記・記録のみ】MCP の firewall 系ツールは未作成 config に対して使えない**（§10 の「ツールの戻り値」の型＝404 が「権限」ではなく「未作成」を意味していた）。**以後の変更は `vercel api` の PATCH（`rules.update` / `rules.remove`）か、config 作成済みのため MCP `update_firewall_config` でも可能になった**（未検証）。
