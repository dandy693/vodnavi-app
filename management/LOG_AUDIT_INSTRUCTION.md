# GA4 / Search Console 物理ファクト調査・リライト指示書

## 1. 目的
アクセス数低迷の「真の原因」を、憶測を交えずに生データから冷徹に特定する。

## 2. 監査チェックリスト（エージェントは以下の生データをスキャンせよ）
- **ホスト名（Hostname）別トラフィックの識別**:
  - `moterist.com`（?source=moterist）からの流入は物理的に生存しているか？
    - ※既知の前提: moterist 検索流入はほぼゼロ（[[project_moterist_zero_search_inflow]]）。集客実体は vodnavi.jp。
  - `vodnavi.jp` および `app.vodnavi.jp` のドメイン間で GA4 クッキーは正常に引き継がれているか？
    - ※既知の前提: cross-domain は 1.4%、intra-app 98.6%（[[project_funnel_intra_app_reclassified]]）。
- **インデックス状態の監査**:
  - Search Console にて、M-05 で投入した 50 ジャンル・56 女優のページは「登録済み」になっているか？「検出 - インデックス未登録」737 バケットで燻っていないか？
    - ※既知の前提: 立ち上げ初期＋クロール予算が本質（[[project_actress_hub_first_measurement]]）。CTR ではない。
- **ミドルウェア・年齢確認の生存**:
  - 年齢確認（proxy.ts、[[project_age_gate_shield_is_proxy_ts]]）通過時に GA4 の page_view が二重発火、または遮断（Drop）されていないか？

## 3. 次なる対策への接続（M-06 の即時トリガー）
インデックス未登録、またはクローラーの巡回効率不足が判明した場合、タスクボードに定義済みの
「M-06：Next.js 自動セマンティック内部リンク網最適化」を即時執行フェーズへと移行する（moterist は完全凍結維持）。

## 4. 監査の作法（ガバナンス）
- 全数値は GA4 / GSC の生データ・本番 curl からの物理ファクトのみ。脳内推測・ハルシネーションは 100% 禁止。
- 既知の前提（上記 ※）は前回診断の確定事実。再診断時に矛盾が出た場合は、declaration ではなく物理証跡を優先し pushback すること。
