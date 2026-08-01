# S1計装のハイドレーション検証【CSO指示・8/2】

- 実施: **2026-08-02 07:57:31 〜 08:01:05 JST**(PowerShell 実測)
- 手段: Chrome連携（`app.vodnavi.jp` トップ / works詳細）+ 本番JSチャンクの直接取得（PowerShell）
- **CTAは一度もクリックしていない**（遷移先 `video.dmm.co.jp` はポリシー遮断確定のため）。すべて要素・fiber・関数ソースの**検査のみ**で判定
- **修正は未実装**（原因特定後・CSO承認を経てから）。Phase 1 で停止

---

## 1. トップページ（`https://app.vodnavi.jp/`）の検査結果

### 1-1. ハイドレーション成否

| 検査 | 結果 |
|---|---|
| コンソールメッセージ（全種・パターン `.` で全件取得） | **0件**（error / warning / hydration mismatch いずれも**なし**） |
| 一覧系CTAアンカー数（`今すぐ視聴` を含む `<a>`） | **23** |
| `__reactFiber$*` キー | **23/23 で存在** |
| `__reactProps$*` キー | **23/23 で存在** |
| **`typeof props.onClick`** | **23/23 で `function`** |

→ **ハイドレーションは成功しており、onClick ハンドラは全23本に登録されている**

### 1-2. placement の実行時実値（React fiber の `memoizedProps` を遡上して取得）

| 値 | 件数 |
|---|---|
| **`placement` = `list_top_card_cta`** | **23** |
| **`surface` = `top`** | **23** |

→ **実行時に placement は正しく解決されている**（`undefined` でも `list_card_cta` フォールバックでもない）

### 1-3. onClick ハンドラの実体（`Function.prototype.toString`・原文）

```
()=>{(0,r.trackProductClick)({asp_name:"fanza",content_id:n,title:i,floor_code:a,placement:o,link_target:"fanza_affiliate",transport_type:"beacon"}),(0,r.trackAiAffiliateClick)({asp_name:"fanza",conte…
```

（全290文字）

| 含有チェック | 結果 |
|---|---|
| `trackProductClick` 呼び出し | **あり** |
| `trackAiAffiliateClick` 呼び出し | **あり** |
| `placement` 引数 | **あり**（`placement:o` = §1-2 の実値 `list_top_card_cta`） |
| `link_target:"fanza_affiliate"` | **あり** |
| `transport_type:"beacon"` | **あり** |
| `link_variant:"primary"` | **あり** |

※ミニファイ後のため `"product_click"` / `"ai_affiliate_click"` の文字列リテラルはハンドラ内には現れない（イベント名は `track()` 側に存在）

### 1-4. GA4 送出基盤

| 検査 | 結果 |
|---|---|
| `typeof window.dataLayer` | `object`（`Array.isArray` = **true**、長さ 6） |
| `typeof window.gtag` | **`function`** |

### 1-5. `track()` 実体の本番分岐（配信チャンク `0c29k_rjgt_-z.js`・8,397 bytes・原文抜粋）

```
"localhost"===window.location.hostname
  ? console.log("[track-dev]",e,n)
  : "function"==typeof window.gtag
    ? window.gtag("event",e,n)
    : (window.dataLayer=window.dataLayer||[],windo…
```

| 検査 | 結果 |
|---|---|
| `process.env.NODE_ENV` / `NODE_ENV` の残存 | **0件**（ビルド時に静的除去済み＝本番分岐が確定） |
| `localhost` 判定 | 1件（`app.vodnavi.jp` では **false**） |
| → 実行される分岐 | **`window.gtag("event", …)`**（`window.gtag` は function として存在＝§1-4） |

---

## 2. works詳細（`https://app.vodnavi.jp/works/videoa/vrkm01890`）の検査結果

| 検査 | 結果 |
|---|---|
| アフィリエイトアンカー数 | **17** |
| **`typeof props.onClick`** | **17/17 で `function`** |
| placement 実値の内訳 | `detail_sample` ×12 / `works_fv_newuser` ×2 / `detail_fv_cta` ×1 / `detail_main_cta` ×1 / `detail_sticky_cta` ×1 |
| `dataLayer` 長 / `gtag` 型 | 6 / `function` |
| コンソールエラー | **0件** |

---

## 3. 差分の記録（トップ ⇔ works詳細）

| 検査項目 | トップ（一覧系） | works詳細 | 差分 |
|---|---|---|---|
| ハイドレーションエラー | **0件** | **0件** | **なし** |
| `__reactFiber$` / `__reactProps$` の付与 | 23/23 | 17/17 | **なし** |
| `typeof onClick` | **function**（23/23） | **function**（17/17） | **なし** |
| placement の実行時実値 | `list_top_card_cta`（23） | `detail_*` / `works_fv_newuser`（17） | **なし**（いずれも期待値どおり） |
| onClick が呼ぶ関数 | `trackProductClick` + `trackAiAffiliateClick` | 同一コンポーネント（`FanzaAffiliateLink`）のため同一 | **なし** |
| `window.gtag` | function | function | **なし** |
| `track()` の本番分岐 | `window.gtag("event", …)` | 同一モジュール | **なし** |

**→ 検査した全項目でトップと works詳細に差分は検出されなかった。**

---

## 4. 検証の結論（事実のみ）

1. **ハイドレーション失敗は否定された**（コンソール0件・fiber/props キー全付与）
2. **onClick ハンドラは一覧系CTA 23本すべてに登録されている**
3. **placement は実行時に `list_top_card_cta` として正しく解決されている**
4. **ハンドラ本体・`track()` 実体・`window.gtag` まで、送出チェーンは末端まで正常**
5. **works詳細との差分は検査した全項目で 0**

→ **計装コード側に不良は検出されなかった。前回列挙した差分6点（Client Component / 式 placement / RSC境界 / チャンク配置 / aria-label / af_id）は、いずれも本検証で不良要因として否定された。**

---

## 5. 残る未検証点と、標本に関する事実

### 5-1. 唯一未検証なのは「実際のクリック時に送出が完了するか」

- 本検証は**要素の検査のみ**であり、クリック実行時の挙動（`gtag` 呼び出し→ `/g/collect` 送信→GA4計上）は**未検証**
- CTO は**クリックを実施していない**（制約どおり）

### 5-2. 標本に関する事実（判断は加えない）

- S1デプロイ（2026-07-31 06:27:51）以降、DMM の af_id=990 クリックは **8/1 の1件のみ**（7/25〜7/31 は全日0）
- したがって **「GA4に計上されなかった」の標本は n=1**
- **af_id=990 は一覧系3面の ProductCard メインCTA と、concierge メインCTA（`concierge-chat.tsx` L704 `href={work.affiliateURL}`）の両方で使用されている**。したがって **DMM 側の 990 計上だけでは、クリックされた面を一覧系と断定できない**
  - なお concierge メインCTAの placement は `"cta"`（L713）だが、8/1 のGA4には `cta` placement も **0件**

---

## 6. HUMAN枠として起案（クリックによる検証）

CTO はクリックを実施できないため、以下を **HUMAN枠**として起案する。**実施は CSO 承認後**。

### 案A（推奨度は付さない・送出の直接観測）
1. HUMAN が通常の Chrome で `https://app.vodnavi.jp/` を開く
2. DevTools Console で**一時的な観測ラッパー**を実行（ページを離れれば消える・コード変更なし）:
   ```js
   const _g = window.gtag;
   window.gtag = function(){ console.log('GTAG-CALL', JSON.stringify([...arguments])); return _g.apply(this, arguments); };
   ```
3. トップの一覧系CTA「今すぐ視聴 →」を**1回クリック**（新規タブで FANZA へ遷移する）
4. 元タブの Console に `GTAG-CALL` が出るか、その第3引数に `placement:"list_top_card_cta"` が含まれるかを確認
5. 結果（Console出力の原文）を CTO へ共有

### 案B（GA4計上での確認）
1. HUMAN がトップの一覧系CTAを1回クリック（時刻を記録）
2. 翌日、CTO が GA4 で `list_top_card_cta` の計上有無を確認
- ※案Bは 8/1 と同一手順のため、**n=1 の再現**にとどまる

### いずれの案でも発生する副作用（事前明記）
- クリック1件が **DMM af_id=990 に計上**される → **自クリック台帳へ記録し、評価対象から除外**する必要がある
- 台帳既知: **検証用Chromeは GA4 `/g/collect` を送信しない**ため、案Aの `GTAG-CALL` は「gtag が呼ばれたこと」までを保証し、**GA4計上そのものの保証にはならない**

---

> 本記録は検査結果の転記と、指示に基づく HUMAN 枠起案のみ。修正の実装・原因の断定は行っていない。
