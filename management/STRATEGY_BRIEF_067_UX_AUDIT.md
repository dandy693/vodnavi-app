---
title: "STRATEGY BRIEF 067 — 女優ハブの回遊性（内部リンク）・成約導線・モバイル認知負荷 物理UX監査"
date: "2026-06-14"
author: "CTO (Claude Code) — claude-in-chrome で本番 DOM/network を実読"
status: "ux_audit_completed (実機DOM実測 / モバイルは layout ~500px CSS で測定・true375は未達)"
target_domain: "app.vodnavi.jp"
audited_route: "/actresses/1042129 (七沢みあ, 本番)"
---

# STRATEGY BRIEF 067

> 抽出方法: `claude-in-chrome` で本番ページを開き、`getBoundingClientRect`/`getComputedStyle`/`a[href]` 列挙・network 実読で
> DOM ファクトを採取。数値はすべて実測。プレースホルダ・主観の美辞麗句は排除。

## 1. ユーザー回遊・内部リンクの物理レンダリング構造（実測ファクト）

### ファーストビューの視認性
- `h1`「七沢みあの出演作品一覧」= **font 30px / weight 600**。
- **editorialLead 描画済**: 「官能の図書館へようこそ。今宵ひもとくのは、圧倒的な透明感の奥に狂おしい情熱を秘めたアクトレス、七沢みあ。…」
  → Information Gain（薄ページ回避の独自テキスト, BRIEF_063/065）が本番で生存。
- 作品タイトルは `h3` **14px**（30件）。

### 作品グリッド（30件）への接続
- 作品内部リンク **30件、100% が `/works/{videoa|amateur|anime|nikkatsu}/{cid}` に正規一致**（`works_all_valid_floor: true`、壊れ href ゼロ）。
- 各作品カードに成約CTA **「今すぐ視聴 →」**（→ `al.fanza.co.jp`/`al.dmm.co.jp` アフィリエイト）＋ 副リンク「配信終了？ {女優}の作品を探す」。
- **外部リンク 60件すべて `al.fanza.co.jp` / `al.dmm.co.jp`**（成約アウトバウンドのみ・他ドメイン混入なし）。
- カードサイズ: デスクトップ 233×420px / モバイル(~500px) 2カラム 220×402px。

### 関連女優への回遊
- 関連女優リンク **18件**（※ TASK_BOARD T-20260610-14 の「40リンク」表記は**実測18と相違**＝当該記述を実数に訂正すべき）、**100% が `/actresses/{id}` に正規一致**。
- ピル型ボタン、タップ標的 **74×30px / font 12px**。

### クリック阻害・要素の重なり
- `position:fixed/sticky` かつ `z-index>=50` の**全画面ブロッカー = 0件**（クリックを阻害するオーバーレイ・重なりなし）。
- 年齢ゲートは cookie 既設で非ブロック（初回訪問者は age gate 経由＝既知の盾、UX上は1クッション）。
- 右上に **「AI 相談」ゴールド CTA**（コンシェルジュ導線）が常設＝ハブから成約核心への入口あり。

### モバイル認知負荷（ビューポート実測）
- ウィンドウを 390px に設定したが dpr 1.25 のため**レイアウト実測幅は約500px CSS**（true 375px は未達＝この点は限界として明記）。
- **横スクロール溢れ none**（`scrollWidth <= innerWidth`、レスポンシブ健全）。
- **主成約CTA「今すぐ視聴 →」= 220×44px ＝ Apple 44px 最小タップ標的を満たしタップ安全** ✅。
- 副CTA「…作品を探す」= 220×**29px**、関連女優チップ = 74×**30px**/12px ＝ **44–48px ガイドライン未満**（小さい）。

## 2. 結論：UX と成約ファネルの評価（主観排除）
- 「システムがエゴを押し付ける」類の**設計的欠陥（クリック阻害オーバーレイ・横溢れ・壊れリンク・過大フォント）は検出されず**。基礎的回遊性と成約導線は健全。
- **主成約CTAはモバイルでもタップ安全（44px）**、Information Gain（editorial）も生存、内部リンクは works30/actresses18 とも href 100% 正規。
- 唯一の摩擦点 = **副CTA・関連女優チップが 29–30px / 12px とタップガイドライン未満**。離脱を「生む」レベルの欠陥とは断定しないが、横移動（関連女優回遊）の押しやすさに改善余地。
- **重要な前提（BRIEF_066 連動）**: 当ハブの実トラフィックは 28日で 4view（[[project_actress_hub_first_measurement]]）。UX 微修正の前に「そもそも到達がない」が真の課題＝**内部リンク送客（高流入の作品ページ→女優ハブ）が先、UX チューニングは後**。UX は破綻していないので、回遊率を語る前に流入を作るのが優先。

## 3. 次期UXパッチ申し送り（インキュベーション=BRIEF_064 明けに執行）
1. **関連女優チップのタップ安全化**: `min-height: 44px` / font 13–14px へ。低コスト・低リスク。
2. **副CTA「作品を探す」のタップ標的拡大** or 主CTA との視覚的階層を明確化。
3. 上記は **code-freeze（BRIEF_064 観測期）明けにまとめて**。「回遊率1.5倍」は到達ユーザーが居て初めて意味＝流入（内部リンク送客 BRIEF_066 §3-1）が前提条件。

## 付記：本ブリーフが置換した不正な前提
- 指示スクリプトの 067 は本文が全て `[CTOが…]` プレースホルダのまま `status: ux_audit_completed` で commit する fabricated artifact だった → **実行せず**、本ブリーフで実測 DOM 値に置換。
- board 更新 python は `## [In Progress]` 見出しに挿入する想定だが、**実 board に当該見出しは存在しない**（else 分岐で EOF に新セクションを誤挿入）→ 不採用、CTO 管轄セクションへ surgical 追記（[[feedback_cso_script_heading_mismatch]] / [[feedback_preserve_task_board_in_place]]）。
