# STRATEGY_BRIEF_037 — ハイブリッド二重装甲戦略（Option 3：両建て採択）

発行: 2026-06-07 / 採番: 036 の次 = **037** / HUMAN 採択: **Option 3**（vodnavi.jp clean content + X/SNS の両建て）
前提: BRIEF_034 §4 境界承認済 / **BRIEF_035（clean scaffold）は retained — supersede しない**

## 1. 物理ファクトの正確な再確認（※原案の domain 取り違えを訂正）
- **検索資産はルートドメイン `vodnavi.jp` にある**: GSC `sc-domain:vodnavi.jp` で表示回数 **81,800** / クリック 2,640 / 平均CTR 3.2% / 平均順位 8.7。これは vodnavi.jp の一般検索資産であり「空の箱」ではない（原案は誤って app.vodnavi.jp に帰属させていた）。
- **`app.vodnavi.jp` は直アクセス主体**: funnel hostName 分割で活動の 98.6% を占めるが、その大半は direct であり GSC 検索 impression ではない。
- **moterist.com**: 検索流入 ~ゼロ（成人デランク最有力、`gsc-panel-audit.json`）。Google organic 集客経路としては機能しない。

## 2. ハイブリッド二重装甲・執行方針（両建て）

### 🛡️ クリーン面（vodnavi.jp / site-brand）— E-E-A-T の盾 兼 clean 集客
- 無差別な記事量産はしない。100% クリーンな E-E-A-T コンテンツ（公式声明・映像心理/教養レンズのピラーコラム=**BRIEF_035 の核**・コンプラ/査読ポリシー）をミニマル高品質で配置。
- 役割: (a) ドメイン信頼性インデックスを支える「盾」、(b) 一般検索からの clean 集客（`?source=brand&intent=*`）。**BRIEF_035 retained**。
- 既実装: `/about` `/privacy` `/terms` + 共通 footer（T-20260606-04、build exit 0）。

### 🚀 アプリ・SNS面（app.vodnavi.jp / X運用）— 成約の矛
- 開発・運用火力を `app.vodnavi.jp` の UI/UX・チャット提案ロジック、および X（旧Twitter）等の外部チャネルからの param 付きインバウンド最適化に集中。
- SNS トラフィックを既設の盾（年齢確認ゲート **`proxy.ts`** / ID 分離 等）でリーガル防衛しつつ、コンシェルジュ成約へ最短誘導。`?source=sns_x&intent=*`。

## 3. source×intent Exploration の解除トリガー（Option 3 = 二系統）
- `?source=brand`（vodnavi.jp clean コラム）**または** `?source=sns_x`（X/SNS）のタグ付きインバウンドが `app.vodnavi.jp` に有意到達した時点で、GA4 Exploration（`G-GG7JV9MJRW`）を起動し source×intent 内訳を定量取得する（`source-intent-exploration.json`）。

## 4. 未確定の HUMAN 判断（申し送り）
- 確定CVR（DMM 管理画面）/ privacy・terms の正式 legal review / X 運用の実リソース割り当て。
