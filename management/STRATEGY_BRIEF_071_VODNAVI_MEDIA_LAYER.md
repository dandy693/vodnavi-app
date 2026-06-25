---
title: 新章：vodnavi.jp メディア層構造定義 ＆ 収益化指令
last_updated: "2026-06-25"
status: active
supersedes: none
note: >
  本ブリーフは当初 CSO script が「STRATEGY_BRIEF_002」として発行したが、002 は既に
  SANGO/U-NEXT 被リンクサルベージ戦略（STRATEGY_BRIEF_002_SALVAGE.md /
  _REWRITE.md、board T-20260601-02）に確定使用済みのため、番号衝突回避で次の空き番号
  071 に採番し直した（[[feedback_cso_brief_number_collision]]）。
---

# STRATEGY_BRIEF_071 — vodnavi.jp メディア層構造定義

## 1. 物理ファクトの再定義（Next.js 16 & 実集客拠点としての vodnavi.jp）
- 現状認識: vodnavi.jp は新規作成サイトではなく、既に実集客の主体（GSC impressions ~81.8k、[[project_moterist_zero_search_inflow]]）として稼働中の主要拠点である。
- 技術基盤: app.vodnavi.jp とともに Next.js **16** 構成（`middleware.ts` → `proxy.ts` への遷都完了、[[project_age_gate_shield_is_proxy_ts]]）の monorepo 資産として運用される。

## 2. メディア層（vodnavi.jp）内部ディレクトリ構造（App Router パス配置・設計案）
CTO（Claude）へのコード実装、およびインデックス自動生成のベースとなる静的・動的パス設計の**目標構造**。実装は別タスク（T-20260625-04）・要 HUMAN 承認。

```
vodnavi.jp/src/app/
├── page.tsx                     # メディアトップ（ブランド説明＋最新記事・特集ハブ動線）
├── about/page.tsx               # 運営者情報（運営主体・責任者明示 ※下記注記）
├── privacy/page.tsx             # プライバシーポリシー（GA4、Cookie無効化手順内包）
├── disclaimer/page.tsx          # 免責事項（アフィリエイトに関する表示要件）
├── contact/page.tsx             # お問い合わせフォーム
├── editorial-policy/page.tsx    # 編集ポリシー（E-E-A-T品質、ダブルチェック体制の明示）
├── authors/
│   ├── page.tsx                 # 著者・監修者一覧
│   └── [slug]/page.tsx          # 個別著者プロフィール（経歴・検証可能性の担保）
├── compare/
│   ├── page.tsx                 # 比較カテゴリトップ（VOD比較ハブ）
│   └── [slug]/page.tsx          # 【収益主力】例: fanza-tv、fanza-tv-price、fanza-vs-dmm
├── guide/
│   ├── page.tsx                 # ガイドカテゴリトップ
│   └── [slug]/page.tsx          # 【成約補助】登録手順（fanza-tv-signup）、退会（fanza-tv-cancel）
├── reviews/
│   ├── page.tsx                 # 編集レビューハブ
│   └── [slug]/page.tsx          # 今月のおすすめ、編集部厳選
├── genres/
│   └── [slug]/page.tsx          # 【集客ハブ】編集ジャンル記事（app側のジャンルDBとは完全分離）
└── actresses/
    └── [slug]/page.tsx          # 【集客ハブ】編集女優まとめ記事（app側の女優DBとは完全分離）
```

> **【要 HUMAN 確認・未検証プレースホルダ】** about ページに記す運営法人名・責任者名は本ブリーフでは未確定。CSO 原案は「合同会社トレンドネット」を挙げたが、**実在する正式な運営主体は物理未確認**のため、about ページ実装前に HUMAN が登記上の正式名称を確定すること（誤った法人名の公開は特商法表記の不備となる）。

## 3. CCO（ChatGPT 5.5）宛：第1弾「FANZA TV 比較記事」一括執行プロンプト（ドラフト）

### ■ 執行命令の背景
vodnavi.jp のインプレッション資産を高単価報酬（新規無料登録）へコンバージョンさせるため、メディア層の主力となる「FANZA TV 徹底比較記事」のドラフト生成を CCO へ執行させるシステムプロンプト。

> **【未検証・要確認】** 報酬単価（CSO 原案「2,200〜2,750円」）は FANZA アフィリエイト管理画面の実レートと突合していない。プロンプト内では具体額を断定せず「高単価の新規無料登録案件」として扱い、実額は KPI シート確定値（月次監査）に従う。

### ■ CCO への一括執行プロンプト（コピー用ドラフト）

```
# 役割
あなたは VODNAVI-GROUP の CCO（最高コンテンツ責任者）です。最高法律
「BRAND_DESIGN_GUIDE.md（ビブリア・エロティカの世界観）」および
「COMPLIANCE_GUIDE.md」に規定された表示要件を100%死守し、読者の知的好奇心と
官能を同時に刺激する最高品質の SEO 比較記事を執筆してください。

# ターゲット・仕様
- 配置パス: vodnavi.jp/src/app/compare/fanza-tv/page.tsx（配備用テキストドラフト）
- メインキーワード: 「FANZA TV 比較」「FANZA TV 評判」「FANZA TV 無料体験」
- 文字数: 5,000〜8,000 文字想定
- トーン＆マナー: 高級ホテルのラウンジ、洗練された夜の書斎。チープな煽り、
  ピンクネオン臭の完全封印。ミステリアスで知的、かつ商業的に強固な誘導。

# 必須構成要素（上から順番に厳格に記述すること）
1. ファーストビュー PR 表記: 記事最上部に「本ページにはアフィリエイトリンクが
   含まれ、規約に準拠した広告表記を行っています」と控えめかつ明確に明記。
2. アンサーファーストの導入（リード文）: 結論として無料体験が最大の成約ポイントで
   あることを冒頭で提示。
3. 高級感あふれる比較テーブル（テキスト表現）: 料金、新規登録時の付与特典、作品数、
   AIコンシェルジュ連携有無。報酬額は断定せず特典の質で訴求。
4. H2セクション（2個目）の中間導線: 迷った読者を
   app.vodnavi.jp/concierge?source=brand_compare へ流す横導線を1箇所のみ設置。
5. 成約の壁を破壊する FAQ: 「登録は匿名で可能か」「支払い履歴は隠せるか」
   「本当にいつでも解約できるか」等の最後の心理的ブレーキを冷徹に解消。
6. 末尾確定 CTA ブロック: ダーク（#121212）×ゴールド（#E5A93C）の対比コピー。
   「官能の図書館の扉を開く」ボタンを配備。URL 抽象化ルールに基づき、
   NEXT_PUBLIC_FANZA_AFFILIATE_ID をバックエンドで経由する仮パス
   /api/auth/fanza-tv へのリンク（直書き af_id の永久禁止）を徹底せよ。
```
