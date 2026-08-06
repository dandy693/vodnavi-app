# concierge 離脱原因の切り分け — GA4 実測 + 計装追加の規模調査

- 実施: **2026-08-06 02:05 〜 02:15 JST**
- GA4: プロパティ **p489519780**（アカウント名で確認: **モテリスト / moterist.com@gmail.com**）・直近28日 **2026-07-09 〜 08-05**
- **読み取りのみ。コード変更は一切していない。判断は加えず数値と規模のみ**
- Phase 1 で停止

---

## 1. age_gate_* イベント（仮説B）

### 全体（gate を問わない）

| イベント | イベント数 | 総ユーザー数 |
|---|---|---|
| `age_gate_view` | 1,954 | 1,880 |
| `age_gate_agree` | 1,351 | 1,342 |
| `age_gate_bounce` | 14 | 13 |
| **合計** | **3,319**（全体の16.51%） | 1,888 |

### `gate` パラメータ別の内訳（**カスタムディメンション `gate` は登録済み**・`customDimensionsGroup2Slot05`）

| # | イベント | `gate` | イベント数 | 総ユーザー数 |
|---|---|---|---|---|
| 1 | `age_gate_view` | **site_overlay** | 1,954 (58.87%) | 1,880 |
| 2 | `age_gate_agree` | **site_overlay** | 1,349 (40.64%) | 1,340 |
| 3 | `age_gate_bounce` | **site_overlay** | 14 (0.42%) | 13 |
| 4 | **`age_gate_agree`** | **concierge** | **2 (0.06%)** | **2** |

**全4行**（`1〜4/4`）。

### `ai_session_start`（18）との関係

| 項目 | 値 |
|---|---|
| `gate=concierge` の `age_gate_view` | **0件**（該当行が存在しない） |
| `gate=concierge` の `age_gate_agree` | **2件** |
| `gate=concierge` の `age_gate_bounce` | **0件**（該当行が存在しない） |
| `ai_session_start` | **18件** |

- **`gate=concierge` の `age_gate_view` が0件**であるため、**concierge 面の年齢確認モーダルが表示された回数は計上されていない**
- **`gate=concierge` の `age_gate_bounce` も0件**
- したがって **「concierge の年齢確認で離脱した割合」は、現在のデータからは算出できない**（分母となる `gate=concierge` の view が0のため）
- `gate=site_overlay` の view→agree は 1,954→1,349（**agree 率 69.0%**）だが、これは**サイト全体のオーバーレイであり concierge 面固有ではない**

---

## 2. `concierge_entry_click` の流入元（仮説C）

**カスタムディメンション `source`（`customDimensionsGroup2Slot02`・表示名「Event Source」）別**:

| # | `source` | イベント数 | 総ユーザー数 | 意味（コード上の定義） |
|---|---|---|---|---|
| 1 | **`app_direct`** | **10 (66.67%)** | 10 | works 詳細の**メイン CTA 直下**の導線（検索エンジンから作品ページに直接着地したユーザー向け） |
| 2 | **`app_detail`** | **5 (33.33%)** | 3 | works 詳細の**フッタパネル**からの内部回遊 |
| | **合計** | **15** | **13** | |

- **15クリックはすべて `app.vodnavi.jp` の works 詳細ページ内から発火**している（`app_direct` / `app_detail` はいずれも works 詳細に設置された `ConciergeCtaLink` の値）
- **`vodnavi.jp`（ブランドサイト）由来の値は存在しない**（該当行なし）
- 参考: `/lp` 経由の導線（X 投稿 T5 のリンク先）は `concierge_entry_click` を発火しない（`ConciergeCtaLink` を経由しないため）

---

## 3. 往復数の計装追加の可否と規模（仮説A）

### 可否 → **可能**

### 現状のコード（`src/components/concierge/concierge-chat.tsx` L181-186・原文）

```ts
  async function submit(text?: string) {
    const value = (text ?? input).trim();
    if (!value || isBusy) return;
    setInput("");
    sendMessage({ text: value });
  }
```

### 前提条件（すでに満たされているもの）

| 項目 | 状態 |
|---|---|
| `track` の import | **済**（同ファイル L15-20 で `track` を import 済み。`ai_recommendation_view` で使用中） |
| `messages` の参照 | **済**（同スコープ内に `messages` が存在。L195 で `messages.length` を使用中） |
| `track()` のシグネチャ | `track(eventName: string, params?: Record<string, string｜number｜boolean｜undefined｜null>)`＝**number をそのまま渡せる** |
| 送信の集約点 | **`submit()` の1関数のみ**。呼び出しは3箇所（L191 Enter キー / L221 サジェスト / L245 送信ボタン）だが**すべて `submit()` を通る** |

### 改修の規模

| 項目 | 規模 |
|---|---|
| 変更ファイル数 | **1**（`concierge-chat.tsx`） |
| 変更関数 | **1**（`submit()`） |
| 追加行数 | **約4〜6行**（`track()` 呼び出し1つ） |
| 新規 import | **不要** |
| 新規コンポーネント | **不要** |
| 型定義の変更 | **不要** |
| DB / DDL | **不要** |
| デプロイ | **要**（クライアントコンポーネントのため） |
| GA4 側の作業 | **カスタムディメンション登録が必要**（新規パラメータ名。`gate` / `source` / `placement` と同様の登録作業。登録しないと GA4 の表に列として出ない） |

### 想定される実装形（**実装していない・参考の形のみ**）

```ts
  async function submit(text?: string) {
    const value = (text ?? input).trim();
    if (!value || isBusy) return;
    track("ai_user_message", {
      turn_index: messages.filter((m) => m.role === "user").length + 1,
      message_count: messages.length,
      transport_type: "beacon",
    });
    setInput("");
    sendMessage({ text: value });
  }
```

- `turn_index` は「ユーザーが何回目の送信か」。`messages` にはアシスタントの初期メッセージが含まれるため、**`role === "user"` で絞る必要がある**
- これにより「何往復目で離脱したか」は **`ai_user_message` の `turn_index` 別イベント数**として取得できるようになる

### 【併記】この改修だけでは埋まらない差

- 現在 **`ai_session_start` 18 に対し `ai_recommendation_view` 0** であり、**推薦到達が1件もない**
- `ai_recommendation_view` は `finalize_recommendations` ツールが呼ばれ `data-recommendations` パートが描画されたときに発火する（`concierge-chat.tsx` L164-172）
- **`turn_index` を追加しても、「ユーザーが送信したか否か」までしか分からない。** ユーザーが1度も送信していない場合（`turn_index` が1件も出ない場合）と、送信したが推薦に至らない場合の区別はつくが、**API 側で何が起きているか（ツール呼び出しの成否）は GA4 では判別できない**

---

> 本記録は数値と規模の転記のみ。原因の断定・評価・提案は記載していない（§3 のコード片は「想定される実装形」の提示であり、実装はしていない）。
