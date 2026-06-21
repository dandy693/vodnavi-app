---
audit_date: "2026-06-21"
metric_target: "A-04 (Metrics)"
data_source: "GA4 自由形式探索 kJIj6zkLT8SK7TSKYsMvCA (authuser=2 / moterist.com@gmail.com)"
window: "過去7日間 2026-06-14〜2026-06-20"
ui_realignment_verified: true
status: "grounded"
---
# GA4 ページパス別帰属特定 ＆ UI改修直後効果検証レポート

> 取得手法: 探索 kJIj6zkLT8SK7TSKYsMvCA の行ディメンションに「ページパスとスクリーン クラス」を
> 追加（イベント名 × page_path のクロス表）、表示行数 250、イベント名 昇順ソートで物理目視。
> すべて実測値。推測箇所は明示的に「推定」「データアクセス要」と隔離する。

## 1. ページパス別帰属 — 物理実測値（7日窓 6/14-6/20）

### 1-1. ai_affiliate_click（FANZA アフィリエイト送出 = 成約直前クリック / 79 events・67 users）
**100% が作品詳細ページ `/works/[floor]/[id]` 由来。女優ハブ・ジャンルハブ由来は 0 件。**

| ページパス区分 | イベント数 | 比率 |
|---|---|---|
| `/works/videoa/*` | 59 | 74.7% |
| `/works/amateur/*` | 16 | 20.3% |
| `/works/nikkatsu/*` | 3 | 3.8% |
| `/works/anime/*` | 1 | 1.3% |
| **`/works/*` 合計** | **79** | **100%** |
| `/actresses/*`（女優ハブ） | **0** | 0% |
| `/genres/*`（ジャンルハブ） | **0** | 0% |

（60 行すべてが `/works/...`。イベント数合計 = 79 で GA4 集計の ai_affiliate_click 総数と一致。）

### 1-2. concierge_entry_click（詳細→コンシェルジュ送客 / 7 events）
**100% が `/works/[floor]/[id]` 由来**（dss00247 / 1dldss00518 / 42vrpn00011 / dsod00028 /
h_1724a176b00020 / real00998 / sykh00194）。ハブ由来 0 件。
→ ConciergeCtaLink が作品詳細にのみ設置されている実装と整合。

### 1-3. click（汎用クリック / 計 62 events 相当）
`/works/*` が支配的。ハブ由来は `/actresses/1102910` 1 件、`/genres/6941` 1 件のみ。

### 1-4. ai_session_start（コンシェルジュ起動 / 8 events・7 users）
**100% が `/concierge`**（session-init.tsx の着地時発火と整合）。

### 1-5. product_click（購買意向 / 79 events・67 users）の単独 page_path 内訳
- 状態: **直接実数は データアクセス要（未取得）**。
- 理由: 表示行数の上限（250）に対し、昇順ソートでは product_click の前に first_visit / page_view
  の数百 path 行が入り当該行に到達できない。かつ event_name=product_click の単独フィルタ適用には
  GA4 探索の「フィルタ」drop-zone への drag が必要だが、当 automation インターフェースから
  当該パネルが操作不能（既知の UI 限界。2026-06-21 revenue-attribution.md と同根）。
- 合理推定（断定ではない）: product_click はコード上 WorkCardCta の同一 `<a>` で ai_affiliate_click
  と同時発火するため、その **affiliate-intent 部分は 1-1 と同分布（≒100% /works）** と推定できる。
  ただし product_click は RecommendationCard の内部 nav クリック（placement="card"）でも発火するため、
  内部回遊分を含む厳密内訳は別途フィルタ取得を要する。

## 2. PR #46（3チャネル動的マイクロコピー）投入後のリアルタイム検証
- **本番HTML伝播時刻**: 2026-06-21 19:43 JST（"言葉にしづらい今夜の気分も" の live 反映を curl 実測）。
- **ai_session_start 起動率の改修後効果**: **現データでは測定不可能（次週窓 OPEN）**。
  - 理由: 本探索ウィンドウは 6/14-6/20 で、デプロイ日 6/21 を**含まない**。かつデプロイから数時間しか
    経過しておらず、有意な時系列比較母数が存在しない。
  - 改修前ベースライン（記録用）: 7日窓で ai_session_start 7 users / 8 events、page_view 794 users。
- **戦略的判断**: 金CTAの光彩強化＋ctaWhisper が起動率 0.88% をどこまで押し上げるかは、次回以降の
  週次データ駆動PDCA（6/21 を含む窓）にて before/after の時系列比較で実測する。本コミット単体での
  効果は断定しない。

## 3. 戦略的含意（実数ベース）
- 成約直前のアフィリエイトクリックも、コンシェルジュ送客も、**現状 100% が作品詳細 `/works/*` 由来**。
- F-12 で立ち上げた女優/ジャンルハブは当窓で first_visit を数件受けたが（/actresses 約5・/genres 約8）、
  **アフィリエイトクリック 0・コンシェルジュ起動 0**。
  → ハブは LLMO/SEO の将来引用流入を作る賭けであり、現成約ドライバではないという既存仮説
  （STRATEGY_BRIEF_LLMO.md）を実数で裏付け。短期成約最適化の主戦場は依然 `/works` 詳細ページ。
- `source × intent` クロス集計: app.vodnavi.jp が 99.6% を占めるため優先度「低」で OPEN 据え置き。

## 4. 監査メタ
- 本レポート取得のため探索 kJIj6zkLT8SK7TSKYsMvCA の行構成に page_path を追加した（透明性のため明記）。
  named-event 単独カウントが必要な場合は page_path ディメンションを行から外して原状回帰すること。
