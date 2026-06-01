# VERIFY BEFORE RESOLVING ALERTS — 非露出型シークレット監査規約

> CTO / CSO / CCO / HUMAN すべてのエージェント・人格は本規約を不変条件として遵守する。  
> 改訂時はバージョン番号を上げ、`management/CHANGELOG.md` に記録する。

---

## 1. 絶対禁則事項（機密の二次汚染防止）

- AIエージェントは、環境変数ファイル（`.env`、`.env.local`、`.env.local.bak`、`.env.production` 等）に対する `cat`、`Read`、`grep <実値>`、またはそれに準ずる「文字列の画面出力コマンド」を **永久に禁止** する。
- トランスクリプト（会話ログ）上に実値が露出した瞬間、その鍵は物理的に死亡（Revoke）したものとみなす。HUMAN への再rotation命令と新規 ALERTS エントリの起票は自動。
- 違反は AI 側の design failure として扱い、当該 tool call と判断根拠を memory に追記する。

---

## 2. 正規監査経路（推奨オペレーション）

実値そのものを表示させるのではなく、以下の **「不在証明」** および **「メタデータ確認」** のみで完結させる。

### (a) 旧値（露出した鍵）の完全パージ確認

旧値のシークレット文字列の **一部（先頭 4-6 字程度の hash prefix）**、または旧 Webhook ハッシュのパターンを用いて検索をかけ、ヒット件数が **0 件** であることを確認する。

```bash
# Bash: 何も出力されない (0 hit) ことをもって解決の証明とする
grep -q "旧シークレットの先頭一部" .env.local && echo "❌ 危険：旧値が残存しています" || echo "✅ 安全：旧値のパージを確認"
```

```powershell
# PowerShell 等価
if (Select-String -Path .env.local -Pattern "旧シークレットの先頭一部" -Quiet) { "❌ 危険：旧値が残存しています" } else { "✅ 安全：旧値のパージを確認" }
```

**禁則**: 新値の値域に対する grep は実施しない（新値が transcript に露出する）。

### (b) ファイル更新時刻（modtime）の確認

HUMAN が手動で書き換えた事実は `LastWriteTime` が現在時刻周辺に飛ぶことで証明される。値の中身は読まない。

```powershell
Get-Item .env.local, app-concierge\.env.local | Select-Object FullName, LastWriteTime | Format-Table -AutoSize
```

```bash
stat -c '%n %y' .env.local app-concierge/.env.local
```

### (c) Git トラック状態の確認

`.env.local` 系は **gitignored** であるべき。誤って tracked になっていれば即座に新規 ALERTS 起票 + HUMAN に通知。

```bash
git check-ignore -v .env.local app-concierge/.env.local
git ls-files .env.local app-concierge/.env.local  # 出力 0 行であること
```

### (d) クライアントバンドル経由の本番値検証（NEXT_PUBLIC_* 限定）

Next.js の `NEXT_PUBLIC_*` 系は本番ビルド時にクライアントバンドルへ焼き込まれる。本番側の有効値を確認したい場合は `vercel env` ではなく **本番公開 URL を curl して bundle を grep する**（公開済の出力を読むだけ）。

```bash
curl -sL https://app.vodnavi.jp/ | grep -oE 'moterist-[0-9]{1,4}' | sort -u
```

これは公開 HTML の静的 scan であり、機密へのアクセスでない。`vercel env ls production` は auto-mode classifier が "Production Reads violation" として deny する正規挙動と整合。

---

## 3. ALERTS resolved flip 時の必須チェックリスト

`management/ALERTS.md` のセキュリティ系エントリを `status: open` → `resolved` に flip する前に、**すべて** をクリアすること：

- [ ] (a) 旧値の grep が 0 hit を返す
- [ ] (b) 関連 env ファイルの modtime が rotation 実施時刻と整合（数分以内）
- [ ] (c) gitignored 状態を確認（`git ls-files` で 0 件）
- [ ] sed scope は **対象エントリ単独** に narrow（例：`/<date+time>/,/github_issue/` 範囲）。グローバル `s/status | open/status | resolved/g` は **永久禁止**（無関係 open エントリの誤 close）
- [ ] 関連 `management/TASK_BOARD.md` の declaration が ALERTS 状態と整合（先行 declaration は ALERTS 側を真実源として疑う）
- [ ] commit message に「physical evidence: modtime + old-value 0-hit」を明記

---

## 4. 違反時の処理

1. 違反検出 → 即座に作業停止
2. `management/ALERTS.md` に新規 [high]/open エントリを追加（symptom: どの tool call で何の値が transcript に露出したか）
3. HUMAN に再 rotation 命令を提示（経路 B: 自分の terminal でファイル編集 / 経路 A: 新値を chat に貼り付け）
4. 関連 memory（`feedback_verify_before_resolving_alerts`）に事後評価を追記
5. 露出した secrets は revoke 済として扱い、新鍵 / 新 URL を発行

---

## 5. 関連メモリ・規約

| 区分 | 名称 | 場所 |
|---|---|---|
| 私的 memory（CTO Claude のみ参照） | `feedback_verify_before_resolving_alerts` | `~/.claude/projects/.../memory/` |
| 戦略矛盾 push back | `feedback_push_back_on_contradictions` | 同上 |
| mixhost SSH classifier block | `reference_mixhost_ssh_classifier_block` | 同上 |
| 本規約（公開、全エージェント参照可） | `verify-before-resolving-alerts` | `management/_memory/`（本ファイル） |

---

## 6. 改訂履歴

| 版 | 日付 | 改訂者 | 内容 |
|---|---|---|---|
| v1.0 | 2026-06-01 | CTO (Claude Code) 起案 / CSO 承認 | 初版。trans crit 露出インシデント (commit fab76f2 周辺) を起点に CSO が公開ドキュメント化を指示。 |
