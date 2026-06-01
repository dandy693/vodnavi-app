# FEEDBACK MEMORY — エージェント間システム仕様・教訓長期記憶

> 公開ドキュメント。CTO / CSO / CCO / HUMAN 全エージェントが踏襲する不変条件。  
> 改訂時は §2 監査履歴へエントリを追加。

---

## 1. WordPress / WP-CLI に伴う破壊的仕様の防衛線

- **事象**：`wp post update <id> <file>` は、対象ポストの `post_content` を部分更新（Partial Update）するのではなく、ファイルの内容で **100% 完全置換（Wholesale Replace）** する仕様である。
- **禁忌**：CTA追加目的等で、差分HTML（数行）だけを直接流し込む命令を永久に禁止する。これを実行した場合、既存の本文（何百行もの SEO インデックス資産）が虚空に消滅する。
- **正典アプローチ（Option α — Safe Append）**：既存コンテンツを保護した状態でのマージを行う場合は、必ず以下の手順を順守する。
  1. `wp post get <id> --field=post_content` で現在の DB 生データをローカル（または `/tmp`）へバックアップ（退避）
  2. `cat <backup> <staging_html>` で既存データと新 CTA アセットを **末尾結合（Append）** した統合ファイルを作成
  3. 統合ファイルを `scp` で remote に転送、`wp post update <id> /tmp/merged.html` を実行
  4. `curl https://moterist.com/?p=<id> | grep btn__link-primary` で新 CTA の生存を物理確認
  5. 異常時は backup から `wp post update <id> <backup>` でロールバック

- **検証用 grep パターン**：注入後の正常性確認には canonical `btn__link-primary`（THE_THOR_DICTIONARY.md §line 120/147）を必ず含めること。

---

## 2. ランブック整合性の防衛線

- **禁忌**：本番操作を伴うシェルスクリプトで、`wp post get` / `wp post update` / `ssh` 等の **クリティカルコマンドをコメントアウトしたまま** "実行可能ランブック" として landed させない。
- **正典アプローチ**：すべてのクリティカルコマンドは uncomment + 実引数を明示。precondition（staging HTML 存在 / 鍵存在）を head で検査し、失敗時は `exit 1`。
- **shebang は `#!/usr/bin/env bash` または `#!/bin/bash`**。`#!/bash` は kernel が interpreter を解決できず即時 ENOENT で失敗する。

---

## 3. 監査履歴

| 日付 | 改訂者 | 内容 |
|---|---|---|
| 2026-06-01 | CTO (Claude Code) | BRIEF_028 ランブック改修時に検出した複数の theatre-script bug を起点に本防衛線を文書化。Option α (Safe Append) を正典化。inject-brief-028.sh は本規約に準拠して書き直し、commit 38ddeb2 以降に統合。 |
