---
title: "GSC / GA4 / GTM 計測インフラ完全性監査・不備是正仕様書"
date: "2026-06-25"
author: "VODNAVI CSO"
status: "approved"
---

# データ分析インフラ完全性 物理チェックリスト ＆ 修正仕様

## 1. 物理確認された不備と現在地
1. **GSC（Google Search Console）**: サイトマップは健全。**本番 `sitemap.xml` の `<loc>` 実測＝3,010 URL**（単一 urlset / curl 実測 2026-06-25）。ただし直近約24時間（2026-06-24 16:43Z〜）の DMM 資格情報拒否に伴い、ハブ/詳細ページがクローラへ一時的に 404 を返していたため、**Google 側の評価キャッシュに当該 404 が残存しているリスクあり**（全ルートは復旧済 → 再クロール待ち。[[project_fanza_api_400_global_outage]]）。
2. **GA4（Google Analytics 4）**: `placement`（クリック位置識別）・`gate`（制限ゲート識別）のカスタムディメンション登録は**完了・生存確認済**（Chrome 経由で登録、[[project_gtm_n6zdk9lr_is_fake]]）。既存 `asp_name`/`source`/`intent` と合わせ計 5 件。
3. **GTM（Google タグマネージャー）**: コンテナ **GTM-TKDHM348 はタグ・トリガー 0 の空コンテナ**。本番 GA4 取り込みはアプリ直 gtag（`track()`→`window.gtag('event',...)`）経由で、GTM は経由していない。よって **スクロール率（25/50/75%）が一切計測されていない欠損**が存在（[[project_ga4_user_behavior_baseline]] の計測の穴と一致）。

## 2. 修正仕様（方針B：アプリ側スクロールカスタム実装）
空の GTM コンテナに依存せず、Next.js（アプリ側）で 25/50/75% の読了率を計測する。共通レイアウト or クライアント計測ラッパに以下のリスナーをマウントする。

```typescript
// 実装イメージ：スクロール深度カスタムトリガー
// 注1: track() は非本番/localhost で no-op（データ汚染ガード, analytics.ts）。
// 注2: scroll イベントは passive + rAF スロットルで発火頻度を抑える（メインスレッド保護）。
// 注3: dispatched フラグでセッション内1回のみ発火（25/50/75 各1回）。
if (typeof window !== "undefined") {
  const dispatched = { p25: false, p50: false, p75: false };
  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight =
          document.documentElement.scrollHeight -
          document.documentElement.clientHeight;
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

        if (pct >= 25 && !dispatched.p25) {
          track("scroll_custom", { percent_scrolled: 25 });
          dispatched.p25 = true;
        }
        if (pct >= 50 && !dispatched.p50) {
          track("scroll_custom", { percent_scrolled: 50 });
          dispatched.p50 = true;
        }
        if (pct >= 75 && !dispatched.p75) {
          track("scroll_custom", { percent_scrolled: 75 });
          dispatched.p75 = true;
        }
        ticking = false;
      });
    },
    { passive: true },
  );
}
```

## 3. GA4 管理画面側での最終追加登録
上記修正コードの本番反映後、GA4 のカスタム定義に以下を追加登録することで、読了率の計測経路が完成する。

- **【ディメンション名】**: `percent_scrolled`（範囲: イベント）
- イベント `scroll_custom` が `percent_scrolled` パラメータ（25/50/75）を伴って送出される。GA4 既定の拡張計測 `scroll`（90% 固定）とは別系統で、より浅い読了段階を捕捉する。

## 4. 実装ステータス（捏造回避）
- 本書は**仕様（spec）であり、スクロール計測コードは未実装**。本コミットでは `analytics.ts` 等の挙動を一切変更していない。実装は別途 Phase-3 タスク（TASK_BOARD 参照）として着手する。
- §1 の数値（sitemap 3,010 / カスタムディメンション 5 件 / GTM 空）はいずれも物理実測・確認済。
