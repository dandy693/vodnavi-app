# STRATEGY_BRIEF_076 — クリーン層 SEO 集客・教養文脈マスタースペック

> **出自**: CSO `cso_execution_bridge.sh`（2026-06-26）Block[2]。CTO が採番規約（`management/STRATEGY_BRIEF_NNN_*`）に従って filing し、後述 §2 の 2 点を事実訂正のうえ採録。
> **不採用部**: 原案の (a) repo root 直下・無番出力（`STRATEGY_BRIEF_SEO_SPEC.md`）、(b) root `TASK_BOARD.md` 全文 stub 生成（canonical `management/TASK_BOARD.md` を fork・孤立させる禁止 pattern）。→ `CSO_AUTHORING_GUARDRAIL.md §1` に基づき却下、board は in-place 追記（T-20260626-02）。
> **位置づけ**: 新規路線ではなく `STRATEGY_BRIEF_071_VODNAVI_MEDIA_LAYER` の継続。集客導線の着地点 `app.vodnavi.jp/lp`（3タップ ConciergeQuiz）は 2026-06-26 に実装落成済（T-20260625-11）。

## 1. 目的・KPI
- **目的**: Google の検索ペナルティ（成人 derank）リスクを回避しつつ、VOD に関心のある一般ユーザーを clean 面 `vodnavi.jp` に安全に集客する。
- **ターゲット**: 映画・一般 VOD（U-NEXT / DMM TV 等）の比較・選び方を検索しているエンタメ潜在層。
- **成約ブリッジ（CVR）**: 記事内から `app.vodnavi.jp/lp`（「AI コンシェルジュの処方箋」= 3タップ診断）へ送客。年齢確認はそこから先（app 側 `/concierge`）で担保。

## 2. 個別ドメイン識別（防衛ライン）
- **年齢確認の境界（CTO 訂正①）**: 年齢ゲートは app.vodnavi.jp の `proxy.ts`（Next 16 で `middleware.ts` から改称）が **`/concierge` スコープ限定**で担保する。**clean 面 vodnavi.jp の記事には年齢ゲートを掛けない**——掛けると記事のインデックス自体がブロックされ、「BAN 回避＋大量集客」という本ブリーフの目的を自壊させる。原案の「vodnavi.jp への年齢確認ミドルウェア結合テスト」表現は誤りとして破棄。
- **moterist の扱い（CTO 訂正②）**: `moterist.com`（凍結済）は **確定した流入資産ではない**——2026-06-06 実測で GSC clicks ≈ 0 / impr 1、実集客の主体は既に vodnavi.jp（impr 81.8k）。よって「既存リンク資産」として booking せず、`?source=moterist` + ホスト名で **冷徹に分離測定**するのみ（過大評価しない）。
- **clean サニタイズ**: vodnavi.jp 新規記事群は直接的 18 禁ワードを完全排除する（`site-brand/scripts/check-clean-content.mjs` の build ゲートが `/fanza/i` 等を物理ブロック）。世界観は「高級・知性・ダーク×ゴールド」の凍結 design-token（`#121212` / `#D4AF37`）で統一。FANZA 成約本文は app 側 年齢ゲート内に隔離（BRIEF_034 / 049 / 050 / 071 §4 と整合）。

## 3. 次ステップ
- HUMAN 承認後、CCO へ「映画 VOD 比較記事テンプレート」のリライト指示書を生成。**ただし比較記事の本文に FANZA / 成人文脈は載せない**（clean 面の E-E-A-T と隔離方針を維持、euphemism による境界迂回は不採用）。
- 段階導線: 一般 VOD（U-NEXT / DMM TV 等）比較で集客 → `/lp` 3タップ診断 → app 年齢ゲート → FANZA 成約。
- 実装・本番反映は要 HUMAN 承認。
