# STRATEGY_BRIEF_039 — CCO向けXプロフィール＆教養ポスト3軸実弾ドラフト

発行: 2026-06-07 / 採番: 038 の次 = **039** / 前提: `STRATEGY_BRIEF_038` / board: T-20260607-03

## 1. 執行背景
`STRATEGY_BRIEF_038` の仕様に基づき、CCO が実アカウント（`@vodnavi_jp` ※**ハンドル未検証**）のサニタイズおよび日々のポストを迷いなく出力するためのテンプレート＋3軸ドラフトを定義する。**プロフィール変更・投稿の実行は HUMAN/CCO の手動アクション**（CTO/AI は X を操作しない）。

## 2. Xプロフィール・テンプレート（コピペ用）
- **アカウント名**: VODNAVI ／ 官能の図書館
- **バイオ**: 今夜、あなたの本能と知性を満たす1本を。心理学・教養のレンズで大人のエンターテインメントを紐解く、次世代映像解析AI「VODNAVI」公式アカウント。※18禁動線あり
- **ウェブサイトURL**: `https://app.vodnavi.jp/concierge?source=sns_x&intent=beginner`

## 3. 教養レンズ・実弾ポスト3軸ドラフト（CCO出力標準）

### 🌑 軸1：人間の業と心理学（intent: actress）
- トーン: 紳士・淑女の語り口、映画批評、知的好奇心
- ポスト案: 「視線の交錯が、言葉以上に雄弁に欲望を語る瞬間がある。シネマにおける『視線の心理学』は、人間の隠された本能を最も冷徹に暴き出すレンズです。今夜、その緻密な心理描写に溺れるための至高の映像。AIコンシェルジュがあなたの書斎に処方箋を用意しました。今夜の気分を伝えてみてください。」
- 添付URL: `https://app.vodnavi.jp/concierge?source=sns_x&intent=actress`（成人文脈 → 年齢ゲート app 側へ隔離）

### 📚 軸2：真夜中のシネマ解釈（intent: wisdom）
- トーン: 100% クリーン、学術的・映画教養（成人語を含めない）
- ポスト案: 「なぜ私たちは、夜の静寂の中で不条理な物語やタブーの美学に強く魅了されるのか。そこには人間の行動経済学的な喪失回避と、自己探求のナラティブセラピーが深く関わっています。映画の持つ文化的・心理学的価値を紐解く公式コラムを公開しました。知性を満たす夜の読書としてお納めください。」
- 添付URL: `https://vodnavi.jp/about?source=sns_x&intent=wisdom`（clean ルートドメイン）
- 注（BRIEF_038 §5 との整合）: clean ドメイン直リンクは **軸2 のように投稿コピー自体が 100% 非成人の場合に限り許容**。軸1/軸3 のような成人文脈の投稿は `app.vodnavi.jp`（年齢ゲート内）に限定し、`vodnavi.jp` へは向けない。アカウント全体は 18禁動線ありのため、clean ドメインへ向けるリンクは「非成人コピー」を厳格条件とする。

### 🌙 軸3：今夜の90分を支配する（intent: beginner）
- トーン: 高級ラウンジの案内、決定疲労の解消
- ポスト案: 「無数に並ぶタイトルの前で、ただ時間が過ぎていく退屈。それはあなたの感性が本当に求めている一本に出会えていないからです。VODNAVIのAIコンシェルジュは、チープなランキングを排し、あなたの孤独と欲望の深淵にシンクロする映像だけを静かに提示します。今夜の90分を、迷わない。」
- 添付URL: `https://app.vodnavi.jp/concierge?source=sns_x&intent=beginner`

## 4. CTO 実装メモ（※原案 §4 の技術記述を訂正）
- 🔴 **真の code gap は `source=sns_x` の未登録**: `app-concierge/src/lib/concierge/sources.ts` の `ConciergeSource` 型は現状 `"default" | "moterist" | "brand" | "app_detail"` のみ。`sns_x` は未定義のため `resolveConciergeSource` が **`default` greeting にフォールバック**する。SNS 流入専用の挨拶/コンテキストを出したい場合は、`sns_x` を型 + `PROFILES` に追加する（CTO タスク、`app-concierge/AGENTS.md` の Next.js 注意に従い実装前にガイド確認）。
- ⚠️ **`intent=wisdom` は GA4「登録」不要**: `intent` は event-scoped GA4 カスタムディメンションで、任意の値を自動捕捉する。よって原案 §4 の「CTO 登録完了まで計測が沈黙する」は誤り。`sources.ts` は **source** を扱い **intent を扱わない**ため、intent を sources.ts へ追記するのも誤り。
- ℹ️ **taxonomy 整合**: 既登録 intent は `beginner / actress / discount`。`wisdom` は新規値。計測の一貫性のため、wisdom を正式採用するか既存値に寄せるかは CSO 判断（GA4 捕捉自体は値追加なしで可能）。
