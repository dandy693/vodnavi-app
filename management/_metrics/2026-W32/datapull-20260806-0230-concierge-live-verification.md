# concierge の動作確認 — **システムは正常。推薦もイベント発火も成立**

- 実施: **2026-08-06 02:20 〜 02:35 JST**
- Chrome 連携で本番 `/concierge` を実操作（2往復）。**CTA はクリックしていない**
- **判断は加えず、事実のみ**
- Phase 1 で停止

---

## 1. 実動作確認（2往復）

7/31 実査と同じ手順（「VR で没入したい」→「お姉さん系でお願いします」）。

| 往復 | 入力 | 応答 |
|---|---|---|
| 1 | **「VR で没入したい」**（サジェストをクリック） | **絞り込み質問のみ**。「今夜はどの雰囲気が近いですか。」＋ **お姉さん系 / 清楚系 / 熟女系 / ギャル系** の4択。**作品提案なし** |
| 2 | **「お姉さん系でお願いします」**（テキスト入力） | **推薦テキスト＋作品カード3枚が描画された** |

### 作品カードの描画 → **描画された（3枚）**

| # | 作品（画面表示） | 女優 | 評価 |
|---|---|---|---|
| 1 | 【VR】【8K】ベロが吸い付いて離れない、キス沼に堕ちる初体… | 逢沢みゆ | ★4.39 |
| 2 | 【VR】ワンランク上のオンナに癒されたいーー。エロティック… | ひなの花音 | （表示なし） |
| 3 | 【VR】【8K】「1日10回抜いたらいいじゃん！」バレー部で鍛えた… | 羽川るる | ★4.56 |

各カードに「今すぐ視聴 →」と「作品がみつからない場合はこちら（検索一覧へ）」、末尾に「この結果を X でシェアする」も描画。

### GA4 イベントの実発火 → **発火している**

ページの `window.dataLayer` を読み取った実測値（原文）:

```json
{
  "gtag_type": "function",
  "dataLayer_len": 10,
  "event_names": ["gtm.js","ai_session_start","age_gate_view","gtm.dom","gtm.load",
                  "gtm.scrollDepth","page_view","ai_recommendation_view"],
  "has_recommendation_view": true
}
```

- **`ai_recommendation_view` が dataLayer に push されている**
- `window.gtag` は `function` として存在
- **ただし本検証 Chrome は `/g/collect` を送信しないため、この発火は GA4 には計上されない**（既知・`reference_verification_chrome_blocks_ga4_collect`）

---

## 2. S4 デプロイ（2026-08-03 00:59:37）前後の差分と推薦描画経路

S4（PR #65）で変更した concierge 関連の3ファイルと、その整合性:

| ファイル | 変更内容 | 推薦描画経路への影響 |
|---|---|---|
| `lib/concierge/tools.ts` | `ConciergeWork.affiliateURL` → **`ctaUrl`**（interface + 代入） | 推薦データの**生成側** |
| `app/concierge/page.tsx` | 同じく **`ctaUrl`** へ改名（共有リンク復元経路） | 同上 |
| `components/concierge/concierge-chat.tsx` | `Work.affiliateURL` → **`ctaUrl`** / `href={work.ctaUrl}` / **`isWork()` が `typeof v.ctaUrl === "string"` を検査** | 推薦データの**受け取り側** |

- **3ファイルは同一 PR で同時に改名**されており、生成側・受け取り側の**キー名が一致している**
- API route（`app/api/concierge/route.ts` L238-244）は `works.get(id)`（= `tools.ts` が構築した `ConciergeWork`）をそのまま `type: "data-recommendations"` の `data` として送出しており、**キー名を変換していない**
- **`ai_recommendation_view` の発火条件そのものは S4 で変更していない**（`useEffect` / `extractRecommendations` / `track()` の呼び出しはいずれも無改修）
- §1 の実動作でカードが描画され `ai_recommendation_view` も発火したことから、**S4 の改名は推薦描画経路を壊していない**

---

## 3. `ai_recommendation_view` の発火条件（コード上）

`components/concierge/concierge-chat.tsx` L167-179（原文）:

```ts
  // 推薦が new で表示されたタイミングで GA4 に通知（メッセージ id でデデュープ）
  useEffect(() => {
    for (const msg of messages) {
      if (msg.role !== "assistant") continue;
      if (viewedRef.current.has(msg.id)) continue;
      const recs = extractRecommendations(msg);
      if (recs.length === 0) continue;
      viewedRef.current.add(msg.id);
      track("ai_recommendation_view", {
        recommendation_count: recs.length,
        content_ids: recs.map((r) => r.content_id).join(","),
      });
    }
  }, [messages]);
```

`extractRecommendations()` L799-807（原文）:

```ts
function extractRecommendations(msg: UIMessage): Work[] {
  for (const part of msg.parts) {
    if ((part as { type?: string }).type !== "data-recommendations") continue;
    const data = (part as { data?: unknown }).data;
    if (!Array.isArray(data)) continue;
    return data.filter((d): d is Work => isWork(d));
  }
  return [];
}
```

### 発火のタイミング → **作品カード描画と同一条件**

- 発火条件 = **`data-recommendations` パートが存在し、`isWork()` を通る要素が1件以上あること**
- **カードの描画も同じ `data-recommendations` パートを描画元とする**（`MessageBubble` が同パートをグリッド表示）
- したがって **「カードが描画されたのにイベントが発火しない」という状態は、この実装では発生しない**（同一の配列が両方の根拠）
- 逆に **`isWork()` が false になれば、カードも描画されずイベントも発火しない**（両方同時に消える）

`isWork()` の検査（L809-817）: `content_id` / `title` / **`ctaUrl`** がいずれも string であること。

---

## 4. Vercel runtime logs

| 項目 | 結果 |
|---|---|
| 取得できたログの時間範囲 | **約 17:59 〜 18:01（UTC）＝ 2〜3分間のみ** |
| `/api/concierge`（POST・AI 呼び出し）の記録 | **0件**（取得範囲内） |
| `error` / `warn` レベルの記録 | **0件**（取得範囲内） |
| `SILENT_DEATH` / 500 / 502 / 503 | **0件**（取得範囲内） |
| FANZA API 呼び出しの失敗記録 | **0件**。`[fanza-filter] in=16 no_url=0 dropped…` 等の正常ログのみ |

### 【重要】28日分は取得できていない

- `vercel logs` が返したのは**直近2〜3分**のみ。**直近28日の範囲は取得できていない**（保持期間・CLI の仕様による）
- したがって **「直近28日でエラーが無かった」ことは確認できていない**。確認できたのは**取得範囲内でエラーが0件**であることのみ

### 付随して観測した事実

- 取得範囲（約2分）の中で **`GET /concierge` が 30 件以上**記録されている
- 一方 GA4 の `/concierge` は **直近28日で PV 46 / アクティブユーザー 21**
- この差について、本記録では原因を特定していない

---

## 5. 本検証で消費したもの（申告）

- 本番 `/concierge` で **2往復の対話を実行**した（Anthropic API + FANZA API を実際に呼び出している）
- **GA4 には計上されない**（検証用 Chrome が `/g/collect` を送信しないため）
- **CTA はクリックしていない**（遷移先が遮断ドメインのため）

---

> 本記録は事実の転記のみ。原因の断定・評価・提案は記載していない。
