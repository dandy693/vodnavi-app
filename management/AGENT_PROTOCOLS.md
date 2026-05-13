# AIエージェント間 連携プロトコル (共有メモリ運用ルール)

## リレー形式の自律運営
1. Gemini 3 (CSO) が戦略を策定し `management/STRATEGY_BRIEF.md` を作成/更新する。
2. Claude Opus 4.7 (CTO) がそのブリーフに基づきコードを実装し、`management/CHANGELOG.md` に進捗を記す。
3. ChatGPT 5.5 (CCO) が実装内容に基づき記事や画像を生成し、GitHubに反映する。

## アウトプット標準ルール
- すべての指示と記録は Markdown 形式で `management/` 内に保存すること。
- 成果物は必ず GitHub にプッシュし、他のエージェントが参照可能な状態にすること。
