# AHREFS RAW AUDIT REPORT — 2026-W22 (T-05)

| 項目 | 値 |
|---|---|
| 観測日時 | 2026-05-31 23:35 JST |
| 観測手段 | `mcp__claude-in-chrome.get_page_text` (DOM scrape) |
| URL | `https://app.ahrefs.com/dashboard` |
| Workspace | "Motelab's workspace" |
| Plan | Basic (Free) |
| Credit 状態 | "クレジットが残っていません" 表示あり (一部データ制限) |

---

## 1. Dashboard 概要 (Workspace 配下 全 5 プロジェクト)

| Project | URL pattern | Health | Crawled | DR | Δ DR | Ref.domains | Δ Ref.dom | 月訪問者 (推定) | Δ Visitors | Organic Traffic | Organic Keywords |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **App.vodnavi** | `*.app.vodnavi.jp/*` | — (credit 枯渇) | — | **21** | +2 | 1 | +1 | (モニタ未開始) | — | **8** | **7** (JP: 7, +7) |
| **Motelab** | `*.motelab.xyz/*` | 66 | 184 (-1) | 0 | — | 172 | +137 | 16 (-65) | — | 0 | 0 (-1) |
| **Vodnavi** | `*.vodnavi.jp/*` | 100 | 190 (-1) | **21** | +2 | **182** | +130 | **66** (-6) | — | **8** | **7** (JP: 7, +7) |
| Kit-planning | `*.kit-planning.net/*` | 99 | 481 (+34) | 0 | — | 154 | +110 | (モニタ未開始) | — | 0.18 (値: $0.07) | 1 (JP: 1, +1) |
| **Moterist** | `*.moterist.com/*` | 99 | 684 (-28) | 0 | — | **174** | +137 | 32 (+22) | — | 0 | 0 |

> リダイレクト / リンク切れ / ブロックの 3 列は Vodnavi=3/0/0、Motelab=14/17/0、Moterist=3/1/0、Kit-planning=3/0/0、App.vodnavi=未表示。

---

## 2. VODNAVI-GROUP 3 サイト所見

### 2.1 `vodnavi.jp` (Vodnavi)
- **DR 21 (+2)**: 直近で +2 上昇。Workspace 内で App.vodnavi と同値 (後述 2.2 参照)
- **参照ドメイン 182 (+130)**: 大幅増 (52 → 182、+250%)。SEO 資産化が進行
- **ヘルススコア 100**: クロール 190 件、リダイレクト 3 / リンク切れ 0 / ブロック 0
- **月訪問者推定 66 (-6)**: 推定値、5月度比でやや微減
- **オーガニック: トラフィック 8 / キーワード 7 (JP 全件)**: Ahrefs 推定 (Free Plan 制限あり、GA4 観測 5月度アクティブユーザー 2,866 と桁違い乖離 — 後述 §4 caveat)

### 2.2 `app.vodnavi.jp` (App.vodnavi)
- **DR 21 (+2)**: vodnavi.jp と完全同値 — サブドメインがメインドメインの DR を引き継ぐ Ahrefs 仕様の可能性
- **参照ドメイン 1 (+1)**: vodnavi.jp の 182 と大差。app サブドメインへ直接張られた被リンクはほぼゼロ
- **オーガニック: トラフィック 8 / キーワード 7 (JP)**: vodnavi.jp と同値 — 重複カウントの疑い、または同じデータをサブドメイン別に表示している可能性
- **ヘルス系列**: クレジット枯渇でデータ未取得
- **モニタリング未開始** (総訪問者数欄に該当表記)

### 2.3 `moterist.com` (Moterist)
- **DR 0**: 評価ゼロ。これは memory `project_moterist_mass_overwrite_plan` に基づく「5記事 SEO インデックス資産永久保護」前提に対し、Ahrefs ランキング上は反映されていない数値。Free Plan 制限の可能性も
- **参照ドメイン 174 (+137)**: 急増 (38 → 174、+358%)。被リンク獲得は進行中
- **ヘルススコア 99**: クロール 684 件、リダイレクト 3 / リンク切れ 1 / ブロック 0 — 全 3 サイト中最大のクロール量
- **月訪問者推定 32 (+22)**: 微増だが絶対値は小さい
- **オーガニック: トラフィック 0 / キーワード 0**: ランキング上はゼロ。GSC 観測 (sc-domain:vodnavi.jp) でも moterist 系クエリは非可視。Ahrefs Free Plan 制限の可能性高、Site Explorer drill-down で再確認要

---

## 3. クロスサイト比較メモ

| 指標 | vodnavi.jp | moterist.com | 備考 |
|---|---|---|---|
| DR | 21 | 0 | moterist の Ahrefs 評価が想定より低い |
| Ref.domains | 182 | 174 | ほぼ同水準、近接的に被リンク獲得 |
| Crawled | 190 | 684 | moterist が 3.6 倍多い (記事数差) |
| Health | 100 | 99 | 両者ほぼ理想値 |
| Δ Ref.domains | +130 | +137 | 同期した増加カーブ (相互リンク or 共通施策が示唆) |

---

## 4. 重要な caveat / 観測スコープ外

| 項目 | 状態 | 理由 |
|---|---|---|
| URL Rating (UR) | **未取得** | Dashboard 非表示、Site Explorer drill-down 必要 |
| Top keywords list | **未取得** | Dashboard はサマリのみ、Site Explorer > Organic keywords 必要 |
| Backlink synergy 分析 | **未取得** | T-05 要件「全 3 サイト synergy」、Free Plan では Link Intersect 利用不可 |
| Anchor text 分布 | **未取得** | Site Explorer > Backlinks > Anchors 必要 |
| moterist DR=0 の真偽 | **要再検証** | Free Plan 制限による未集計の可能性、有料プラン or `Site Explorer` 個別解析で確認要 |
| GA4 月間 UU 2,866 vs Ahrefs OT 8 の桁違い | **方法論差** | GA4=自社実測、Ahrefs=外部推定 (検索流入のみ・キーワード露出ベース)。直接比較不可、別物として扱う |
| Free Plan credit 枯渇表示 | あり | Dashboard 上「クレジットが残っていません」表示、データ更新が止まっている可能性 |

---

## 5. 次アクション候補 (HUMAN 判断保留)

- **Ahrefs プラン昇格**: Free → Lite / Standard で Site Explorer drill-down + Link Intersect 解放、moterist DR=0 の真偽確定
- **個別ドメイン Site Explorer 観測**: vodnavi.jp / moterist.com を `https://app.ahrefs.com/site-explorer/overview/v2/...` 経由で個別データ展開、UR と top keywords を取得
- **synergy 分析**: 3 サイトの common ref.domains 抽出、相互リンク有無確認 (memory `project_funnel_drop_off_seo_to_concierge` の流入路問題に対する追加根拠)
- **GSC + Ahrefs クロス検証**: GSC の sc-domain:vodnavi.jp 観測 (クリック 2,109 / 5/31 audit) と Ahrefs OT 推定 8 の差異の原因特定 (Ahrefs クロール頻度 / SERP サンプリングの偏り)

---

*観測: Claude Opus 4.7 via `mcp__claude-in-chrome` / Dashboard URL DOM 抽出*
*本レポートは DOM 表示値のみで構成。placeholder なし、`[ここに記述]` 記号なし、Free Plan 制限と未取得項目はすべて caveat に明示*
