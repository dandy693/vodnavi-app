# 束2 dry-run #2（2026-09-19 06:55:17〜06:57:53 JST）— CSO判定 2026-09-19 の修正（R12〜R15・PROMPT 改訂）後の 1 回目

- 入力: `20260918-dryrun/` と同一（`input.txt` / `parsed.json` / `targets.json` / `replies.json` をコピー）。`--dry-run --today 2026-09-18`・`claude-opus-5`。
- 結果: 6 件 `generated`・18 案 全ガード通過・API 13 回（再生成 7 回分＝NG 10 案）・input 6,222 / output 8,369・cache_create 10,434 / cache_read 23,592・字数 42〜65（中央値 51）。
- **この実行で見つかったツール側の欠陥（→ #3 で修正）**: `hints.concretes_from_body` に R6 語を含む連続の中の数値（本中の「毎日10発中出し」の 10）が混じり、honnaka の A/B が「10という数字を前面に出したタイトル」という空疎な文になった。修正＝R6 語幹を含む連続の数値は候補から落とす（単位付き＝% 円 位 日 月 弾 作 時 分 は残す）／キーキャップ絵文字（5️⃣0️⃣）を数字に正規化／R15 に「明記され／記載され／前面に出した」を追加。
- 出力: `drafts.json` / `drafts.txt`（NG 案と理由は `drafts.json` の `history`）。**提出用は #3。**
