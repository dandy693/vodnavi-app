# Chrome 連携の不調ログ（症状の集積）

> **原因を推測しない。** 2026-08-11（第9便）に **「原因未特定のまま受容」** と判定済み（`FACT_GOVERNANCE.md` §10）。
> 本ログは**症状を集積するためのもの**であり、**個々の事象が同系統かどうかは判断しない**。
> 十分な件数が集まったとき、初めて分布から何か言える可能性がある。**それまでは記録に徹する。**

## 記録項目

| 列 | 内容 |
|---|---|
| 便 | 発生した指示便 |
| 発生日 | JST |
| 対象ドメイン | 症状が出たページのホスト |
| 症状 | **エラーメッセージは原文のまま**記録する |
| 回復 | 回復したか・何をしたら回復したか（**「〜したから直った」と因果を断定しない**） |

---

## 一覧（2026-08-11 〜 2026-08-14）

| 便 | 発生日 | 対象ドメイン | 症状（原文） | 回復 |
|---|---|---|---|---|
| **第9便** | 08-11 | Supabase SQL Editor / 自サイト | `Input.dispatchKeyEvent` タイムアウト / `screenshot` 3回失敗 | 未回復のまま中断。**`computer type` が入力未着地でも「Typed …」と成功を返した**（8回中2回・プレーン input・自サイト）＝§10 の運用則の由来 |
| **第13便** | 08-11 | 自サイト | `resize_window` が**成功を返しつつ `innerWidth` が不変** | 未回復。**戻り値と実状態が食い違う症状**（§10 の一般則と同型） |
| **第18便** | 08-13 | Airtable | `Runtime.evaluate` 45秒タイムアウト | — |
| **第27便** | 08-13 | Airtable | `read_page` が `document_idle` 45000ms 待機でタイムアウト ×2 → 3回目 `Frame with ID 0 was removed.` | **3回連続で応答不能 → §10 回避手順5 に従い中断。**API 読み戻しで代替 |
| **第31便** | 08-14 | **`analytics.google.com`** | ①`get_page_text` → **`Permission denied for reading page content on this domain`** ②`read_page` → 応答なし ③`get_page_text` → `Page still loading (executeScript waited 45000ms for document_idle)` | **3回連続で中断。**→ **第32便で Chrome 完全再起動後に成功** |
| **第32便** | 08-14 | `analytics.google.com` | ①`get_page_text` → `No text content found. Page may contain only images, videos, or canvas-based content.`（**権限拒否ではない**） | **②`read_page` で成功。③`get_page_text` でも成功**。以後の連続取得も成功 |
| **第33便** | 08-14 | `affiliate.dmm.com` | ①`computer left_click`（ref 指定）が **`Clicked on element ref_31` を返しつつ画面状態が変わらない** ②`zoom` → `CDP sendCommand "Page.captureScreenshot" timed out after 30000ms on tab ... The renderer may be frozen or unresponsive.` ③以後 **`screenshot` が 240x50 を返し続け、`read_page` の `Viewport: 240x50`** ＝**`zoom` の領域指定が viewport に残留した状態異常** | **3回連続の異常のため §10 回避手順5 に従い中断。**決定的なデータは取得済みだったため成果は失っていない |
| **第34便** | 08-15 | `affiliate.dmm.com` | ①`computer left_click`（option 要素の ref 指定）→ `Clicked on element ref_539` を返すが **select の選択値が変わらない** ②combobox にフォーカスして `key Down`×4 → **同じく選択値が変わらない**（`read_page` で `option "すべて" (selected)` のまま） | **2回で中断（3回目は試さず）。**ID フィルタは未適用のまま。**過去にも `239a13c`（07-26）に「IDフィルタはヘッダ確認を手順化」の記録あり** |
| **第36便** | 08-15 | `affiliate.dmm.com` | `computer left_click` → **`CDP sendCommand "Input.dispatchMouseEvent" timed out after 30000ms on tab ... The renderer may be frozen or unresponsive.`** | **クリック自体は着地していた**（直後の `get_page_text` が `The previous action may have triggered navigation` を返した）。**§10「タイムアウト＝未実行と決めつけない」が機能** |
| **第38便** | 08-15 | `search.google.com` | `navigate` → **`Browser extension is not connected. Please ensure the Claude browser extension is installed and running ...`** | **誤報。ナビゲーションは着地していた**（直後の `tabs_context_mcp` でタブが「クロールの統計情報」に遷移済みと確認）。**エラーメッセージを信じて中断していたら、取得できたはずのデータを落としていた** |
| **第40便** | 08-15 | `search.google.com`（URL 検査ツール） | `get_page_text` ×2 → `read_page` ×1 がいずれも **`Page still loading (executeScript waited 45000ms for document_idle)`** | **3回連続で中断（§10 回避手順5）。**articles のインデックス状況は CSO 枠へ |
| **第41便** | 08-15 | `search.google.com` | **第40便の「3回失敗」は Chrome の不調ではなかった。** タブのタイトルを読むと **`Error 404 (見つかりませんでした)!!1`**＝**CTO が組み立てた URL 検査の直リンクが 404 を返していた**。UI の検査ボックス経由に切り替えたら**一度で成功**した | **症状の帰属が誤りだった例。**`Page still loading` を Chrome の不調と読んだが、実際は**存在しない URL を開いていた**。**§10 拡張の逆方向の適用**（エラーの原因を安易にツールへ帰属させない） |
| **第52便** | 08-15 | `search.google.com` | ①`screenshot` → **`CDP sendCommand "Page.captureScreenshot" timed out after 30000ms ... The renderer may be frozen or unresponsive.`（3回）** ②`read_page` → `Page still loading (executeScript waited 45000ms for document_idle)`（1回）③`screenshot` → `Script injection timed out after 5000ms — the page is busy or mid-navigation`（2回） | **6回とも誤報。**直後の `get_page_text` / `read_page` / 別の `screenshot` はいずれも成功し、**ページは生きていた**。**③の2回は文面どおり「検査の実行中」であり、待てば結果が取れた。** **§10「失敗も信じるな」が6回連続で機能した例** |
| **第52便** | 08-15 | `search.google.com` | **`computer key ctrl+a` が「全選択」ではなく文字 `a` の入力として着地した。** 入力欄は `ahttps://app.vodnavi.jp/...` となり GSC が **「不適切な形式の URL」** を表示 | **§10 の読み戻しで検出。**入力後に screenshot で値を確認していたため、`Return` を押す前に気づけた。**回避＝入力欄のクリアは `ctrl+a` ではなく ✕（検索をクリア）ボタンを使う** |
| **第52便** | 08-15 | `search.google.com` | **URL 検査の実行後、結果のオーバーレイが自動的に閉じてサマリー画面に戻る**（2回） | **回復済み。**閉じても**タブの URL に新しい `id` が入っている**ため、その URL へ navigate し直せば結果を読める（2回とも回収成功）。**「取得できなかった」ではない** |

---

## 事実として言えること（推測を含めない）

1. **症状は毎回異なる。** タイムアウト / 権限拒否 / フレーム消失 / 成功を返しつつ未着地 / テキスト無し —— **同一の症状が再現した例が無い。**
2. **対象ドメインは一定でない。** 自サイト・Supabase・Airtable・Google Analytics のいずれでも発生している。
3. **「成功の戻り値」と「実際の状態」が食い違う症例が2件ある**（下記4も参照）（第9便の `computer type`、第13便の `resize_window`）。**これが §10「書き込み系ツールの戻り値は着地の証拠にならない」の実証的な根拠である。**
4. **第31便の `Permission denied` は、第32便で Chrome を完全再起動した後に発生しなくなった。**
   - **【厳守】これを「再起動が原因を解消した」と読まない。** 再起動と回復の間に**時間的な前後関係があるだけ**であり、因果は確認していない。**第31便と第32便の間には、再起動以外にも「時間の経過」「セッションの更新」など複数の差分が同時に存在する。**
   - §10 に既に記録されているとおり、**「401 を見たら反射的に再起動」しないこと**と同じ姿勢を取る。

5. **【症状の帰属を誤った例】第40便の「3回連続 `Page still loading`」は Chrome の不調ではなく、CTO が組み立てた URL が 404 だったことによる**（第41便で判明）。**本ログに記録する前に、対象側の状態（タブのタイトル・URL）を読むこと。** そうしなければ**このログ自体が誤った症例で汚染される**。
6. **【逆方向の食い違い】「失敗の戻り値」を返しつつ実際には着地していた症例が 2件 → 8件になった**（第36便の `Input.dispatchMouseEvent` タイムアウト、第38便の `Browser extension is not connected`、**第52便の6件**＝`Page.captureScreenshot` タイムアウト3回 / `Page still loading` 1回 / `Script injection timed out` 2回）。
   - **第52便では6回すべてが誤報だった。** **直後に別の読み取り手段（`get_page_text` / `read_page` / 再度の `screenshot`）を呼べばページは生きていた。**
   - **「エラーが返ったら、まず別の手段で対象側の状態を読む」を先に行うこと。** **エラー回数を数えて中断判定に使う前に、この確認を挟む。**（§10 回避手順5 の「3回連続で応答不能」は**応答不能の実測**を指すのであって、**エラー文字列の回数ではない**。）
   - **§10 は「成功を信じるな」だけでなく「失敗も信じるな」を意味する。** **エラーが返っても、必ず対象側の状態を確認してから次の判断をすること。**
   - **第38便では、エラーメッセージを信じて中断していたら、実際には取得できたクロール統計を落としていた。**

## 【回復手段が判明】viewport 240x50 固定（第33便）

**新規タブを開けば viewport は正常（1455x671）に戻る**（第34便で実測）。**Chrome の再起動は不要。**

- **異常はタブ単位で残留する**。第33便で異常になったタブ `290635984` は、**第34便の時点でも `Viewport: 240x50` のまま**だった。同時刻に新規作成したタブは `1455x671` で正常。
- **原因は推測しない。**「`zoom` の直後から発生した」という**時間的な前後関係のみ**が観測事実である。

### 回避手順（第34便で追加）

1. **`zoom` を使わない。** 小領域の確認が必要なときも **`screenshot`（全画面）で代替する**。第33便で必要だった確認（入力欄の値）は、**`read_page` の要素値**でも取れた。
2. **viewport が異常になったタブは復旧を試みず、新規タブを開く。**
3. **`screenshot` の返り値のサイズを見る。** `1455x671` 以外が返ったら viewport 異常を疑い、**その状態で座標クリックを続けない**（座標系がずれるため）。

## 棄却済みの仮説（§10 より・再掲）

第9便の調査で**実測により反証済み**: ①Monaco 特有 ②Supabase SQL Editor 特有 ③hidden タブだと届かない ④直前の screenshot が必要 ⑤直前の `left_click` が壊す。

バージョン差分（Chrome 151＝2026-08-08 20:45 / Claude 拡張 1.0.85＝2026-08-07 12:51）は**症状との時間的近接がなく、原因と断定しない**。

## 運用（変えない）

- **3回連続で応答不能なら迂回せず中断・報告する**（§10 回避手順5）。**本ログはこの規則を緩める根拠にはならない。**
- **書き込み後は必ず読み戻す**（§10）。**Chrome 連携に限らず書き込み系ツール全般。**
- **タイムアウト＝未実行と決めつけない。**必ず画面／モデル値で状態を確認してから再試行する。
