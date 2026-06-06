# STRATEGY_BRIEF_035_W23_SCAFFOLD — site-brand/ Scaffold構築 & サルベージ記事 CTA整合

発行: 2026-06-07 / 採番: 034 の次 = **035**（CSO 原案の "003" は既存4ファイル `003`/`003_BUGFIX`/`003_CONTENT`/`003_INFRA` と衝突のため修正）
前提: `STRATEGY_BRIEF_034_W23_PIVOT.md` の clean/adult 境界 **HUMAN 承認済 (fd70895)**
ステータス: DRAFT — §2 scaffold は着手可 / §3 は SEO 本文保護ガード下でのみ可

## 1. 執行背景とKPIボトルネック
- **現在地**: `app.vodnavi.jp` 流入の 98.6% がダイレクトで、`source`×`intent` 帰属送客経路の蓄積がほぼ 0 の構造的空白。
- **目標**: 公式ドメイン `vodnavi.jp` の検索資産（impr 81.8k）を成人デランクから完全保護しつつ、一般教養・映像心理コラムから成約アプリへ `?source=brand&intent=*` 付きの「クリーン送客リンク」を発生させるインフラ構築。

## 2. site-brand/ 設計仕様（CTO 責務）— **着手可（clean-only）**
- **環境**: Next.js モノレポ構造、Vercel で `app.vodnavi.jp` と一体運用。
- **デザイン**: `#121212`(リッチブラック 70%) / `#E0E0E0`(プラチナホワイト 20%) / `#D4AF37`(シャンパンゴールド 10%)。`BRAND_DESIGN_GUIDE` 準拠。
- **配置コンテンツ（クリーン領域のみ）**:
  - 映像心理・行動経済を用いた「教養としての映像解説コラム」の受け皿。
  - 運営者情報 / コンテンツ制作ポリシー / 利用規約 / プライバシーポリシー（E-E-A-T）。
    - **運営者法人格**: **合同会社トレンドネット**（`site-brand/src/app/layout.tsx` の schema.org JSON-LD `legalName` に既定義・本番 deploy 済の**検証済値**）。連絡先 `contact@vodnavi.jp` も同 JSON-LD 準拠。CSO 原案の "Safari株式会社" は誤りのため不採用。
- **禁則（不変ガード）**: 成人向け作品名・女優名・FANZA アフィリエイトID/バナー・アダルト要素の **vodnavi.jp(site-brand) への直接配置は永久禁止**（adult デランクで 81.8k 資産毀損リスク / BRIEF_034 §4）。成人導線は `app.vodnavi.jp` 年齢ゲート内に隔離。
- **配置前チェック**: vodnavi.jp の現 impr 81.8k が一般KW構成であることを GSC query 別で確認（adult 比率が低いことの確証）。

## 3. サルベージ5記事の CTA整合（CCO 責務）— **SEO本文保護ガード下でのみ**
- **対象**: `site-moterist/03_content/` の 1095 / 1106 / 994 / 954 / 1018。
- ⚠️ **重要ガード**: これら5記事の SEO 本文・インデックスは **永久保護**（`project_moterist_mass_overwrite_plan` / THE_THOR_DICTIONARY.md）。**本文テキストの全文上書き・「装飾の完全再構築」による本文改変は不可。** 許可は **CTA/導線部分の整合のみ**。
- **既状況**: 5記事は BRIEF_033 (salvage-production) で既にリライト済。本タスクは新規リライトではなく **CTA 配線の検証・微修正**に留める。
- **送客配線**: 記事末尾の確定CTAを `https://app.vodnavi.jp/concierge?source=moterist&intent=<各記事の読者インテント>` に一致させ、ハードコードIDや Gutenberg ノイズがあれば CTA 周辺のみ整理。
- ⚠️ **戦略注記（T-02 由来）**: moterist は検索流入 ~ゼロ（adult デランク確定）。本節の目的は「既存資産の CTA 整合」であって moterist 経由の集客増ではない。集客の主軸は §2 の vodnavi.jp clean 面。

## 4. 進行管理と次のゲート
- 本ブリーフ保存で、CTO による `site-brand/` の **clean-only** Scaffold ディレクトリ配置・初期コンポーネント実装フェーズを正式にアンブロック（T-20260606-04）。
- §3 の CTA 整合着手前に、SEO 本文を 1 バイトも改変しない作業範囲であることを CCO/CTO で再確認。
