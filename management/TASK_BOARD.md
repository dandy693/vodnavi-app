# TASK BOARD — VODNAVI-GROUP

AI エグゼクティブ・チームの進捗管理表。CSO (Gemini 3) が [`STRATEGY_BRIEF_*.md`](./) で発行した戦略をここでタスクに分解し、CTO / CCO が消化していく。

## 運用ルール

- **タスク粒度**：1 タスク = 1 PR / 1 記事 / 1 画像セット を目安に。
- **記法**：
  - `- [ ] [担当] タイトル — 補足` の形式。
  - 関連ブリーフがあれば末尾に `(brief: STRATEGY_BRIEF_001)` と付ける。
  - 完了時はチェックを `[x]` にし、[Done] セクションへ移動して「完了日 / 関連 CHANGELOG エントリ」を併記する。
- **担当タグ**：`CTO` (Claude Opus 4.7) / `CCO` (ChatGPT 5.5) / `CSO` (Gemini 3) / `HUMAN` (オペレータ)。
- **WIP 制限**：In Progress は担当ごとに最大 2 件。詰まったら Backlog に戻す。
- **更新責務**：タスクを動かしたエージェントが同じ PR/コミットでこのファイルを更新する。

---

## [Backlog]

新規タスクはまずここに積む。優先度の高いものを上に並べる。

- [ ] [HUMAN] DMMアフィリエイト管理画面にて、vodnavi.jp および app.vodnavi.jp を『副サイト』として登録・申請し、監査による成果没収リスクを完全排除する
- [ ] [CTO] app-concierge/ にて、アクセス直後の年齢確認モーダル（18歳以上判定クッキー）および未通過時のAPI遮断ロジックの実装
- [ ] [HUMAN/CTO] mixhostの wp-config.php または管理画面にて、WordPressコア、テーマ、プラグインの『自動更新』を完全に停止（手動制御化）し、生HTMLインジェクションの自動破壊を永久防止する
- [ ] [CTO] app-concierge/ にて、NODE_ENV === 'production' 以外では本番GA4（G-GG7JV9MJRW）スクリプトを発火させず、console.log にフォールバックするデータ汚染防止ロジックの強制実装
- [ ] [CTO] app-concierge/ の商品カードアフィリンク生成部に、作品詳細URLの404エラーに備えた「女優名/型番による検索結果一覧URL」への自動フォールバック/ダブルリンクボタン構造の抽象化実装
- [ ] [CTO] site-brand/ の骨組みをNext.jsモノレポ内にBRAND_DESIGN_GUIDEに基づきミニマル構築
- [ ] [CTO] app-concierge/ のUI配色およびカードコンポーネントをBRAND_DESIGN_GUIDE（ダーク×ゴールド）に適合
- [ ] [CTO] app-concierge/ のDBスキーマ（recommendationsテーブル等）に将来の拡張用 `asp_name`（初期値 'fanza'）カラムを予備実装 (brief: STRATEGY_BRIEF_001_ASP)
- [ ] [CCO] Moterist の主要記事 5 本の末尾 CTA を `https://app.vodnavi.jp/concierge?source=moterist` に差し替え (brief: STRATEGY_BRIEF_001)
- [ ] [CCO] VODNavi ブランドサイトの「コンシェルジュへ」リンクに `?source=brand` を付与 (brief: STRATEGY_BRIEF_001)
- [ ] [CTO] `source` 値を GA4 `ai_session_start` イベントに送信する計測実装 (brief: STRATEGY_BRIEF_001)
- [ ] [CSO] STRATEGY_BRIEF_002 — `source` 別 CVR 計測と次の最適化軸を策定
- [ ] [CTO] `site-brand/` の初期スキャフォールド（Next.js or 静的サイト）構築方針の決定と着手
- [ ] [HUMAN] `docker-env/` に Postgres + ローカル開発用 docker-compose を整備

## [In Progress]

担当が着手したものを移動。動き出した時点で担当タグを必ず付ける。

- _(現在進行中のタスクなし)_

## [Done]

完了したタスクの履歴。詳細は [`CHANGELOG.md`](./CHANGELOG.md) を参照。

- [x] [CTO] Windows 側環境構築 総仕上げ完了 — `app-concierge` 法務 3 ページを `COMPLIANCE_GUIDE.md` に整合化 / `ARTICLE_TEMPLATE.md` 新設（コンシェルジュ誘導組込み）/ `vercel.json` で東京リージョン (hnd1) 指定 + `next.config.ts` にセキュリティヘッダー追加 — 完了 2026-05-14
- [x] [CTO] 管理インフラ構築完了 — `REVENUE_LOG.md` / `KPI_DASHBOARD.md` / `COMPLIANCE_GUIDE.md` / `MARKETING_PILLARS.md` を整備し、収益・KPI・コンプラ・マーケ柱の運用基盤を確立 — 完了 2026-05-14
- [x] [CTO] 運用基盤ドキュメント整備 — ルート `README.md` / `TASK_BOARD.md` / `OPERATIONS_FLOW.md` / `app-concierge/.env.example` を作成 — 完了 2026-05-14
- [x] [CTO] `/concierge` に URL パラメータ `source` を導入し、流入元別の挨拶 / system addendum を切替 — 完了 2026-05-14 (brief: STRATEGY_BRIEF_001 / CHANGELOG: 2026-05-14)
- [x] [CSO] STRATEGY_BRIEF_001 「流入元別パーソナライズの起点を作る」発行 — 完了 2026-05-14
