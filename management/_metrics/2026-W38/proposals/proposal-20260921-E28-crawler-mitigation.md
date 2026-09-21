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
