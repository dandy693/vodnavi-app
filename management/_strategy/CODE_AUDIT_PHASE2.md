---
audit_date: "2026-06-25"
target: "Next.js 16 Component Structure for GTM Insertion"
status: "grounded"
method: "実ソース物理 Read（推測ゼロ）"
---
# Phase-2 コード構造・データレイヤー挿入ポイント物理監査レポート

> 全項目を実ファイルの Read で物理確認。行番号・コンポーネント名・import 文・関数名は実体。
> ⚠️ 本監査で **`METRICS_IMPLEMENTATION_2026_06_24.md` の前提3点が実コードと相違**することが判明（後述）。Phase-2 実装は本レポートの実態に合わせて補正すること。

## 0. 結論サマリ（spec との差分 ＝ 最重要）
1. **`placement` は新規実装不要・既に存在**。金CTAは生 `<a>` ではなく client ラッパー `FanzaAffiliateLink`（`src/components/fanza-affiliate-link.tsx`）で、`placement` は**型付き prop として既に実装済**（値: `detail_main_cta` / `detail_sample` / `detail_sticky_cta`）。さらに `onClick` で **`trackProductClick` に placement を既に送信済**（`product_click` イベントは placement 保有）。
   - 真の穴は2つだけ: (a) `ai_affiliate_click` は placement を**送っていない**（`AiAffiliateClickPayload` に項目が無い / analytics.ts L97-105）。(b) GA4 管理画面で `placement` が**カスタムディメンション未登録**のため監査表に出ない。→ spec の「`data-placement` DOM 属性を新規付与」は不要。1行追加（payload 拡張＋呼出し）＋GA4登録で足りる。
2. **年齢ゲートは実在 client コンポーネント**で、`window.dataLayer.push` を直接書く必要はない。既存の正規センダー **`track(eventName, params)`（`src/lib/analytics.ts`）** を import して呼ぶのが既存流儀（gtag 直叩き＋非本番no-opガード内包）。
3. **「ファーストビュー昇格」は部分的に着手済**。メインCTA直下にコンシェルジュCTA（L406-414）、モバイルには sticky CTA バー（L560-594）が既存。コード内コメント L550-559 が「商品画像+H1 が iPhone FV を占有し両CTAが ~245-320px 下に埋もれる」構造課題を明記済。Phase-2 はこの既存構造への増分改修。

## 1. 作品詳細ページ（`app-concierge/src/app/(site)/works/[floor]/[id]/page.tsx`）の構造解析

- **server component**（`export default async function WorkDetailPage`, L167）。CTA等の計測は client ラッパー経由。
- **金CTA（アフィリエイトリンク）の描画**: コンポーネント `FanzaAffiliateLink`（import L4）。3箇所で使用、各々 `placement` prop 保有:
  | 用途 | 行 | placement 値 |
  |---|---|---|
  | メインCTA | L375-391 | `detail_main_cta`（L380） |
  | サンプル画像 | L425-441 | `detail_sample`（L431） |
  | sticky モバイルCTA | L569-584 | `detail_sticky_cta`（L574） |
- **回遊ハブリンク（既存・M-06）**: 出演女優 `<Link href={\`/actresses/${p.id}\`}>`（L307-313）、ジャンル `<Link href={\`/genres/${g.id}\`}>`（L323-329）、ジャンル breadcrumb（L246-250）、関連作「ジャンル一覧へ」（L503-509）。**いずれも本文中段以降**＝3秒のFV外。
- **コンシェルジュCTA**: `ConciergeCtaLink`（import L6, メインCTA直下 L406-414 / sticky L585-593）, `ConciergeCtaPanel`（L492）。
- **`data-placement` 昇格の物理挿入ポイント**: 「FVエリア」= `<section className="grid ...">`（L256-416）内、H1（L271-273）〜価格（L353-364）〜メインCTA（L375）。回遊ハブを **L351 の `<Separator>` 直前 or H1 直下（L273 直後）へ複製配置**すれば3秒視界に入る。「既存ボディ下部」= L494 以降の関連作セクション。

## 2. 年齢確認ゲート（GTMイベント発火位置）の構造解析

ゲートは**3系統**実在（用途別）:
| ファイル | 適用範囲 | 種別 |
|---|---|---|
| `src/components/age-gate-overlay.tsx` | `(site)` 全域（/works /genres /home 等）= **流入の96.99%が着地する主面** | client overlay |
| `src/app/age-gate/age-gate-modal.tsx` | `/age-gate` ページ | client modal |
| `src/components/concierge/concierge-gate.tsx` | `/concierge` 専用 | client gate |
| `src/proxy.ts` ＋ `src/app/api/age-gate/route.ts` | API遮断（HTTP 403）＋ cookie 発行 | server |

**`dataLayer.push` を置くべき実体は overlay/modal の client 関数**（`track()` を import して使用）:

### `age-gate-overlay.tsx`（主面・最優先）
- `age_gate_view`: `open`（L72 = `mounted && !verified`）が真でマウントされた時。**L74 の body-lock `useEffect` 内（L74-81）** が `open` をトリガに走るので、同 effect に1行追加が最小侵襲。
- `age_gate_agree`: `confirm()`（L85-105）の **`res.ok` 成功後・`window.dispatchEvent(...)` 直前（L100付近）**。
- `age_gate_bounce`: 「いいえ（退出）」`<a href="https://www.google.com/">`（L145-151）に `onClick` 追加。離脱直前のため **`transport_type: "beacon"`** 必須。

### `age-gate-modal.tsx`（/age-gate）
- `age_gate_view`: 現状 `useState` のみ（`useEffect` 未使用）。mount 計測には `useEffect` を1本追加。
- `age_gate_agree`: `confirm()`（L18-39）の **`window.location.href = next`（L34）直前**。
- `age_gate_bounce`: 「いいえ」`<a>`（L71-77）に beacon onClick。

> 遮断率 = `age_gate_bounce / age_gate_view` が初めて算出可能。GA4監査時点で「専用イベント不在＝測定不可」だったボトルネックの解錠点はここ。

## 3. 次段の安全改修への接続（Next.js 16 fork ビルド非破壊の手順）

- **環境前提**: `app-concierge` は非標準 Next.js 16 fork（`AGENTS.md`: 実装前に `node_modules/next/dist/docs/` 参照必須）。`revalidate = 300`（page.tsx L39）の ISR、server/client 境界（`"use client"`）を壊さないこと。
- **計測の正規経路**: 生 `window.dataLayer.push({event})` ではなく **`import { track } from "@/lib/analytics"` → `track("age_gate_view", {...})`** を使う（既存全イベントがこの経路。非本番/localhost で no-op するデータ汚染ガード L49-56 を自動継承）。
- **placement on ai_affiliate_click**: `analytics.ts` の `AiAffiliateClickPayload`（L97-105）に `placement?: string` を追加 → `fanza-affiliate-link.tsx` の `trackAiAffiliateClick(...)`（L54-61）に `placement` を渡す。これだけで `product_click` と同一の placement 軸が `ai_affiliate_click` にも乗る。
- **GA4 側作業（コード外）**: `placement` / `age_gate_*` を GA4 管理画面でカスタムディメンション・イベントとして登録しないと監査表に出ない（既存登録は asp_name/source/intent の3件のみ）。
- **検証**: 改修後 `npx tsc --noEmit`（型安全）→ 本番デプロイ後に `track-dev` ではなく本番 gtag 送信を DevTools / GA4 DebugView で物理確認。moterist.com には一切触れない（本改修は app-concierge 配下のみ）。
