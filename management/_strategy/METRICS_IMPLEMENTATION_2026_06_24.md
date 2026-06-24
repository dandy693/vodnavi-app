---
title: "GA4/GTM 4大計測拡張に伴うデータレイヤー・コンポーネント実装仕様"
date: "2026-06-24"
author: "VODNAVI CSO"
status: "approved"
---

# 4大計測インフラ 実装コード仕様

> 本書は `management/_strategy/STRATEGY_BRIEF_2026_06_24.md`（4つの計測の穴）の実装仕様。
> 実測根拠は `management/_metrics/2026-06-24-user-behavior-analysis.md`。

## 1. 金CTAクリック位置識別 (`placement`)

作品詳細ページ（`app-concierge/src/app/(site)/works/[floor]/[id]/page.tsx` 内のコンポーネント）において、金CTA（アフィリエイトリンク）に以下のデータ属性を付与し、GTMイベントをトリガーする。

### 実装イメージ (Data Attribute 方式)

```tsx
// ファーストビュー（昇格エリア）
<a href={affiliateUrl} data-placement="body_top" className="gtm-affiliate-link">...</a>

// 既存エリア
<a href={affiliateUrl} data-placement="body_bottom" className="gtm-affiliate-link">...</a>
```

GTM側で `element.dataset.placement` をカスタム変数としてキャプチャし、`ai_affiliate_click` イベントのパラメータ（`placement` = header / body_top / body_bottom / footer）として GA4 へ送信する。

> 補足: 現状 `ai_affiliate_click` に登録済みのカスタム次元は ASP Name (=fanza) のみで設置位置が不明（2026-06-24 監査で確認）。本パラメータ追加により header/body/footer 別の発火内訳が初めて測定可能になる。

## 2. 年齢確認ゲートイベント (`age_gate_*`)

年齢確認ポップアップ（年齢ゲートのクライアント描画コンポーネント。API遮断側は `proxy.ts`）のライフサイクルに連動させ、`window.dataLayer` へ以下のオブジェクトをインジェクトする。

### ① ゲート表示時

```typescript
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  event: "age_gate_view",
});
```

### ② 「18歳以上（同意）」クリック時

```typescript
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  event: "age_gate_agree",
});
```

### ③ 離脱 / 否定的な挙動時（18歳未満ボタンクリック、またはブラウザバック抑止イベント時）

```typescript
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  event: "age_gate_bounce",
});
```

> 補足: 現状はゲート専用イベントが不在で離脱率が物理測定不可（`session_start` はゲート前で発火するため GA 捕捉外）。この3イベントにより遮断率 = `age_gate_bounce / age_gate_view` が初めて算出可能になる。

## 3. スクロール率（25% / 50% / 75%）

GTM標準のスクロール距離トリガーを適用するため、Next.js（アプリケーション）側への追加コード実装は不要。GTMコンテナ側で上記割合（25, 50, 75）のトリガーを有効化し、読了パラメータとして計測する。

> 補足: 現状 `scroll` は GA4 拡張計測の 90% 単発のみ（25/50/75 は閾値未送信）。GTM側トリガー追加で離脱ポイントを 25% 刻みで可視化する。

## 4. 外部遷移（アウトバウンドリンククリック）およびドメイン識別

- `vodnavi.jp`（メディア）から `app.vodnavi.jp`（成約アプリ）への遷移は、GA4 クロスドメイン設定により Cookie を健全に引き継ぐ。
- 完全凍結された `moterist.com` からの流入、および FANZA 等の外部アフィリエイトリンクへの遷移（アウトバウンド）は、GTM の「リンククリックトリガー」によって自動捕捉し、Page Hostname およびカスタムパラメータ（`?source=moterist`）で識別・隔離して計測する。

> 補足: 2026-06-06 監査時点で moterist.com 経由の検索流入は実質ゼロ（`project_moterist_zero_search_inflow`）。本識別タグは流入が発生した場合に冷徹に分離計測するための保険であり、現状の主集客は vodnavi.jp。
