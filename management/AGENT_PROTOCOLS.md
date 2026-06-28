---
title: "AIエージェント間 連携プロトコル (共有メモリ運用ルール)"
last_updated: "2026-05-29"
status: "active"
---
# AIエージェント間 連携プロトコル (共有メモリ運用ルール)

## リレー形式の自律運営
1. Gemini 3 (CSO) が戦略を策定し `management/STRATEGY_BRIEF.md` を作成/更新する。
2. Claude Opus 4.8 (CTO) がそのブリーフに基づきコードを実装し、`management/CHANGELOG.md` に進捗を記す。
3. ChatGPT 5.5 (CCO) が実装内容に基づき記事や画像を生成し、GitHubに反映する。

## アウトプット標準ルール（CSOファイル書き出し絶対規約）
- すべての指示と記録は Markdown 形式で `management/` 内に保存すること。
- 成果物は必ず GitHub にプッシュし、他のエージェントが参照可能な状態にすること。
- **【最高法律追記】CSO（Gemini 3）がチャット内で Markdown（TASK_BOARD、STRATEGY_BRIEF、成果物ドラフト等）を出力・更新する際は、人間（HUMAN）の手作業によるコピペやファイル作成の手間を100%死滅させるため、必ず「Claude Codeの対話画面へ直接貼り付けてローカルディスクへ自動書き出し（Write/Overwrite to Disk）させる指示文（プロンプトコード）」を同封して出力しなければならない。この指示文を伴わない Markdown の空中提示はガバナンス違反とする。**
- **【2026-06-28 補正】** 上記「自動書き出し」は **新規ファイルの wholesale 書き出しのみ許可**。`TASK_BOARD.md` および履歴を持つ既存正典への変更は **フル上書き厳禁・部分置換のみ**（下記§が line 16 に優先）。

## 【絶対統治規約】TASK_BOARD.md 等 正典文書のフル上書き禁止（2026-06-28 確定）
- `TASK_BOARD.md` および履歴を持つ正典文書（`STRATEGY_BRIEF_*` / `AGENT_PROTOCOLS` / `OPERATION_MANUAL` / `checklists/*`）への変更は **部分置換（in-place Edit / 追記）のみ**を許可する。
- `cat > file` / `fs.writeFileSync(file, <whole>)` 等による **ファイル全体のフル上書き（Full-file rewrite）は、既存の履歴・タスク行・BRIEF を破滅させるため、いかなる理由があっても厳格に禁止** する。新規ファイルの作成および末尾追記（append）は可。
- 自動生成 script がフル上書きを含む場合、CTO は **実行せず** in-place Edit に是正する。**本規約は上記 line 16 の「Write/Overwrite to Disk」マンデートに優先する。**
- **背景**: 2026-06-28 セッションで CSO 生成 script が `cat > TASK_BOARD.md` / `writeFileSync("management/TASK_BOARD.md", …)` により本 board（1,141 行）の消滅を複数回試行。前半は root path bug で偶発回避、最終回は実パス直撃を実行前 review で阻止。

## デザイン・世界観の統制（最高法律）
- [`BRAND_DESIGN_GUIDE.md`](./BRAND_DESIGN_GUIDE.md) を **VODNAVI-GROUP の最高法律** と位置付ける。コード、コピー、画像、UI、AI システムプロンプトの一切が本ガイドの世界観（『ビブリア・エロティカ』）とカラー仕様（`#121212` / `#E0E0E0` / `#D4AF37`）に従う。
- 個別の `STRATEGY_BRIEF_*.md` やコード上の実装が本ガイドと矛盾する場合、**本ガイドの記述を優先**する。矛盾を許容したい場合は、CSO が先にガイドを改訂してから新ブリーフを発行する順序を厳守する。
- CTO / CCO は PR / 記事公開前に [`BRAND_DESIGN_GUIDE.md`](./BRAND_DESIGN_GUIDE.md) §9 のチェックリストを通過させる。HUMAN は世界観と異なる成果物を発見した時点で内容を問わず差し戻す拒否権を持つ。

## 週次データ駆動 PDCA ルーティン
- 毎週 **土曜日 10:00 JST** に CSO（Gemini 3 思考モード）が以下を自動実行する：
  1. **データ取得**：GA4（解析アカウント `moterist.com@gmail.com` / `?authuser=2`）から先週 1 週間分の `source × intent` 別セッション数、`ai_session_start` / `product_click` / `ai_affiliate_click` 発火数を取得。Search Console から各記事の表示回数・CTRを取得。
  2. **データ分析とブリーフ発行**：抽出した物理数値を基に、前週の `STRATEGY_BRIEF` の仮説の勝率を定量的にはじき出し、ボトルネックを冷徹に特定。次期アクションを規定した新ブリーフを発行。
  3. **タスクボード更新**：`TASK_BOARD.md` を最新のGit mainline（HEAD）と同期し、完了タスクを `[x] [Done]` へ移動。
