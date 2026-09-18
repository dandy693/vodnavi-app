# 束2 dry-run（2026-09-18 の 6 件・着地報告用）— 状態: **生成は未実行（ANTHROPIC_API_KEY が空）**

| ファイル | 内容 |
|---|---|
| `input.txt` | 9/18 リプ営業初日の対象 6 件を 1 行形式で。本文＝x.com 投稿ページの `<title>`（CSO ログイン済み Chrome・読み取りのみ・2026-09-18 23:3x JST）／投稿日時＝`target_post_id` の snowflake 復元（JST）／作品コード＝投稿に無いため省略（全件 知識なしモード） |
| `parsed.json` | `parse.mjs` の出力（ok 6 / ng 0・警告 0） |
| `targets.json` | Airtable MCP `x_targets` 読み戻し（6 件・`status=稼働`・`reply_restriction=なし`・`last_reply_at` 9/18） |
| `replies.json` | Airtable MCP `x_replies` 読み戻し（`20260918-*` 6 行） |
| `stub.json` / `drafts-stub-stopcheck.json` | API を呼ばない stub 実行。**`--today 2026-09-18` で 6 件とも「停止（同日同ハンドル 2 件目）」＝裁定 G の停止判定が効くことの確認** |
| `knowledge-check/` | 作品知識経路の疎通（`pxvr00483`・PK 照会 1 件ヒット・`--extract` で URL/af_id が落ちること）。dry-run 6 件とは別 |

## 未実行の理由（実測 2026-09-18 23:46 JST）

- `app-concierge/.env.local` の `ANTHROPIC_API_KEY` は **キー名はあるが値が空（`""`・2 文字）**。`node --env-file` で読み込んでも `process.env.ANTHROPIC_API_KEY` は空。
- 資格情報の値の取得・配置は CTO の禁止事項（FACT §13-0 / §27-4）。**HUMAN が値を置いた後に次のコマンドで生成する**（API を呼ぶのはこの 1 コマンドだけ・6 件 × 最大 3 回）:

```
node --env-file=app-concierge/.env.local management/tools/x-reply-drafts/generate.mjs \
  --parsed management/_metrics/2026-W38/bundle2/runs/20260918-dryrun/parsed.json \
  --targets management/_metrics/2026-W38/bundle2/runs/20260918-dryrun/targets.json \
  --replies management/_metrics/2026-W38/bundle2/runs/20260918-dryrun/replies.json \
  --today 2026-09-18 --dry-run \
  --out management/_metrics/2026-W38/bundle2/runs/20260918-dryrun/drafts.json
```

- `--dry-run` は停止判定（同日 2 件目・記録済み URL）を無効化して生成だけ行う。出力に `dry_run: true` が付き、`record.mjs --create` は記録 payload を作らない。
- 無効なキーでの経路確認は実施済み: `API 401 authentication_error: invalid x-api-key`（キーの値は出力に載らない・課金なし）。
