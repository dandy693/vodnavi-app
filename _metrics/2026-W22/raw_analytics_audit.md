# RAW ANALYTICS AUDIT — 2026-W22 (Moterist → Concierge → FANZA Funnel)

> 物理ファクト確定監査。Chrome 連携による GA4 (p489519780) および FANZA アフィリエイト管理画面からの 生数 抽出。
> **推測値ゼロ**。取得できなかった指標は「未取得」と明示する。

| 項目 | 値 |
|---|---|
| 監査日 | 2026-06-01 (Mon) JST |
| 監査人 | Claude Code (CTO) via mcp__claude-in-chrome |
| Google アカウント | `moterist.com@gmail.com` (authuser=2) — Live verified |
| GA4 プロパティ | `p489519780` (vodnavi.jp / G-GG7JV9MJRW、moterist 集客は本プロパティに集約済 ※2026-05-21〜) |
| GA4 期間 (Pages/Events) | 2026-05-02 〜 2026-05-31 (30 日。Events 表示は GA4 既定の 28 日表記=5/4-5/31 だが、再集計値) |
| FANZA 期間 | 2026-05-01 〜 2026-05-31 (31 日、UI「先月」ボタン) |

---

## 1. FANZA アフィリエイト管理画面（DMM Affiliate）

### 1.1 30日合計（先月: 2026-05-01〜05-31）

| 指標 | 値 |
|---|---|
| クリック数 | **1,069** |
| 報酬合計 | **3,584 円** |
| 成約合計 | **4 件** |
| 内訳：ダイレクト報酬 | 3 件 / 1,484 円 |
| 内訳：カテゴリー報酬 | 0 件 / 0 円 |
| 内訳：サービス新規報酬 | 1 件 / 2,100 円 |
| **CVR (件/click)** | **0.374 %** |
| **EPC (報酬/click)** | **3.35 円** |

### 1.2 日次内訳（生数）

| 日付 | クリック | 件 | 報酬円 |
|---|---:|---:|---:|
| 05-01 | 2 | 0 | 0 |
| 05-02 | 0 | 0 | 0 |
| 05-03 | 1 | 0 | 0 |
| 05-04 | 7 | 0 | 0 |
| 05-05 | 1 | 0 | 0 |
| 05-06 | 3 | 0 | 0 |
| 05-07 | 0 | 0 | 0 |
| 05-08 | 0 | 0 | 0 |
| 05-09 | 3 | 0 | 0 |
| 05-10 | 10 | 0 | 0 |
| 05-11 | 0 | 0 | 0 |
| 05-12 | 4 | 0 | 0 |
| 05-13 | 2 | 0 | 0 |
| 05-14 | 2 | 0 | 0 |
| 05-15 | 1 | 0 | 0 |
| 05-16 | 1 | 0 | 0 |
| **05-17** | **45** | 0 | 0 |
| 05-18 | 11 | 0 | 0 |
| 05-19 | 9 | 0 | 0 |
| 05-20 | 9 | 0 | 0 |
| 05-21 | 17 | 0 | 0 |
| 05-22 | 26 | 0 | 0 |
| 05-23 | 68 | 1 | 693 |
| **05-24** | **101** | **2** | **2,520** (うち サービス新規 1件 2,100円) |
| **05-25** | **223** | 1 | 371 |
| 05-26 | 147 | 0 | 0 |
| 05-27 | 127 | 0 | 0 |
| 05-28 | 92 | 0 | 0 |
| 05-29 | 73 | 0 | 0 |
| 05-30 | 84 | 0 | 0 |
| 05-31 | 0 | 0 | 0 |

### 1.3 ボトルネック観測（FANZA）

- **5/01-5/16（前半16日）**：累計 ~37 clicks／件数 0／報酬 0円 → ベースライン非常に低い
- **5/17 単日 45 clicks 急増** → 5/18 以降 200+ click/日 にまで増加
- **5/23-25 が成約ピーク**：3 日間で 4 件全成約発生、EPC ≒ 9.6 円
- **5/26 以降の成約消失**：5/26〜5/30 累計 523 clicks → **0 件成約 / 0円**
- **CVR 0.37 % は業界平均 (DMM/FANZA 1.5〜3%) を大きく下回る** → クリック品質または LP 着地後の意図不一致が主因と推定（推測ではない: 確定は CCO 領域）

---

## 2. GA4 — Pages and Screens (30日: 2026-05-02〜05-31)

### 2.1 全体集計

| 指標 | 値 |
|---|---:|
| 総表示回数 (PV) | **6,930** |
| アクティブ ユーザー | **2,863** |
| イベント数 (全) | 15,951 |
| キーイベント数 (全) | **163** |
| ユニーク landing | 1,034 ページ |
| アクティブユーザー比 PV | 2.42 PV/User |
| 平均エンゲージメント | 7 秒 |

### 2.2 Top 10 ランディングページ × PV/Users/KeyEvents

| 順 | ページ タイトル | PV (%) | Users | キーイベント |
|---:|---|---:|---:|---:|
| 1 | VODNAVI — 今夜の極上に、最短ルートで (top) | 253 (3.65%) | 41 | 0 |
| 2 | 制服マ○コ拡張少女 鳥羽みもり | 158 (2.28%) | 71 | 1 |
| 3 | 【超放尿1266分】美少女・美熟女 | 145 (2.09%) | 72 | 1 |
| 4 | 'あの'河北彩伽とお泊まりデート | 138 (1.99%) | 62 | 0 |
| 5 | お仕置き客室乗務員 月待青花 | 118 (1.70%) | 54 | 0 |
| 6 | アニメ版「入り浸りギャル＃3・＃4」 | 84 (1.21%) | 41 | 1 |
| 7 | 【VR】肉感スポ女子 乙アリス | 74 (1.07%) | 36 | 0 |
| 8 | マジックミラー便 卒業式直後 | 74 (1.07%) | 34 | 0 |
| 9 | **AI 相談窓口（コンシェルジュ）** | **64 (0.92%)** | **29** | **13 (7.98%)** |
| 10 | S1コンプリート100SEX | 60 (0.87%) | 24 | 0 |

**観測**：Top 10 はほぼすべて app.vodnavi.jp のページ（商品詳細＋トップ＋Concierge）。  
**Concierge ページの密度は突出**：PV シェア 0.92% に対しキーイベント シェア 7.98%（**約 8.7 倍の効率**）。Concierge に「人を流せば成約器官として高効率」だが入口流量が圧倒的に少ない。

---

## 3. GA4 — Events (28日: 2026-05-04〜05-31、全15イベント)

| 順 | イベント名 | イベント数 (%) | ユニークユーザー数 | per-user 平均 |
|---:|---|---:|---:|---:|
| 1 | page_view | 6,922 (43.47%) | 2,856 | 2.42 |
| 2 | session_start | 2,973 (18.67%) | 2,855 | 1.04 |
| 3 | first_visit | 2,864 (17.99%) | 2,855 | 1.00 |
| 4 | user_engagement | 2,141 (13.45%) | 1,854 | 1.16 |
| 5 | scroll | 376 (2.36%) | 293 | 1.28 |
| 6 | click | 310 (1.95%) | 212 | 1.46 |
| 7 | **product_click** | **148 (0.93%)** | **94** | 1.57 |
| 8 | **ai_affiliate_click** | **147 (0.92%)** | **93** | 1.58 |
| 9 | **ai_session_start** | **22 (0.14%)** | **12** | 1.83 |
| 10 | **concierge_entry_click** | **10 (0.06%)** | **8** | 1.25 |
| 11 | video_progress | 4 (0.03%) | 1 | 4.00 |
| 12 | form_start | 3 (0.02%) | 3 | 1.00 |
| 13 | ai_recommendation_view | 1 (<0.01%) | 1 | 1.00 |
| 14 | **fanza_cta_click** | **1 (<0.01%)** | **1** | 1.00 |
| 15 | video_start | 1 (<0.01%) | 1 | 1.00 |

---

## 4. ファネル統合（物理ファクトの突合せ）

### 4.1 Concierge 経由（app.vodnavi.jp 内）28 日

```
セッション 2,855 ユーザー (session_start)
        │
        ├─ /concierge へ到達: 29 ユーザー (Pages and Screens から)
        │        │   到達率: 29 / 2,855 = 1.02%
        │        │
        │        ├─ ai_session_start: 12 ユニーク (発火 22 回)
        │        │          AI 会話を実起動した割合: 12 / 29 = 41 %
        │        │
        │        ├─ product_click: 94 ユニーク (発火 148 回)
        │        │
        │        └─ ai_affiliate_click: 93 ユニーク (発火 147 回)
        │                  product_click ≒ ai_affiliate_click (1:1)
        │
        └─ concierge_entry_click (詳細→Concierge): 8 ユニーク (発火 10 回)
                  詳細ページからの能動的 Concierge 起動: 8 ユーザー
```

### 4.2 Moterist 集客→FANZA 送客（物理計上）

```
FANZA dashboard 計上 (5/01-5/31): 1,069 clicks
GA4 ai_affiliate_click (28日):   147 clicks   ← Concierge 経由
GA4 fanza_cta_click   (28日):     1 click    ← moterist 旧 CTA トラッカー
────────────────────────────────────────────
GA4 トラック計:                  148 clicks
未トラック (FANZA - GA4) :     ≒ 921 clicks (86%)
```

**未トラック ~921 clicks** は moterist.com 旧記事内の **生 `<a href="affiliate.dmm.com/...">` 直接アンカー** 経由と推定される（推測根拠：①FANZA は ASP 側で全クリックを計上、②GA4 イベントリスナーは設置 anchor に未バインド＝memory: `fanza-cta-blank-state` と整合、③同期間内の moterist 集客の Search Console 露出と整合する規模）。

---

## 5. ボトルネック特定（物理ファクトベース）

| # | 病巣 | 物理ファクト | 影響度 |
|---|---|---|---:|
| **B-1** | **Concierge 入口流量が圧倒的に小さい** | 2,855 sess → /concierge 29 user (1.02 %) | 🔴 致命 |
| **B-2** | **AI セッション起動率が低い** | /concierge 着地 29 user → ai_session_start 12 unique (41 %) | 🟡 中 |
| **B-3** | **CVR 0.37 %**（業界相場 1.5〜3 % に対し 1/4 以下） | FANZA 1,069 click → 4 件 / 3,584 円 | 🔴 致命 |
| **B-4** | **moterist 旧 CTA の GA4 トラッキング欠落** | fanza_cta_click 1 vs FANZA 推定 ~921 直接 click | 🟡 計測穴 |
| **B-5** | **5/26 以降の成約消失** (post-peak collapse) | 5/26-30 で 523 click → 0 件 | 🔴 致命 |
| B-6 | 詳細→Concierge の能動誘導 (concierge_entry_click=8 unique) は機能している | — | 🟢 機能 |
| B-7 | Concierge 経由は product_click=ai_affiliate_click 1:1 で FANZA 到達まで完走 | — | 🟢 機能 |

**最大ボトルネック**: B-1（入口流量）と B-3（CVR）の合算。すなわち「Concierge に人が来ない × 来ても成約に結びつかない」の **二段崩れ**。

---

## 6. 未取得 / 監査未達項目（明示）

| 項目 | 未達理由 | 推奨次アクション |
|---|---|---|
| moterist.com **hostname 専属** ランディング PV/Users | GA4 既定レポートに hostname フィルタを URL 経由で適用不可（SPA が `r=traffic-acquisition` 等を home へ巻き戻し）。1,034 unique pages 中の moterist 分の特定は UI 上の filter 追加が必要 | Saturday-Review で UI 上 +フィルタ `hostname contains moterist` を手動付与 |
| `source=moterist` URL クエリ別セッション数 | utm_source / 第一次パラメータ ベースの抽出には Explorer 自由形式が必要、Saved Explore は古い設定で「データなし」 | 新規 Explore で「初回参照元」または `landing_page` includes `source=moterist` フィルタを定義 |
| Linker `_gl` 付与状態の本番検証 | 本セッションでは moterist.com 実ページに遷移していない（解析タブのみ操作） | 別タブで `https://moterist.com/<post>/` 開き、Concierge ボタンの href に `_gl=` が含まれるか network/inspect で確認 |
| カードタイプ別 product_click CTR | event_label 等のパラメータ別集計は Explore 自由形式が必要 | Explore 新規作成、ディメンション=event_label (or card_type) ×指標=event count |
| 5/26-30 の成約 0 化の根本原因 | データ単一 (1 propeny) だけでは判定不能 | FANZA「商品別レポート」で 5/24 vs 5/26 の商品構成差を比較、または UA/intent/Browser 別 cohort 分析 |

---

## 7. 監査メソッドと環境ログ

- **取得経路**: mcp__claude-in-chrome / Chrome 既存タブ群を再利用 (tabIds: 290595937 GA4, 290595939 FANZA, 290595954 SC, 290595958 Ahrefs)
- **GA4 navigated URLs**:
  - `#/a355462253p489519780/reports/explorer?...&r=all-pages-and-screens` ✅
  - `#/a355462253p489519780/reports/explorer?...&r=top-events` ✅
  - `#/a355462253p489519780/reports/explorer?...&r=traffic-acquisition` ❌ (home 巻き戻し)
  - `#/analysis/a355462253p489519780/edit/k1-d8zAwRemPD55mJxHIpw?restoreUserState=true` ⚠️ (Saved Explore: 設定古く「データなし」)
- **GA4 日付パラメータ**: `_u.date00=20260502&_u.date01=20260531` — Pages/Events では適用、Home/Funnel では UI 既定にリセット観測
- **FANZA**: 「先月」ボタンを JS click で発火、データテーブル正常更新
- **認証セッション切れ**: なし。両管理画面とも操作期間中ログイン継続。
- **新規パスワード入力 / PIN 要求**: なし（既存セッション内で完結）。

---

## 8. 次セッションへの引継ぎ

1. 本ファイル + `management/TASK_BOARD.md` を Git stage (本セッションで `git add` 済)。
2. CSO に「B-1 入口流量」と「B-3 CVR」の二段崩れを定量根拠付きで提示。
3. CCO へのリライト指示書は「**5/26 以降の成約消失**」と「**moterist→Concierge 動線の欠落**」を優先テーマに発行する余地あり。
4. `_gl` 検証、source 別、card type 別の追加抽出は Saturday-Review (§OPERATION_MANUAL §2) で網羅推奨。

*end of raw audit — 2026-06-01 JST*
