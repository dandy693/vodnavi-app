# STRATEGY_BRIEF_077 — PHASE 4: データ観測 & インフラ最終最適化

> **作成日**: 2026-06-27
> **出自**: CSO `cso_phase4_initiate.sh`。採番規約に従い `STRATEGY_BRIEF_077_*` として filing（原案の無番 `STRATEGY_BRIEF_PHASE4.md` は不採用）。board の `## 進行中のタスク` 置換は当該見出しが実 board に不在＝silent no-op のため、本ブリーフ + 板の T-20260627-01 in-place に置換。

## 1. 現状の物理ファクト
- **連携状態**: `vodnavi.jp`（メディア層）⇄ `app.vodnavi.jp`（コンシェルジュ層）の `brand_pilot_001` ファネルは結合試験を完全パス（clean 記事 → `/lp` 3タップ → `/concierge` 司書キュレーション + persona、全段 live 実測）。
- **データ不確実性**: 本番配備直後で、GA4 のユーザー行動ログ・クリック指標は **コンバージョン未蓄積（ゼロベース）**。

## 2. 次ミッション（〜2026年7月第1週）
1. **トラフィックデータの冷徹な凝視**
   - 憶測による機能追加を凍結し、最低 3 日〜1 週間の自然流入/動線数値を GA4 で直接目視する。
   - 観測対象: clean 記事 → `/lp` CTR（`?source=brand_pilot_001` bridge）、`/lp` 3タップ完了率（`concierge_quiz_complete`）、`/concierge` → アフィリ engagement。
2. **残存インフラタスクの回収（Vercel・dashboard 作業）**
   - apex `vodnavi.jp` → `www` の **307 → 308 Permanent** 昇格（site-brand-vodnavi → Settings → Domains → vodnavi.jp の redirect status。Next.js config 層ではない＝T-20260626-04 監査済）。
   - `site-brand` の Git Auto-Deploy 結合＝`vercel git connect` + **Root Directory=`site-brand/`** 設定で手動 `vercel --prod` 依存を解消（[[project_vodnavi_clean_deploy_gap]]）。app 側 `vodnavi-app` は既に push auto-deploy 済（対照）。

## 3. 次フェーズのトリガー
- `/lp?source=brand_pilot_001` に **n ≥ 100 ユニークセッション**到達で第1回ファネル通過レート監査（Conversion Audit）を執行。

## 4. CTO 補足（realism caveat）
- **n ≥ 100 到達は時間がかかる前提**: clean 記事 `vod-selection-guide` は 2026-06-26 公開で **未インデックス**（Google 反映に数日〜数週）。organic 流入は立ち上げ初期ゆえ薄く、moterist からの送客も実体ゼロ（[[project_moterist_zero_search_inflow]]）。よって「1 週間で n≥100」は楽観的になり得る。**観測と並行して、記事のインデックス促進（GSC URL 検査・sitemap）と SNS 等の初期送客**を別途検討しないと、ファネルが「動くが誰も通らない」状態になり得る（[[project_actress_hub_first_measurement]] の立ち上げ初期ボトルネック教訓と同型）。
- トリガーは「n≥100 到達 **or** 公開後 2 週間経過」の OR 条件にし、低トラフィックでも観測レビューが必ず一度走るようにするのを推奨。
