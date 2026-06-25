# CSO AUTHORING GUARDRAIL: 戦略AI自己制約・記述規約
# バージョン: v1.0.0 (2026-06-26) / 統治対象: VODNAVI CSO (戦略AI)

本ドキュメントは、戦略AIがこれ以降のターンで、嘘・推測・Next.js の設計誤認・歴史破壊を
引き起こさないための「絶対防衛ライン（Guardrail）」である。CTO（Claude Code）が毎ターン
の物理監査でこの規約に照合し、違反箇所は**是正または不採用**とする。

## 🚨 1. 絶対禁止事項（歴史の破壊防止）
- **`cat >` / `cat >>` による `TASK_BOARD.md` の直接生成・追記を永久に禁止する。** canonical は **`management/TASK_BOARD.md`**（~293KB・1,100行超の BRIEF/T-XX 統治履歴）。repo root に `TASK_BOARD.md` は存在せず、root へ `>` / `>>` すると**孤立した別ボード（orphan stub）を新規作成**して履歴を fork する。更新は必ず canonical への**正確なインプレース置換（Edit）**で行う。
- **未検証パスへのファイル書き出しを禁止する。** 書込前に `app-concierge/src/` 等の実在ディレクトリツリーを物理監査する（例: 実ルートは `app-concierge/src/app/(site)/works/[floor]/[id]/page.tsx`）。
- **STRATEGY_BRIEF は採番・配置を守る。** `management/STRATEGY_BRIEF_NNN_*.md`（root 無番・既存番号への衝突上書きは禁止）。

## 🎨 2. フロントエンド・ブランド資産の強制縛り
Tailwind の生カラー（`bg-slate-950`・`text-amber-400` 等）の直書きを禁止する。必ず凍結トークン
（`app-concierge/design-tokens.css §2.1`・BRAND_DESIGN_GUIDE）とセマンティッククラスを使う。
- **背景（漆黒）**: `#121212` → `bg-brand-dark`
- **アクセント（ゴールド）**: `#D4AF37` → `text-brand-gold` / `.btn-luxury-gold` / `.btn-luxury-outline`
- hover `#AA820A` / surface `#1E1E1E` / 主文字 `#FAFAFA` / 副文字 `#A0A0A0`。**hex 直書き禁止**。

## 🏛️ 3. Next.js 16 (App Router) 専用アーキテクチャ制約
「存在しないファイル・古い歴史」への言及・配線を完全禁止する（AGENTS.md: 本 Next は training-data と異なる）。
- **`middleware.ts` 禁止**: ルート保護/アクセス制限は既存 **`proxy.ts`**（matcher は `/concierge`・`/api/concierge` のみ。`/works/*` は公開）。`src/middleware.ts` を新規作成しない。
- **`_app.tsx` 禁止**: App Router に `_app.tsx` は存在しない（Pages Router 専用）。流入追跡（`?source=`）は **`sources.ts`** の `ConciergeSource` プロファイル + GA4 カスタムディメンション（`asp_name`/`source`/`intent`）で捕捉する。
- **クッキーの混同禁止**: 年齢ゲート cookie（`vodnavi_age_verified=1`、`proxy.ts` が検査）と、FANZA アフィリエイト動線（`buildAffiliateURL`／`af_id=moterist-990`・CTA クリック時の早期 cookie 着火）は**別機構**として分離設計する。

## 📊 4. ファクト規律（ハルシネーション禁止）
- 数値・品番・属性は実データで照合する。例: SC クリック実績は Sprint-1 TOP10 のみ（`h_1724m794g00002` は 404 で除外＝**実質 9 品番**）、Sprint-2 17 件は `scClicks:0`。**VR/4K 等の属性タグは DB 不在**（実 VR は `savr00978` のみ）。
- 完了フラグ `[x]` は物理検証（`tsc`/`build`/本番 curl）後のみ。未実施を done にしない。

---
*運用: 本規約は CTO（Claude Code）が各 CSO script 実行前の物理監査で照合し、違反は是正のうえ canonical に in-place 反映する（root fork / 生カラー / `middleware.ts`・`_app.tsx` は不採用）。*
