# concierge の稼働実態 — GA4 実測（直近28日: 2026-07-09 〜 08-05）

- 実施: **2026-08-06 01:5x 〜 02:00 JST**
- 取得元: GA4 プロパティ **p489519780**（アカウント **VODまとめ研究所 a355462253** / プロパティ **vodnavi.jp**）
- **アカウント名で確認: 「モテリスト / moterist.com@gmail.com」**（`authuser=1`。番号ではなく画面表示のアカウント名で確認）
- **読み取りのみ。判断は加えず数値のみ**
- Phase 1 で停止

---

## 1. `/concierge` の PV（直近28日）

| 指標 | 値 | 全体比 |
|---|---|---|
| **表示回数（PV）** | **46** | 全体の **0.69%** |
| アクティブユーザー | **21** | 全体の **0.81%** |
| アクティブユーザーあたりのビュー | 2.19 | 平均より 14.33% 低い |
| **アクティブユーザーあたりの平均エンゲージメント時間** | **7 秒** | **平均より 53.21% 低い** |
| イベント数 | 158 | 全体の 0.79% |
| キーイベント | 18.00 | 全体の 6.55% |

サイト全体（同期間）: **PV 6,658 / 総ユーザー 2,606 / 全イベント 20,106**

---

## 2. placement `cta` / `fallback_search` のクリック数

### 【前提の訂正】`fallback_search` は placement ではない

コード実測（`concierge-chat.tsx`）:

| 箇所 | パラメータ | 値 |
|---|---|---|
| L727 | **`placement`** | `"cta"` |
| L759 | **`link_variant`**（placement ではない） | `"fallback_search"` |

→ **concierge 面で送られる placement は `"cta"` のみ。`fallback_search` は `ai_affiliate_click` の `link_variant` パラメータ**である。

### イベント実測（`ai_` で絞り込み・**該当2件のみ**）

| イベント名 | イベント数 | 総ユーザー数 |
|---|---|---|
| `ai_affiliate_click` | **257** | 189 |
| `ai_session_start` | **18** | 18 |
| **合計** | **275**（全体の 1.37%） | 199 |

- **`ai_affiliate_click` 257 のうち、concierge 面（placement=`cta`）由来と works/一覧面由来の内訳は、本レポート（イベント名軸）では分離できていない**
- placement 別内訳の取得には、`placement`（`customDimensionsGroup2Slot04`）をセカンダリディメンションに追加した表示が必要。**本記録では未取得**

---

## 3. 流入経路の内訳（vodnavi.jp / 直接 / 検索 / X）

**本記録では未取得。**
`/concierge` に限定した参照元／メディア別の内訳は、ページパス軸のレポートには含まれていないため、
探索（Exploration）またはセカンダリディメンション追加が必要。

参考として取得できた関連数値:

| 指標 | 値 |
|---|---|
| `concierge_entry_click`（works 詳細 → concierge の内部導線） | **15**（総ユーザー **13**） |

---

## 4. 対話完了率（作品カードが描画されるまで到達した割合）

### 計測の可否 → **計測できる形になっている**

| イベント | 意味 | 実装箇所 |
|---|---|---|
| `ai_session_start` | コンシェルジュ起動 | `session-init.tsx` L37 |
| `ai_recommendation_view` | **推薦カードが描画された**（`recommendation_count` / `content_ids` 付き） | `concierge-chat.tsx` L174 |

→ 対話完了率 = `ai_recommendation_view` ÷ `ai_session_start` で算出可能。

### 実測

| イベント | 直近28日 |
|---|---|
| `ai_session_start` | **18** |
| **`ai_recommendation_view`** | **0**（`ai_` 絞り込みの結果に**該当行が存在しない**） |
| **対話完了率** | **0 / 18 = 0%** |

- `ai_` で絞り込んだ結果は **`ai_affiliate_click` と `ai_session_start` の2行のみ**（`1〜2/2`）
- **`ai_recommendation_view` は1件も発生していない**
- 同様に **`ai_share_click` も0件**（`ai_` 絞り込みに現れない）

---

## 5. 離脱ポイント（対話の何往復目で離脱するか）

### 計測の可否 → **計測できない**

- ユーザーの送信を捕捉する GA4 イベントが**存在しない**。`concierge-chat.tsx` の `submit()`（L180-186）に `track()` の呼び出しが無い
  ```ts
  async function submit(text?: string) {
    const value = (text ?? input).trim();
    if (!value || isBusy) return;
    setInput("");
    sendMessage({ text: value });
  }
  ```
- `messages.length` は画面制御（`showSuggestions`）にのみ使われ、**GA4 へ送られていない**
- concierge 面で発火しうるイベントは `ai_session_start` / `ai_recommendation_view` / `ai_affiliate_click` / `ai_share_click` / `age_gate_*` のみ

→ **往復数を軸にした離脱ポイントは、現在の計装では取得不能。**
なお §4 のとおり `ai_recommendation_view` が0件であるため、**「推薦到達の前に離脱している」ことは判別できるが、その手前の何往復目かは判別できない**。

---

## 6. 取得できなかった項目（明記）

| 項目 | 状態 | 必要な追加作業 |
|---|---|---|
| 3. 流入経路の内訳 | **未取得** | `/concierge` に絞った参照元/メディア別の探索レポート |
| 2. placement 別のクリック内訳 | **未取得** | `placement` をセカンダリディメンションに追加 |
| 5. 往復数別の離脱 | **取得不能** | 送信イベントの計装追加（コード変更） |

---

> 本記録は数値と計測可否の転記のみ。原因・評価・提案は記載していない（§2 冒頭の「前提の訂正」はコード実測に基づく事実）。
