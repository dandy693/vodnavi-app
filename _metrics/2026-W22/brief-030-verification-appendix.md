# BRIEF 030 補遺 — OpenAI Key 通電監査の物理結果

## 1. 第一試行（失敗、honest 記録）

- **執行日時**: 2026-06-01 13:30 JST
- **コマンド**: `cd app-concierge && node --experimental-strip-types scripts/generate-work-reviews.ts --mode=live --target=gkok00002 --force`
- **結果**: ❌ `FAIL gkok00002 (fanza fetch error: DMM_API_ID / DMM_AFFILIATE_ID が .env.local に未設定です。)`
- **原因**: 2 段の構造問題
  - `app-concierge/.env.local` に `DMM_*` env vars が不在
  - スクリプトは `process.env.DMM_API_ID` 直読み、`dotenv` / `loadEnvConfig` 等の自動 load 機構なし → `node script.ts` 単体起動では `.env.local` が反映されない

## 2. 復旧経路

- HUMAN が `app-concierge/.env.local` に root から `DMM_API_ID` と `DMM_AFFILIATE_ID` を追記（modtime 2026-06-01 21:58:56 で確認）
- CTO は Node 20+ ネイティブの `--env-file=.env.local` フラグで explicit load を採用

## 3. 第二試行（成功、物理証跡）

- **執行日時**: 2026-06-01 22:00 JST 頃
- **コマンド**:
  ```bash
  cd app-concierge
  node --env-file=.env.local --experimental-strip-types scripts/generate-work-reviews.ts --mode=live --target=gkok00002 --force
  ```
- **結果**: ✅ `REWRITE gkok00002 → ...gkok00002.md (chars=164, source=live usage=in:938 out:679 total:1617)`
- **物理ファクト**:
  - OpenAI API への 1 call 完了、合計 1,617 tokens (in:938 / out:679)
  - 出力ファイル `app-concierge/src/data/work-reviews/gkok00002.md` が `source: live` で書換え（前回 5/27 生成、本日 6/1 再生成）
  - 新 rotation 後の `OPENAI_API_KEY` が runtime で正常稼働することを物理確証

## 4. 副次的発見（minor）

- AI SDK warning: "System messages in the prompt or messages fields can be a security risk because they may enable prompt injection attacks. Use the system option instead when possible."
- AI SDK warning: "openai.responses / gpt-5.5 — The feature 'temperature' is not supported. temperature is not supported for reasoning models"
- いずれも non-blocking。`scripts/generate-work-reviews.ts` の prompt 構造調整候補（system option 切替え）+ temperature 削除候補（gpt-5.5 reasoning model 系では無視されるため）。優先度低。

## 5. 結論

- **BRIEF_030 §1 (chat live) と §2 (batch script) の全条件 物理確証完了**
- 新 OpenAI key (post-rotation) は production pipeline 全段で疎通
- 27 cids 全体の再生成は不要（既に live 状態）、必要に応じ Saturday-Review で intent 別 CVR データを見て決定
- スクリプトの env loading は将来的に `dotenv.config()` または `import 'dotenv/config'` 追加で `--env-file` 不要化が望ましい（minor refactor candidate）

## 6. 関連 memory

- [[verify-before-resolving-alerts]] — 第一試行の失敗時に false success 宣言を回避、HUMAN 操作後の verify を経て真の成功確認
- [[reference_google_accounts]] / [[ga4-property-access-redirect]] — 同セッションで活用

*end of appendix — 2026-06-01 22:00 JST landed*
