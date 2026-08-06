# VODNAVI_SILENT_DEATH_GUARD 調査 — 8/5 に集中したバースト、既に停止

- 実施: **2026-08-07 06:20 〜 06:50 JST**
- 取得元: `app-concierge/src/lib/fanza/client.ts` ほかコード実測 / git log / Vercel Runtime Errors・Runtime Logs / Vercel Firewall / GA4 p489519780
- **読み取りのみ。コード変更・設定変更は一切していない**
- **判断は加えず、事実のみ**
- Phase 1 で停止

---

## 0. 【最初に】バーストは既に止まっている

`get_runtime_errors` を期間別に取り、累積の差分をとった結果（基準時刻＝2026-08-07 06:20 JST）:

| 遡及期間 | GUARD の累積件数 | その区間で発生した件数 |
|---|---|---|
| 直近 **24時間** | **0** | **0** |
| 直近 2日 | 2,172 | 直近24hの1日前の1日間に **2,172** |
| 直近 3日 | 2,172 | その前の1日間は **0** |
| 直近 5日 | 2,454 | +282（2日間） |
| 直近 7日 | **2,684** | +230（2日間） |

- **最終発生 = 2026-08-05T19:01:27Z ＝ 2026-08-06 04:01:27 JST**。以後 **26時間以上ゼロ**
- **2,684件のうち 2,172件（81%）が 2026-08-05（UTC）の1日に集中**
- 6/21 以降ずっと連続していたのではなく、**断続的なバースト**

ログレベル別の件数（同一の集計手段・窓だけ変えたもの）:

| 窓 | info | error | warn |
|---|---|---|---|
| 8/5 09:30Z 〜 8/6 09:30Z（バーストを含む） | 25,698 | **1,548** | **1,395** |
| 8/6 21:25Z を末尾とする直近24h（バースト後） | 27,476 | **7** | **3** |

- info はほぼ同水準のまま、**error と warn だけが同時に3桁落ちている**

---

## 1. ガードの実装と挙動

### 1-1. 何を検知して発火するか

`src/lib/fanza/client.ts` L71-86（原文）:

```ts
function logFanzaSilentDeath(
  context: string,
  error: { message: string; status?: number },
): void {
  if (process.env.NODE_ENV !== "production") return;
  console.error(
    JSON.stringify({
      level: "high",
      tag: "VODNAVI_SILENT_DEATH_GUARD",
      context,
      status: error.status ?? null,
      message: error.message,
      ts: new Date().toISOString(),
    }),
  );
}
```

呼び出し箇所は3つ:

| 行 | context | 条件 |
|---|---|---|
| L118 | `getCredentials: DMM_API_ID/DMM_AFFILIATE_ID 未設定` | env 未設定 |
| **L224** | **`fetchItemList: HTTP エラー`** | **FANZA API が非 2xx を返した（今回の 400 はここ）** |
| L236 | `fetchItemList: result.status >= 400` | HTTP 200 だが本文の `result.status` が 400 以上 |

- **本番のみ**出力（`NODE_ENV !== "production"` なら即 return）
- **パラメータ（cid / floor / article_id）は一切ログに出さない**。L89-94 のコメント（原文）: 「`request.parameters`（api_id / affiliate_id を含む）は決して読まない＝秘密値をログ/エラーに露出させない」
  → **どの content_id / floor で 400 になったかはログから特定できない**

### 1-2. 発火は「即・読者影響」ではない（2段の緩衝がある）

**緩衝①: stale-serve ラッパ**（`0667855` 2026-07-14 導入）

`fetchItemList`（L151-188）は `fetchItemListUpstream` を try で包む。GUARD ログは upstream 内で**先に**出るが、その後:

```ts
    const maxAgeS = kind === "cid" ? STALE_MAX_AGE_CID_S : STALE_MAX_AGE_LIST_S;
    const stale = await readStaleCache(cacheKey, maxAgeS);
    if (!stale) throw error;
    console.warn(JSON.stringify({ level:"warn", tag:"VODNAVI_STALE_SERVED", ... }));
    return stale.data;
```

- Supabase `fanza_response_cache` に鮮度上限内（**一覧 48h / cid 単品 7日**）の行があれば **throw しない**
- その場合 **読者には通常どおりページが描画される**（`VODNAVI_STALE_SERVED` が warn で出るのみ）

**緩衝②: 呼び出し側の catch**（用途ごとに挙動が違う。下表）

### 1-3. 発火時に読者に何が表示されるか（コード実測）

| 面 | 失敗した呼び出し | catch の挙動 | 読者に表示されるもの | **CTA** |
|---|---|---|---|---|
| **works詳細** | **`getWork()`**（cid 単品・L71-83） | `return null` → L201 `if (!item) notFound()` | **404ページ** | **描画されない（ページ全体が出ない）** |
| works詳細 | `getRelatedWorks()`（genre一覧・L94-110） | `return []` | 関連作品セクションだけ空 | **メインCTAは残る** |
| **actresses** | `getActressPage()` 各フロア（L50-65） | `continue`（次フロアを試す） | 全フロア失敗→ items=0 | — |
| actresses | 上記の結果 | L212 catch → `notFound()` / L215 `if (page.items.length === 0) notFound()` | **404ページ** | **描画されない** |
| actresses | `getRelatedActresses()`（L82-105） | `return []` | 関連女優セクションだけ空 | 本体は残る |
| **genres** | `getGenrePage()` 各フロア（L48-75） | `continue` → 全滅なら items=0 → `notFound()` | **404ページ** | **描画されない** |
| genres | 関連ジャンル取得（L103-105） | `return []` | 該当セクションだけ空 | 本体は残る |

**works詳細で本体（`getWork`）が失敗した場合、金色CTA・`ConciergeCtaLink`・`ArticleGuideLinks`・`ConciergeCtaPanel` はいずれも `item` から描画されるため、すべて同時に消える。**
一方、**関連作品の取得失敗だけなら CTA はすべて残る。**

### 1-4. 実際にどちらが起きたか

**GUARD ログには呼び出し元が載らないため、ログ単体では判別できない。** 判別材料は以下:

| 材料 | 値 |
|---|---|
| バースト窓（8/5 09:30Z〜8/6 09:30Z）の **warn / error 比** | **1,395 / 1,548 = 90.1%** |
| バースト後（直近24h）の warn / error | 3 / 7 |
| 直近24時間（GUARD 0件の期間）の **404 件数** | **275**（101 distinct path・200 は 47,301） |

`console.warn` はコード全体で4箇所のみ:

| 箇所 | 発火条件 | 該当ルートの直近24hリクエスト数 |
|---|---|---|
| `lib/fanza/client.ts` L174 | **`VODNAVI_STALE_SERVED`** | works 19,508 / actresses 6,865 / genres 3,797 |
| `app/api/og/route.tsx` L152 | OG 画像の fetch 失敗 | `/api/og` はルート集計の上位24件に出現しない |
| `app/api/concierge/route.ts` L117 | safety block | `/api/concierge` は **0件** |
| `lib/inquiries.ts` L36 | 問い合わせ webhook 未設定 | 問い合わせ送信時のみ |

- warn 件数が error 件数と同期して 1,395→3 に落ちている
- 他3箇所は該当ルートのリクエストがほぼ無い
- **ただし warn ログの本文は直接読めていない**（runtime logs の個別行は直近数分しか残らない）ため、「warn = STALE_SERVED」であることは**直接には確認できていない**

→ **確認できた事実**: 404 のベースラインは 275件/日。バースト期の 404 件数は**取得できていない**（runtime logs の集計は24h超でタイムアウト）。

---

## 2. 影響範囲

### 2-1. 400 が返る条件

- DMM 側応答から抽出できた説明は **`BAD REQUEST` のみ**。エラーメッセージ全文（原文）:
  `FANZA API request failed: 400 Bad Request — BAD REQUEST`
  `extractDmmErrorDetail` は DMM の `result.message` / `errors[].message` を拾う実装だが、**その文字列以上の情報が返ってきていない**
- content_id / floor / パラメータは §1-1 のとおり**ログに出力しない設計**のため特定不能

### 2-2. ルート別の内訳（直近7日）

| ルート | 件数 | users |
|---|---|---|
| `/works/[floor]/[id]` | **1,527** | 1,102 |
| `/actresses/[id]` | **904** | 184 |
| 残り（`/genres/[id]`・各 `.rsc`） | 約 **253** | — |
| **合計** | **2,684** | **1,321** |

- actresses は 904件 / 184 users＝**1 user あたり 4.9件**、works は 1,527件 / 1,102 users＝**1.4件**

### 2-3. 発生率

| 分母 | 値 | GUARD 件数 | 率 |
|---|---|---|---|
| works ルートのリクエスト（19,508/日 × 7日 ≒ 136,556） | 136,556 | 1,527 | **約 1.1%** |
| 全リクエスト（47,576/日 × 7日 ≒ 333,032） | 333,032 | 2,684 | **約 0.8%** |

※ GUARD は「FANZA API 呼び出し1回」ごとに出る。works 詳細1リクエストあたり API 呼び出しは複数（`getWork` + `getRelatedWorks`）あるため、**上表はリクエスト数に対する率であって、影響を受けたリクエストの割合ではない**。

---

## 3. 6/21 の起点（運用則7: 差分の機械的洗い出しを先行）

### 洗い出し① ガード自体の導入日 → **6/21 ではない**

```
git log -S 'VODNAVI_SILENT_DEATH_GUARD' -- app-concierge/src/lib/fanza/client.ts
→ 79ffbf0  2026-06-09 13:04  feat(cto): wire BRIEF_057 silent-death telemetry into the real FANZA error site
```

**ガードは 6/21 の12日前から存在**していた。「初出 6/21」は計装追加によるものではない。

### 洗い出し② 集計テーブルの保持限界による打ち切りか → **打ち切りではない**

同じ `get_runtime_errors` の他グループの `first`:

| グループ | first |
|---|---|
| `[TypeError: fetch failed]` | **2026-06-16** |
| `TypeError: terminated` | 2026-07-08 |

`fetch failed` が **6/16 まで遡れている**ため、保持は少なくとも 6/16 に届いている。
※ 6/16 より前まで保持されているかは**未確認**。

### 洗い出し③ 6/21 当日に app ソースへ入った変更（全2件）

| 時刻(JST) | commit | 変更ファイル |
|---|---|---|
| **19:22** | **`23669e9` feat(cto): F-12 JSON-LD for actress/genre hubs + robots.ts AI crawler rules (#45)** | `(site)/actresses/[id]/page.tsx` (+43) / `(site)/genres/[id]/page.tsx` (+43) / `app/robots.ts` (+17/-5) |
| 19:41 | `b37faae` feat(ui): concierge chat trigger | `(site)/page.tsx` / `hero-section.tsx` |

**初回 GUARD = 2026-06-21T13:36:09Z ＝ 同日 22:36 JST**（`23669e9` の 3時間14分後）。

`23669e9` の `robots.ts` 差分（原文）:

```diff
+  const baseRule = { allow: "/", disallow: ["/api/", "/_next/"] };
+  // 主要 AI 検索クローラーを明示的に許可し、LLMO の引用対象として意図を宣言する。
+  // 既存の "*" でも実質許可されるが、個別 UA ルールで方針を明文化・将来調整可能にする。
+  const aiCrawlers = ["GPTBot","OAI-SearchBot","PerplexityBot","ClaudeBot","Google-Extended"];
   return {
     rules: [
-      { userAgent: "*", allow: "/", disallow: ["/api/", "/_next/"] },
+      { userAgent: "*", ...baseRule },
+      ...aiCrawlers.map((userAgent) => ({ userAgent, ...baseRule })),
     ],
```

- 同コミットは **actresses / genres に CollectionPage + ItemList の JSON-LD を新規注入**している
- **これは `c237e51`（2026-07-07）が「af_id 露出 → bot fetch → DMM クリック水増し」の経路として特定し是正したのと同じ箇所**

### FANZA API 側の仕様変更の可能性 → **確認していない**

- DMM のリリースノート・仕様変更告知は**参照していない**
- ログに残る DMM 側の説明は `BAD REQUEST` のみで、仕様変更を示す文言はない
- 既存記録に「**API を多用すると DMM が 400 を返す（スロットル）**」の観測が女優ハブ実装時に存在するが、**今回がこれと同一かは確認していない**

---

## 4. 1,321ユーザーの実体

### 4-1. 直接の判別 → **できない**

Vercel の Runtime Errors の "users" と Firewall の Bot 判定を突き合わせる手段が UI / API 上に存在しない。

### 4-2. 間接的な突き合わせ（数値のみ）

| 比較対象 | 値 |
|---|---|
| GA4 **2026-08-05 単日・サイト全体**のアクティブユーザー | **56** |
| バーストを含む直近2日間の GUARD **users** | **1,114** |
| 比 | **約 20倍** |

面別の対比（GA4 は 8/5 単日の表示回数、GUARD は7日累計）:

| 面 | GA4 表示回数（8/5） | GUARD 件数（7日） |
|---|---|---|
| `/works/*` | 118 | 1,527 |
| `/actresses/*` | **8** | **904** |
| `/genres/*` | 10 | 約253 |

- GA4 が計測するのは **JS を実行するクライアント**。その規模（サイト全体で1日56ユーザー）では **1,321 という user 数を説明できない**

### 4-3. サイト全体の Bot Category（直近24h・2026-08-06 06:15 〜 08-07 06:30 JST）

| Bot Category | 件数 |
|---|---|
| not set | 27K |
| ai_crawler | 21K |
| search_engine_crawler | 11K |
| search_engine_optimization | 5.6K |
| monitor | 284 |
| preview | 33 |
| ai_assistant | 10 |

同期間の Firewall: **Allowed 58.3k / Denied 22 / Challenged 1**、Bot Protection = **Inactive**。

**【整合しない点を明記】** この「サイト全体」の表には `browser_impersonation` が現れないが、`/concierge` に絞った同一クエリでは 4.3K 出る。また合計（約64.9K）が Allowed（58.3k）を上回る。**理由は特定していないため、本表は参考値として扱う。**

→ **works / actresses / genres に限定した bot 比率は本調査では取得できていない**（Request Path が作品ごとに分散し、Firewall のパス次元では集約できないため）。

---

## 5. 取得できなかったこと（明記）

| 項目 | 理由 |
|---|---|
| バースト期（8/5）の 404 件数 | runtime logs の集計が24h超でタイムアウト |
| 400 を返した具体的な content_id / floor / パラメータ | **ログ設計上、出力されない**（api_id 漏洩防止） |
| `VODNAVI_STALE_SERVED` の実件数・本文 | 個別ログ行の保持が直近数分。warn 件数（1,395）が同種と**推定**できるだけ |
| `fanza_response_cache` の実データ（stale が何件救ったか） | **Supabase MCP が Unauthorized**（`reference_supabase_mcp_env_inheritance` の既知事象。今回は復旧操作をしていない） |
| DMM 側の仕様変更の有無 | 参照していない |
| 2026-06-16 より前に GUARD 発火があったか | Runtime Errors の保持範囲が不明 |

---

> 本記録は事実の転記のみ。原因の断定・評価・提案は記載していない。
