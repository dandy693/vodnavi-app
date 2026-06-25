---
title: "app.vodnavi.jp コンシェルジュ入口 LP 構成定義書"
brief_id: STRATEGY_BRIEF_073
created: "2026-06-25"
status: "spec（実装は要 HUMAN 承認 + tsc/next build）"
author: "CSO（原案・LP 構成）/ CTO（技術整合・物理訂正）"
counterpart: STRATEGY_BRIEF_072_APP_CONVERSION_CORE.md
note: >
  CSO 原案 `STRATEGY_BRIEF_APP_CONCIERGE.md`（repo root 無番）を canonical 採番規約に
  従い本ファイルへ filing。LP 構成（§2 の ①-⑤）は原案を尊重し、ブランド token・年齢
  ゲート機構・アフィリエイト盾・既存資産の事実と整合する形に CTO が訂正した。
---

# STRATEGY_BRIEF_073 — app.vodnavi.jp コンシェルジュ入口 LP

## 0. 位置づけ（CTO 注）
- 本 LP は **app.vodnavi.jp（年齢ゲート裏の対話型 /concierge）への入口**。FANZA 文脈は方針内（clean 面 vodnavi.jp には載せない＝[[STRATEGY_BRIEF_071]] §4 / board T-05 の HUMAN 決定）。
- **greenfield ではない**: `/concierge` は既存（`concierge-chat.tsx` + `sources.ts` + `proxy.ts` 年齢ゲート）。本 brief は既存コンシェルジュへの**入口 LP の再定義**であり、ゼロからの新規実装ではない。
- 実装（`page.tsx` 化）・本番反映は要 HUMAN 承認。land 条件 = `npx tsc --noEmit` exit0 + `npm run build` exit0 + 本番 curl。

## 1. 世界観とデザインアイデンティティ
- **テーマ**: 『ビブリア・エロティカ（官能の図書館）』。
- **トーン＆マナー**: 高級・知性・ダーク × ゴールド。チープなアダルト感を排除し、会員制コンシェルジュの品格を保つ。
- **ブランド token（凍結値・`app-concierge/design-tokens.css §2.1` を単一情報源として参照、hex 直書き禁止）**:
  - 背景ダーク `--brand-dark: #121212`（**CSO 原案 `#0D0D0D` は frozen token 不一致＝訂正**）
  - ゴールド `--brand-gold: #D4AF37`（CSO 原案と一致 ✅）／ hover `--brand-gold-hover: #AA820A`
  - サーフェス `--brand-surface: #1E1E1E`／ 主文字 `#FAFAFA`／ 副文字 `#A0A0A0`
  - 見出し `font-luxury-heading`（Cormorant Garamond / Noto Serif JP）、CTA は `.btn-luxury-gold` / `.btn-luxury-outline`
- **禁止表現**: 根拠なき「絶対」「業界No.1」等の断定（[[BRAND_DESIGN_GUIDE]] 準拠）。

## 2. LP 構成セクション（上から下への熱量遷移）
### ① ヒーロー（ファーストビュー）
- **コピー**: 「探す時間は、もう終わりにしよう。あなたの欲望を理解する、世界で唯一のAI司書。」
- **ビジュアル**: ダーク背景に浮かぶゴールドのアンティーク書架と静謐な UI。
- **メイン CTA**: 「AIコンシェルジュを起動する（無料）」。**年齢ゲート機構（正確化）**: クリックで `/concierge` へ遷移＝`proxy.ts`（Next16、matcher は `/concierge`・`/api/concierge` のみ）が `vodnavi_age_verified=1` cookie を要求し、未検証なら年齢確認を提示。「18歳以上である Enter」は**この /concierge ゲート上**で表現する（`/works` は別系統＝公開）。

### ② 課題提起と共感
- **文脈**: 「配信数が多すぎて今夜の1本が見つからない」「検索履歴を汚したくない」「本当に求める世界に辿り着けない」。
- **解決策**: 趣味嗜好を秘匿しつつ最適解を導く（ID 分離・履歴非汚染）。

### ③ 3つのコア・バリュー（信頼の盾）
1. **秘匿（ID 分離・履歴非汚染）**: 閲覧/検索の痕跡を残さない設計。
2. **高精度データベース**: 品番・女優・シチュエーションを AI が横断解析。
3. **1ステップ動線（FANZA 一点集中）**: 公式の最高画質へ最短遷移。**盾**: リンクは `buildAffiliateURL`（`lib/concierge/url-builder.ts`）経由のみ、`af_id=moterist-990`（正規 production ID）、**直リンク/`af_id` 直書き恒久禁止**。

### ④ コンシェルジュ疑似体験（インタラクティブ・スタブ）
- 3問（「今夜の気分は？」「求める世界観は？」等）を選択させ「あなたへの推薦図書」を1本提示するデモ。
- **実装方針（CTO）**: 新規ロジックを増やさず**既存 `/concierge` チャットへのプレビュー/誘導**として実装。「詳細を見る」クリック時の早期 cookie 着火は既存 `buildEarlyCookieURL`（[[STRATEGY_BRIEF_040]]、intent 別 KW）を再利用＝二重実装を避ける。

### ⑤ フッター・リーガル防衛
- 特定商取引法に基づく表記（運営法人 = **合同会社トレンドネット**＝検証値、`layout.tsx` schema.org legalName / `about/page.tsx`）。
- プライバシーポリシー、**#PR**（ステマ規制・ファーストビュー圏内に明示）。

## 3. ガバナンス継承（5つの盾）
- 年齢確認（`proxy.ts`）／ ID 分離 ／ WP リンカー・自動更新停止 ／ サニタイザー ／ 早期 cookie 着火。すべて既存実装を経由（新規迂回路を作らない）。
- コードレビューで 1ミリの直リンクも不可（env/builder/WP 共通リダイレクト経由）。

## 4. 残・依存
- 実装着手前に、本 LP が既存 `/concierge` ルートを**置換**するのか**前段の入口ページ**を新設するのかを CTO 設計確定（既存 chat UX を壊さないこと）。
- 実装・本番反映は要 HUMAN 承認（`tsc`/`build` + 本番 curl）。関連: [[STRATEGY_BRIEF_072_APP_CONVERSION_CORE]]（成約コア本文）。
