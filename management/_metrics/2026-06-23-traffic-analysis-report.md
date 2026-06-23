---
audit_date: "2026-06-23"
metric_target: "GA4 / GSC Traffic & Index Breakdown"
chrome_automation: true
status: "grounded"
account: "moterist.com@gmail.com (authuser=2)"
ga4_property: "p489519780 (vodnavi.jp / G-GG7JV9MJRW, app+front クロスドメイン共有)"
ga4_window: "過去28日間 2026-05-26〜2026-06-22"
gsc_property: "sc-domain:vodnavi.jp"
gsc_last_updated: "2026-06-12"
grounding_method: "claude-in-chrome MCP による GA4 / Search Console UI の物理スキャン（全数値スクリーンショット実測）"
---
# GA4 / GSC 物理トラフィック・インデックスボトルネック特定レポート

> 計測規約: 本レポートの数値は全て GA4 / GSC の画面実測値（物理ファクト）のみ。推測・プレースホルダ・曖昧表現はゼロ。
> 検証アカウント: **moterist.com@gmail.com**（個人 hdktchkw33@gmail.com で開いていた別クライアント coushilift.com property を検出し、正規アカウントへ切替後に取得）。

## 1. Google Analytics 4 流入・計測発火の実測値（28日間: 5/26〜6/22, vodnavi.jp p489519780）

### 1-1. ヘッドライン
- **アクティブユーザー数**: 4,004
- **新規ユーザー数**: 3,965
- **総ページビュー（page_view 表示回数 合計）**: 9,720
- **イベント数**: 約22,000（2.2万）
- **平均エンゲージメント時間**: 7秒
- **リアルタイム**: 取得時点 1 アクティブユーザー（タグ生存・発火を物理確認）

### 1-2. moterist.com（?source=moterist）由来の正確な流入数
- **0件**。セッションの参照元/メディア 一覧に `moterist.com` は一切出現しない。
- 総セッション 4,203 のチャネル内訳:
  - Organic Search: 3,948（93.93%）
  - Direct: 240（5.71%）
  - Unassigned: 16（0.38%）
  - Referral: 8（0.19%）
- Referral 8件の実体は全て検索ポータル: home.kingsoft.jp / search.brave.com / search.nifty.com / service.smt.docomo.ne.jp / websearch.excite.co.jp。moterist は含まれない。
- → 集客の実体は vodnavi.jp 自身の Organic Search（93.93%）。moterist 送客は物理ゼロ（[[project_moterist_zero_search_inflow]] を 28日窓で再確証）。

### 1-3. 計測タグの発火エラー / クロスドメイン千切れの有無
- page_view は正常発火（28日で 9,720 views）。年齢確認ゲート（proxy.ts）による遮断・ドロップの兆候なし。
- セッションの参照元一覧に **vodnavi.jp / app.vodnavi.jp の自己参照（self-referral）が出現しない** → クロスドメインリンカーの重大断裂の兆候なし。Direct も 5.71% と健全（断裂時に膨張する self-referral / Direct 異常inflation なし）。[[project_funnel_intra_app_reclassified]]（cross-domain 1.4% / intra-app 98.6%）と整合。
- 上位ページ（表示回数）: /works/videoa/lulu00423（380）, /（home, 359）, /works/anime/h_1785trdy00021（206）, /works/videoa/gqhb00024（205）, /works/videoa/sivr00490（117）… → 全て作品詳細ページ + home。**/genres/ ・ /actresses/ ハブは上位に一切出現しない**（ハブのトラフィックは実質ゼロ）。

## 2. Search Console インデックス登録の現在地（sc-domain:vodnavi.jp, 最終更新 2026/06/12）

### 2-1. 全体
- **登録済み（インデックス済）: 3,290**
- **未登録: 2,300**（理由 9 種）

### 2-2. 未登録の理由別内訳（実測）
| 理由 | 件数 |
|---|---|
| 検出 - インデックス未登録 | **737** |
| クロール済み - インデックス未登録 | 553 |
| 重複（Google が別ページを正規選択） | 43 |
| ページにリダイレクトがあります | 1 |
| 重複（ユーザーが正規未選択） | 0 |
| （その他＋404 等で残差 = 計 2,300） | 残差 |

### 2-3. M-05 女優ハブの状態（per-URL 物理確認）
- 「検出 - インデックス未登録」737件のサンプル URL に、M-05 で投入した優先女優ハブが**ほぼ完全一致で滞留**していることを確認:
  - /actresses/1006606, /1012910, /1015386, /1038396, /1038712, /1044974, /1048559, /1053256, /1055230 …（[[project_actress_hub_first_measurement]] の item_key=CAMYFiAC と同一バケット、2026-06-22-priority-actresses.md Group A と一致）
- 状態の意味: Google は sitemap 経由で URL を**発見済みだが、クロール／インデックスをまだ行っていない**（= 検索結果に出ない＝検索露出ゼロ）。

## 3. 構造的真因の結論（ファクトベース）
- **アクセスが伸びない真因は CTR ではなく「インデックス未登録による検索露出ゼロ」**。M-05 女優ハブは「検出-インデックス未登録」737バケットに滞留し、検索結果に表示される母数が存在しない。editorialコピーを注入しても、未インデックスのままでは検索流入は発生し得ない。
- ボトルネックの本質は**クロール予算・立ち上げ初期の経過時間**（[[project_actress_hub_first_measurement]] と整合）。CTR 改善施策より、クロール優先度の引き上げ（内部リンク網による発見性強化＝M-06）が先行課題。
- 集客の実体は vodnavi.jp Organic Search（93.93%）。moterist 送客はゼロのため、戦略前提を「集客=vodnavi.jp Organic」に固定して施策設計すべき。

## 4. 検証スコープと留保（誇張回避）
- GSC データは**最終更新 2026/06/12** であり、6/22 投入の新ジャンル（524 義母 等18件）・6/22 注入の女優 editorial（56配列）は**まだ反映されていない可能性が高い**。「50ジャンル/56女優が登録済みへ移行したか」の最終判定は、GSC 次回更新後（6/12以降のクロール反映後）の再スキャンが必要。
- per-URL で物理確認したのは女優ハブ（複数 M-05 ID）。**ジャンルハブの個別ドリルダウンは未実施**（6/12 データは 6/22 のジャンル拡張前のため、現時点で個別判定は不能）。同一のクロール予算ダイナミクスが当てはまると推定されるが、断定はしない。
- 「年齢確認での page_view 二重発火」は、本監査では総 page_view 9,720 とセッション 4,203 の比（≒2.3 views/session）が異常inflationを示さないことから**二重発火の兆候なし**と判定。ただし event 単位の重複ID精査は未実施（必要なら DebugView で別途）。

## 5. 次アクション接続
- M-06（Next.js 自動セマンティック内部リンク網の最適化）を執行フェーズへ移行。狙いは「検出-インデックス未登録」737バケットの**クロール発見性を内部リンクで引き上げる**こと（moterist は完全凍結維持 [[project_moterist_mass_overwrite_plan]]）。
- GSC 次回更新後に本レポートを再スキャンし、737/553 バケットの増減と新規ジャンル/女優の登録移行を測定（M-06 効果検証の基準値として本レポートの数値を採用）。
