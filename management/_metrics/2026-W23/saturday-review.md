# SATURDAY REVIEW — 2026-W23

日時: 2026-06-06 JST
担当: CSO / CTO（claude-in-chrome MCP 物理抽出）
ステータス: 物理データ一次取得完了（GA4 events + GSC 2 プロパティ）。source×intent 分割と moterist GA4 PV は未取得（後述）
取得アカウント: `moterist.com@gmail.com`（authuser=2、DOM email + プロパティ非リダイレクトで物理確認）
基点データ: `management/_metrics/2026-W23/saturday-raw-data.json` → `saturday_pull_2026_06_06` ブロック
ウィンドウ: GA4/GSC とも既定 **~過去28日**（GA4 2026-05-09〜06-05）。GA4 SPA は URL 日付パラメータを無視したため週次(W23)分離は未実施

## 1. 物理データ・ファクトテーブル
> ⚠️ **ガバナンス防衛**: 下表は claude-in-chrome MCP で物理目視した実数値のみ。未取得セルは `**未取得**` と明示し、推測値は入れない。

| 指標 | 実数値（~過去28日 物理確認） | M1目標値(2026-07) | 診断 |
|---|---|---|---|
| **集客**: moterist.com 検索流入 | **clicks 0 / impr 1**（GSC sc-domain）＋ GA4 hostname 6 users | 15,000 PV/月 | 🔴 top-of-funnel ~ゼロ |
| **集客(実体)**: vodnavi.jp 検索流入 | **clicks 2,640 / impr 81,800 / pos 8.7** | — | 🟢 健全（集客の実体はこちら） |
| **送客**: ai_session_start | **27** / concierge_entry_click **15** | CTR_app 6.0% | 🟡 母数僅少 |
| **表示**: product_click | **240** | CTR_prod 50.0% | ⚪ source×intent 分割未取得 |
| **成約(先行)**: ai_affiliate_click | **239**（product_click とほぼ 1:1） | CVR 11.1% | 🟢 クリック追随良好／確定CVRは未取得 |
| **核心**: 月換算売上 | **未取得**（DMM 管理画面要） | ¥100,000/月 | — |

参考イベント総量（28d, vodnavi G-GG7JV9MJRW）: page_view 9,258 / session_start 4,013 / first_visit 3,832 / fanza_cta_click **0**

## 2. 5大指標による冷徹な診断
- **送客効率 (CTR_app)**: ai_session_start 27・concierge_entry_click 15 と母数が極小。既存 funnel（app.vodnavi.jp 98.6% 占有・99.61% drop-off）と整合し、課題は intra-app UX。
- **成約効率 (CVR)**: product_click 240 ≈ ai_affiliate_click 239 のほぼ 1:1 でアフィリエイト遷移は機能。ただし **ai_session_start 27 << product_click 240** → product_click はコンシェルジュ AI セッション外（カタログ/一覧）で支配的に発火している疑い。event scope の再確認が必要。FANZA 確定 CVR は DMM 管理画面要。
- **検索視認性 (Search Visibility)**: 🔴 **最重要発見** — moterist.com（sc-domain）は clicks 0 / impr 1 / pos 26。GA4 hostname の moterist.com=6 users と二重に確証されており、**property mismatch ではなく実態として検索流入が ~ゼロ**。
  - **根因究明（2026-06-06 物理確定 / `gsc-panel-audit.json`）**: ①robots/noindex/X-Robots クリーン ②手動ペナルティ **無し**（手動対策パネル「問題は検出されませんでした」）③5大ピラー（1095/1106/994/954/1018）**5/5 が INDEXED**（GSC URL検査で各「URL は Google に登録されています」物理確認）。**それでも impr ~0** → 技術・ペナルティ・未インデックス要因は全て棄却。残るは **(B) 成人コンテンツの SafeSearch/adult デランクによる構造的非表示**が最有力。
  - **戦略含意**: SEO 技術改善や記事リライトでは解決しない公算が大きい。集客=moterist という前提自体が構造的限界を抱える。実体の集客は vodnavi.jp（impr 81.8k）であり、重心を vodnavi.jp / X 還流など非 Google・非成人フィルタ経路へ移す判断が要る。
- **記事品質・直帰傾向**: 滞留時間/直帰は本パス未取得。
- **コンプライアンス・規約生存**: `ALERTS.md` に高プライオリティ異常なし。年齢確認ゲート（`proxy.ts` 実装）正常。fanza_cta_click 0 は既知の anchor 不在問題と整合。

## 3. 次期アクション（データ駆動・要確定）
**今回の物理データが示す最大の論点**: 戦略は「集客=moterist.com」を前提にしているが、実データでは moterist.com 検索流入 ~ゼロ・vodnavi.jp が impr 81.8k で集客の実体。次期 brief はこの乖離の解消を優先論点にすべき。候補アクション（HUMAN 確定待ち）:

1. ~~**moterist.com ~ゼロ流入の原因切り分け**~~ ✅ **2026-06-06 解決済** — 5/5 INDEXED・手動ペナルティ無し・robots/noindex クリーンを物理確認（`gsc-panel-audit.json`）。原因は成人コンテンツ・デランク（構造的非表示）が最有力で SEO 技術改善では解決しない公算大。→ **戦略決定が必要**: Google organic を moterist 集客の主経路とする前提を撤回し vodnavi.jp / X 還流へ重心移動するか（要 HUMAN/CSO 判断）。SSH 一斉注入は「やっても検索流入は増えない」可能性が高く、優先度を下げるべき。
2. **source×intent 分割の取得**: GA4 Exploration を構築し product_click / ai_affiliate_click を source×intent で分解（本パス未取得）。どの intent が成約に効くかはこの分割が前提。
3. **確定 CVR の取得**: DMM アフィリエイト管理画面の確定数 ÷ ai_affiliate_click 239 で実 CVR を算出（HUMAN）。

**前提制約（不変）**: サルベージ済み5記事（1095, 1106, 994, 954, 1018）の SEO インデックスは永久保護対象（`project_moterist_mass_overwrite_plan` / THE_THOR_DICTIONARY.md 準拠）。許可されるのは CTA / 導線部分の局所最適化のみで、SEO 本文の全文上書き・「空中戦」一斉注入は不許可。`&intent=` 拡張は CTA URL 層に限定し、本番反映手段（SSH 等）はガバナンス policy 適合を確認のうえ別途確定する。

---
*未取得項目: source×intent 分割 / moterist GA4 PV(p393864941 redirect でブロック) / 確定CVR(DMM) / 直帰・滞留。次パスまたは HUMAN 補完。*

---
*Next Step: HUMAN による GA4 (G-GG7JV9MJRW) / Search Console 実数値の目視提供、または claude-in-chrome MCP 経由でのデータ抽出実行。*
