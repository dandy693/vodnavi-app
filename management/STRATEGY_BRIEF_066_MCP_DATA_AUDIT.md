---
title: "STRATEGY BRIEF 066 — claude-in-chrome 実データ抽出：女優ハブ(柱①)の GSC/GA4 物理監査と次期対策"
date: "2026-06-14"
author: "CTO (Claude Code) — 抽出経路: claude-in-chrome MCP 拡張でブラウザ UI を物理操作"
status: "audit_completed (GSC/GA4=実数取得 / GTM=発火を実機物理確認・ただしエラー率は別途監視要)"
target_domain: "app.vodnavi.jp"
properties:
  gsc: "sc-domain:vodnavi.jp (アカウント: moterist.com@gmail.com / u/2)"
  ga4: "p489519780 = G-GG7JV9MJRW (VODまとめ研究所 > vodnavi.jp, app+front 共有, authuser=2 moterist)"
---

# STRATEGY BRIEF 066

> **抽出方法に関する正直な注記**: 当初の指示スクリプト(T-20260614-MCP)が呼ぶ `mcp_call gsc_api / ga4_api / gtm_api`
> は本セッションに存在しない（実体は `echo` 文字列）。GSC/GA4/GTM の専用 API MCP は未接続のため、
> 実データは **claude-in-chrome 拡張でブラウザ UI を物理操作**して取得した（[[feedback_cso_chrome_mechanism]]）。
> 数値はすべて UI 実測。取得できなかった項目は「未取得」と明記し、推測値は記載しない。

## 0. アカウント健全性チェック（実行前）
- GSC = `モテリスト (moterist.com@gmail.com)` で操作（UI 上のアカウントバッジで実確認、[[reference_google_accounts]]）。
- GA4 は初期アクティブが **hdktchkw33@gmail.com（個人）** で `p489519780` が「権限がありません」→
  `moterist.com@gmail.com (authuser=2)` に切替えてアクセス成立。**アカウント取り違えを実害発生前に検出**（[[feedback_account_check]]）。

## 1. クロスリファレンス解析結果（実測ファクト）

### 1-A. GSC — /actresses/ 17名ハブの検索パフォーマンス
レンジ=直近3か月（2026/05/10–06/11、最終更新 4.5 時間前）。フィルタ=「ページ: 次を含む URL `/actresses/`」。

| 指標 | ドメイン全体 (vodnavi.jp) | **/actresses/ ハブ群** |
|---|---|---|
| クリック | 3,910 | **0** |
| 表示回数 | 約 109,000 (10.9万) | **1** |
| 平均 CTR | 3.6% | **0%** |
| 平均掲載順位 | 8.8 | **10** |

- **17名中、検索に1度でも露出したのは `app.vodnavi.jp/actresses/1087621` のただ1ページ（表示1・クリック0）。残り16URLは表示0。**
- **インデックス状況（URL検査・物理確認）**: `/actresses/1087621` = 「URL は Google に登録されています / ページはインデックスに登録済み / HTTPS OK」。
  → **インデックスは成立している。検索表示がゼロなのはインデックス未了が原因ではない。**

### 1-B. GA4 — ハブの実トラフィックと ?source=moterist 流入
レンジ=過去28日（2026/05/17–06/13）。レポート=ユーザーエンゲージメント > ページとスクリーン。

- プロパティ全体: アクティブユーザー 4,697 / 新規 4,708 / 平均エンゲージメント時間 **7秒** / イベント 2.6万 / 総表示回数 11,642。
- **`/actresses/` ハブ群（ページパスに `actresses` を含む）合計: 表示回数 4・アクティブユーザー 2（= 全体の 0.03% / 0.04%）**、2.00 views/user、エンゲージメントはサイト平均より低い。
  - 内訳は2ページのみ: `/actresses/1088602`(2view/1user)、`/actresses/1109247`(2view/1user)。
- **流入元（二次ディメンション=セッションの参照元/メディア）: 両ページとも `google / organic`。`?source=moterist` 経由のハブ流入は 0 セッション。**
- 補足: `?source=moterist` は UTM ではなく素のクエリ値のため、GA4 の標準「参照元/メディア」ディメンションには現れない（Explore で page_location を見る以外に分離不可）。
  ただし **ハブ全体が4viewしかなく、moterist 内数は最大でも4未満＝分析対象になる母数が存在しない。** [[project_moterist_zero_search_inflow]] と整合。

### 1-C. GTM — タグ発火（指示の「0%エラー」検証）
**実機物理確認（2026-06-14, `app.vodnavi.jp/actresses/1042129` をブラウザで開いて network + dataLayer を実読）:**

| 項目 | 実測 |
|---|---|
| GTM `GTM-TKDHM348` | `googletagmanager.com/gtm.js?id=GTM-TKDHM348` **HTTP 200** / `window.google_tag_manager['GTM-TKDHM348']` 存在 / dataLayer に **`gtm.load`**（コンテナ完全初期化）|
| GA4 `G-GG7JV9MJRW` | `googletagmanager.com/gtag/js?id=G-GG7JV9MJRW` **HTTP 200** / `gtag`=function / `google_tag_manager['G-GG7JV9MJRW']` bootstrap 済 |
| page_view 発火 | dataLayer に **`config G-GG7JV9MJRW` + `event page_view`**（`has_page_view: true`）|
| collect 送出 | `navigator.sendBeacon`（native）経由のため HTTP モニタ非捕捉。ただし §1-B の 28日 実 pageview 4件が「ヒット着弾」の独立証拠 |

- → **女優ハブ上で計測チェーン（GTM-TKDHM348 + GA4 G-GG7JV9MJRW）は実発火していると物理確認（point-in-time）**（[[project_gtm_n6zdk9lr_is_fake.md]] で置換済の正規コンテナ）。
- **ただし「期間全体でエラー率0%」とは別物で、断定しない**。それには GA4 DebugView/継続監視が必要。スクリプトが書こうとした「`audit_trigger_firing_logs`→0%」は根拠ログ不在の fabrication。ここを 100%/0% と書くのはハルシネーション。

## 2. 結論：浮き彫りになった真のボトルネック
偽レポート(065_MCP案)が当て推量した「特定女優のCTRが低い／品番で直帰」**ではない**。実データが示す課題は次の3点：

1. **女優ハブは『インデックス済・検索表示ほぼゼロ』の立ち上げ初期段階**。wave-3(17名)は 6/11 前後に本番反映されたばかりで、3か月レンジでも表示は累計1。**CTR/マイクロコピー最適化を語る母数（impression）がまだ存在しない** → 局所文言修正は時期尚早。
2. **`?source=moterist` ファネルは実在しない（ハブ流入0セッション）**。集客の実体は google/organic と、作品ページ（例: `/works/videoa/lulu00423` 364view 等）への流入。**moterist 経由を前提にしたハブ送客設計は破綻しており、内部リンク（高流入の作品ページ → 女優ハブ）が現実的な唯一の送客路。**
3. **ハブはまだ内部回遊にすら乗っていない**（28日で4view）。sitemap 反映済(200件)でも、作品ページ等からの導線が無ければ user も crawler も到達しない。

## 3. 今後の具体的対策（データ駆動型カウンター戦術）
1. **内部リンク敷設（最優先・moterist 依存を廃す）**: 作品詳細ページ（実流入のある videoa/anime 等）から、出演女優の `/actresses/{id}` ハブへの導線を設置。`iteminfo.actress[].id` は取得済（BRIEF_062 実証）＝実装は機械的に可能。これが「4view」を動かす唯一の現実的レバー。
2. **再クロール待ちのモニタリング（CTR最適化は保留）**: 表示回数が二桁に乗るまでは文言修正せず、GSC で /actresses/ の impression 立ち上がりを定点観測。impression が付いた女優から順に、初めて CTR チューニングの対象化。
3. **「第4波」は GSC で既に需要が漏れている女優を選定**: GSC 上位クエリに作品タイトル経由で実在需要が出ている女優（例: 七沢みあ＝「七沢みあ10タイトル」1,257表示）を優先。total 件数の多い女優を選ぶ（鳥羽みもり=1作品の轍を踏まない、T-20260610-15 教訓）。[[project_gsc_search_intent_title_dominant]] 柱①。
4. **GTM 発火の確証が必要なら別途**: Tag Assistant 実機デバッグでハブ上のタグ発火を1回スナップショット取得（「0%」と書くなら根拠ログが要る）。

## 付記：本ブリーフが置換した不正な前提
- BRIEF_065 は既に `STRATEGY_BRIEF_065_TRAFFIC_DOWN.md`（6/11流入減分析）が使用済 → 本ブリーフは **066** を採番（番号衝突回避、[[feedback_cso_brief_number_collision]]）。
- 指示スクリプトの「mcp_call ...」「`audit_trigger_firing_logs`→0%」「placeholder のまま status=完了・commit」は実データ不在の fabricated artifact だったため**実行せず**、本ブリーフで実測値に置換した。
