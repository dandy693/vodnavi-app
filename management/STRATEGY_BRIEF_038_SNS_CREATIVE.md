# STRATEGY_BRIEF_038 — CCO向けSNSアフィリエイトポスト量産・サニタイズ指示書

発行: 2026-06-07 / 採番: 037 の次 = **038** / 前提: `STRATEGY_BRIEF_037`（Option 3 ハイブリッド）/ board: T-20260607-03

## 1. 執行目的
`STRATEGY_BRIEF_037` で確定したハイブリッド二重装甲に基づき、X アカウントを「官能の図書館」の世界観へサニタイズし、検索エンジンのアップデートに依存しない高熱量な SNS トラフィックを成約核心（`app.vodnavi.jp`）へ直接送り込むためのクリエイティブ仕様を定義する。

## 2. アカウント・プロフィール変更仕様（宛先：CCO / 実行は HUMAN）
> ⚠️ 対象 X ハンドルは **要確認**（原案は `@vodnavi_jp`。実在ハンドルを HUMAN が確定のこと）。アカウント設定変更・プロフィール公開更新は HUMAN の手動アクション（CTO/AI は実行しない）。
- **アカウント名**: VODNAVI ／ 官能の図書館
- **バイオ**: 今夜、あなたの本能と知性を満たす1本を。心理学・教養のレンズで大人のエンターテインメントを紐解く、次世代映像解析AI「VODNAVI」公式アカウント。※18禁動線あり
- **固定リンクURL**: `https://app.vodnavi.jp/concierge?source=sns_x&intent=beginner`

## 3. ポスト量産のための3大・教養レンズ軸
直接的なアダルトワードを連呼するポストは X の規約 BAN／シャドウバン対象のため禁止。CCO は教養クッション付き長文ポストを 1 日 4 本生成する。

### 🌑 軸1：人間の業と心理学（intent: actress）
- トーン: 演技の緊迫感・視線の心理学を紐解く。
- 動線: `https://app.vodnavi.jp/concierge?source=sns_x&intent=actress`

### 📚 軸2：真夜中のシネマ解釈（intent: wisdom）
- トーン: 「なぜ夜、特定のタブーに魅了されるのか」を行動経済学・哲学の視点から解説。
- 動線: `https://app.vodnavi.jp/concierge?source=sns_x&intent=wisdom`（→ §5 注記参照: 当初案の `vodnavi.jp/about` 経由は SEO 境界の観点で見直し）

### 🌙 軸3：今夜の90分を支配する（intent: beginner）
- トーン: AI による超パーソナライズ選定の優位性を説く。
- 動線: `https://app.vodnavi.jp/concierge?source=sns_x&intent=beginner`

## 4. 厳格ガバナンス
- **直接アフィリンク直書き禁止**: ポスト内に FANZA 直接アフィリエイト URL を含めることはアカウント凍結に直結するため厳禁。すべてのリンクは `app.vodnavi.jp`（または `vodnavi.jp`）のパラメータ付き動線に集約し、サーバー側の年齢確認ゲート（**`proxy.ts`**）を通過させる。

## 5. CTO/SEO 注記（境界防衛）
- ⚠️ **軸2 の clean-domain 経由は再考**: 原案は X（18禁動線あり・成人文脈）の投稿を `vodnavi.jp/about` に着地させる設計だったが、成人文脈の SNS インバウンドを SEO 保護対象の clean ルートドメインに集めると、adult 関連付けシグナルになり得る（BRIEF_034 の「vodnavi.jp を成人シグナルから守る」方針と相反）。**成人文脈の SNS 動線は原則 `app.vodnavi.jp`（年齢ゲート内）へ集約**し、vodnavi.jp clean 面へは「非成人・教養」文脈の投稿のみリンクさせる。よって軸2 の動線も `app.vodnavi.jp` に修正済（上記）。
- **intent 値の taxonomy**: 既登録は `beginner / actress / discount`（GA4 カスタムディメンション）。本書の `wisdom` は新規値のため、採用するなら計測前に GA4 側で値を許容/登録すること。
