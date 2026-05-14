# OPERATIONS FLOW — AI 連携運用フロー

VODNAVI-GROUP における「戦略 → 実装 → デプロイ → コンテンツ拡散」の具体的な AI 連携手順。[`AGENT_PROTOCOLS.md`](./AGENT_PROTOCOLS.md) のリレー形式を、実務手順まで落とし込んだもの。

## 0. 前提：共有メモリと役割分担

- **共有メモリ**：GitHub リポジトリ `VODNAVI-GROUP`。すべての指示・進捗は `management/` 配下の Markdown でやり取りする。
- **役割**：
  - CSO (Gemini 3) — 戦略策定 / リスク分析 / ブリーフ発行。
  - CTO (Claude Opus 4.7) — 設計・実装・テスト・CHANGELOG 記録。
  - CCO (ChatGPT 5.5 + Image 2) — 記事・画像・SNS 投稿の生成。
  - HUMAN — 各 AI 間のリレー仲介、最終承認、デプロイトリガ。

```
┌───────────┐   brief    ┌───────────┐   PR     ┌───────────┐   merge    ┌─────────┐
│ CSO       │  ────────▶ │ CTO       │ ───────▶ │ HUMAN レビュー │ ──────────▶ │ main / Vercel │
│ (Gemini 3)│  Brief.md   │ (Claude)  │  GitHub  │              │              │ 本番反映 │
└───────────┘            └───────────┘          └──────┬────────┘              └────┬────┘
                                                       │ 完了通知                     │
                                                       ▼                              ▼
                                                  ┌───────────┐               ┌────────────┐
                                                  │ CCO       │ ──── 記事/画像/SNS ────▶ │ Moterist 等 │
                                                  │ (ChatGPT) │                       └────────────┘
                                                  └───────────┘
```

---

## 1. 戦略フェーズ（CSO）

**目的**：事業仮説 → 検証可能な実装スコープへの翻訳。

### 手順
1. **インプット集約**
   - `management/MASTER_PLAN.md` の北極星目標。
   - `management/CHANGELOG.md` 直近エントリ（前回までの実装状況）。
   - GA4 / 売上ダッシュボードの数値（HUMAN が共有）。
2. **ブリーフ起草**：`management/STRATEGY_BRIEF_{連番}.md` を新規作成。
   - セクション：`戦略的狙い (Why)` / `今回のスコープ (What)` / `制約と非機能要件 (How)` / `CTO への要求成果物` / `検証ライン`。
3. **タスク化**：[`TASK_BOARD.md`](./TASK_BOARD.md) の `[Backlog]` に当該ブリーフを 1 行で追加（`(brief: STRATEGY_BRIEF_NNN)` 付き）。
4. **GitHub にプッシュ**して終了。次は CTO の番。

### 守る線
- ブリーフは**最小実装スコープで切る**。1 ブリーフ = 1 PR を理想とする。
- 計測ライン（どの数値が動けば成功か）を必ず書く。

---

## 2. 実装フェーズ（CTO）

**目的**：ブリーフを安全・最短経路で動くコードに変換する。

### 手順
1. **ブリーフ精読**：`STRATEGY_BRIEF_NNN.md` を 1 行ずつ「守る線」と「成果物」に分解。
2. **タスクボード更新**：該当タスクを `[Backlog]` → `[In Progress]` に移動。
3. **作業ブランチ作成**：`feat/brief-NNN-<slug>` のような命名。
4. **実装**：
   - サブプロジェクト（`app-concierge/` 等）の `CLAUDE.md` / `AGENTS.md` を遵守。
   - 既存のキャッシュ境界、依存ポリシー、prototype pollution 等のセキュリティラインを破らない。
5. **検証（最低ライン）**：
   - `npx tsc --noEmit`
   - `npx eslint <変更ファイル>`
   - `npx next build`（routing が変わる変更のみ）
   - UI 変更があれば `npm run dev` で実機確認。
6. **記録**：[`CHANGELOG.md`](./CHANGELOG.md) の先頭に新規エントリを追加。
   - サマリ / 変更ファイル / 設計上の判断 / 検証結果 / CCO への申し送り を必ず書く。
7. **PR 作成**：本文は CHANGELOG のセクションをそのまま貼る。
8. **タスクボード更新**：マージされたら `[In Progress]` → `[Done]` に移動。

### 守る線
- 仕様の解釈に揺れがあったら**勝手に拡張せず**、ブリーフへ準拠した最小解を採る。
- セキュリティ修正 / 緊急バグ以外は `main` 直 push 禁止、必ず PR 経由。

---

## 3. デプロイフェーズ（HUMAN + CTO 補助）

**目的**：マージ済みコードを本番に反映し、戻し可能な状態を保つ。

### 対象別フロー

| 対象 | デプロイ手段 | 反映タイミング |
| --- | --- | --- |
| `app-concierge/` | Vercel（`main` プッシュで自動デプロイ） | マージ即時 |
| `site-moterist/` (WordPress) | テーマ・記事は `site-moterist/07_wp/` から手動アップロード（HUMAN） | バッチ反映 |
| `site-brand/` | （構築方針決定後に追記） | TBD |

### チェックリスト
- [ ] PR がマージ済み、`main` が green。
- [ ] Vercel のプレビュー URL で疎通確認済み。
- [ ] 環境変数の変更が必要な場合、Vercel と `.env.example` を**同時に**更新済み。
- [ ] 本番反映後、`/concierge` などの主要動線をスマホ実機で 1 往復確認。

### ロールバック
- Vercel ダッシュボードから「Previous Deployment → Promote」で即時戻し。
- それと同時に `CHANGELOG.md` に「Reverted: ...」エントリを追加する。

---

## 4. コンテンツ生成フェーズ（CCO）

**目的**：実装された機能を集客導線（Moterist / SNS）に乗せ、流入を生み出す。

### トリガ
- CTO の CHANGELOG エントリ末尾「次の CCO への申し送り」セクションが付いたとき。
- もしくは CSO ブリーフで CCO 側成果物が要求されているとき。

### 手順
1. **入力確認**：最新の CHANGELOG エントリと該当ブリーフを読む。
2. **記事 / 画像生成**：
   - 記事原稿は `site-moterist/03_content/` に Markdown で保存。
   - サムネ・OG 画像は `site-moterist/03_content/<記事スラッグ>/images/` に配置。
   - CTA は CHANGELOG の申し送りに記された URL（例：`?source=moterist`）を必ず使用。
3. **SNS 文面生成**：`site-moterist/04_x-operation/` 配下に投稿テンプレを保存。
4. **タスクボード更新**：該当タスクを `[Done]` に移動し、生成物のパスを記載。
5. **GitHub にプッシュ**して終了。HUMAN が WordPress / X へ反映する。

### 守る線
- 記事末尾 CTA の URL は**自分で組み立てず、CHANGELOG の申し送りをそのまま使う**（クエリの取りこぼし防止）。
- センシティブ表現・薬機法・景表法に該当しないか自己チェック。

---

## 5. 計測 → 次サイクルへ

- 月次（または週次）で HUMAN が GA4 / FANZA アフィリエイト管理画面の数値を `management/` に貼り出す。
- CSO はその数値を次のブリーフ起草インプットとして使う。

これでループが閉じる。**戦略 → 実装 → 反映 → 集客 → 計測 → 戦略**。

---

## 付録：1 サイクル分のチェックリスト

新しいブリーフを 1 つ流すときの最短経路：

1. [ ] CSO: `STRATEGY_BRIEF_NNN.md` 起草・push
2. [ ] CSO: `TASK_BOARD.md` の Backlog に追記
3. [ ] CTO: ブランチ作成 → 実装 → 検証
4. [ ] CTO: `CHANGELOG.md` 追記 → PR
5. [ ] HUMAN: レビュー → マージ → 本番疎通確認
6. [ ] CCO: 申し送りに従い記事 / 画像 / SNS 生成 → push
7. [ ] HUMAN: WordPress / X へ反映
8. [ ] HUMAN: 数値を観測 → 次の CSO ブリーフへ
