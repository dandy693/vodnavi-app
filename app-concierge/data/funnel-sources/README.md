# funnel-sources/ — CVR ファネル CSV 投入箱

`scripts/analyze-cvr-funnel.ts` がここに置かれた CSV を自動読込し、
`CCO_TARGET_CIDS` (27 cids) と `content_id` で突合して `FunnelMetricsRaw`
へマージする。

## 4 ファイル契約

| ファイル | ヘッダ | 出典 |
|---|---|---|
| `sc-clicks.csv` | `content_id,clicks,impressions,ctr,avg_position` | Search Console export (pages tab) |
| `ga4-pageviews.csv` | `content_id,screen_views,sessions,avg_engagement_sec` | GA4 → Explore → Free-form (per content_id) |
| `ga4-events.csv` | `content_id,event_name,count` | GA4 events、`event_name` で動的分流 |
| `dmm-sales.csv` | `content_id,gross,commission,order_count` | DMM アフィリエイト管理画面 export |

## ga4-events.csv の event_name マッピング

| event_name | 流れ込むフィールド |
|---|---|
| `affiliate_click` | `ga4AffiliateClicks` |
| `concierge_click` | `ga4ConciergeClicks` |
| (上記以外) | 無視 (将来拡張余地) |

GA4 のオリジナル event 名は `product_click` (placement=detail_main_cta) や
`concierge_entry_click` (source=app_direct) など長いが、CSV では集計時に
`affiliate_click` / `concierge_click` に正規化して投入する想定。

## 安全弁

- ファイル不在 → ローダは無視、全フィールド `undefined` のままシード値
- 該当 cid 行欠落 → 同上
- ヘッダ行は skip (1 行目)
- 空行 / `#` 始まり行は skip (コメント許容)
- 数値パース失敗 (`NaN` 等) → `undefined`

## 走らせ方

```powershell
cd app-concierge
node --experimental-strip-types --no-warnings scripts/analyze-cvr-funnel.ts
```

CSV が空 (現状) のままなら 27 行レポートが全列 `-` で出力される。
CSV を投入すると該当列が数値で埋まる。

## .gitignore 方針

本ディレクトリ配下の CSV 自体は git に含める前提（小さなレポート）。
個人情報や売上明細 (DMM dashboard 内訳) を入れる場合は、
別途 `.gitignore` 化を CSO 判断で行うこと。
