# AIエージェント間 連携プロトコル (共有メモリ運用ルール)

## リレー形式の自律運営
1. Gemini 3 (CSO) が戦略を策定し `management/STRATEGY_BRIEF.md` を作成/更新する。
2. Claude Opus 4.7 (CTO) がそのブリーフに基づきコードを実装し、`management/CHANGELOG.md` に進捗を記す。
3. ChatGPT 5.5 (CCO) が実装内容に基づき記事や画像を生成し、GitHubに反映する。

## アウトプット標準ルール
- すべての指示と記録は Markdown 形式で `management/` 内に保存すること。
- 成果物は必ず GitHub にプッシュし、他のエージェントが参照可能な状態にすること。

## デザイン・世界観の統制（最高法律）
- [`BRAND_DESIGN_GUIDE.md`](./BRAND_DESIGN_GUIDE.md) を **VODNAVI-GROUP の最高法律** と位置付ける。コード、コピー、画像、UI、AI システムプロンプトの一切が本ガイドの世界観（『ビブリア・エロティカ』）とカラー仕様（`#121212` / `#E0E0E0` / `#D4AF37`）に従う。
- 個別の `STRATEGY_BRIEF_*.md` やコード上の実装が本ガイドと矛盾する場合、**本ガイドの記述を優先**する。矛盾を許容したい場合は、CSO が先にガイドを改訂してから新ブリーフを発行する順序を厳守する。
- CTO / CCO は PR / 記事公開前に [`BRAND_DESIGN_GUIDE.md`](./BRAND_DESIGN_GUIDE.md) §9 のチェックリストを通過させる。HUMAN は世界観と異なる成果物を発見した時点で内容を問わず差し戻す拒否権を持つ。

## 週次データ駆動 PDCA ルーティン
- 毎週 **土曜日 10:00 JST** に CSO（Gemini 3 思考モード）が以下を自動実行する：
  1. **データ取得**：GA4（解析アカウント `moterist.com@gmail.com` / `?authuser=2`）から先週 1 週間分の `source × intent` 別セッション数、`ai_session_start` / `product_click` / `ai_affiliate_click` 発火数を取得。Search Console から各記事の表示回数・CTR・平均掲載順位とインデックス異常を取得。
  2. **5 指標で診断**：送客率（PV → app 遷移）、CVR（`ai_session_start` → `ai_affiliate_click`）、Search Visibility（順位変動）、記事品質（滞在時間・スクロール深度）、コンプラ（`noindex` / `canonical` の意図しない変更）。
  3. **自動アクション**：
     - 送客率が前週比 **-20% を超える記事** を抽出し、CCO 宛に `STRATEGY_BRIEF_RW_<記事ID>_<YYYYMMDD>.md` 形式の **リライト指示書** を自動発行する。
     - CVR が `intent` 別目標を下回るチャネルに対し、CTO 宛に **A/B テスト指示書** を発行。
     - 11〜20 位に落ちたクエリを抽出し、CCO 宛に **Information Gain 強化指示**（独自分析・実体験段落の追加）を発行。
  4. **記録**：全結果を `management/_metrics/<YYYY-WW>/saturday-review.md` に保存し、重要トピックは正式 `STRATEGY_BRIEF_<XXX>.md` に昇格させる。
- 異常検知ラインは [`KPI_DASHBOARD.md`](./KPI_DASHBOARD.md) の「異常検知ライン」セクションおよび [`BRAND_DESIGN_GUIDE.md`](./BRAND_DESIGN_GUIDE.md) §6.2 と整合させる。
- 本ルーティンは「忘却を許さない」設計であり、CSO のカレンダー固定タスクとして人間オペレーター（HUMAN）が初期化する。
