# 起案 E19 — `ignoreCommand` の「diff 不能」を明示化する（第124便 H・2026-09-12）

> **状態: 起案のみ。実装していない。実装は CSO 承認後（§22-8-1-1-c）。**
> **【厳守】本起案は「原因の特定」ではない。H-shallow は 2026-09-12 裁定2 で支持確定（実測上の閾値＝10・fetch 深度の公式記載は未確認のまま）。暗黙の失敗経路を明示化することと、なぜ失敗したかを突き止めることは別の作業である。**

## 1. 現状（実測）

| 項目 | 実測 |
|---|---|
| 現行 `vercel.json` | `"ignoreCommand": "if git diff --quiet ${VERCEL_GIT_PREVIOUS_SHA:-HEAD^} HEAD -- . 2>/dev/null; then exit 0; else exit 1; fi"` |
| 失敗モード | `git diff --quiet` は **変更なし→0 / 変更あり→1 / 実行不能（比較対象のオブジェクト不在等）→128** を返す。現行は **0 以外をすべて「ビルド」に倒し、`2>/dev/null` で理由を消している** |
| 実測（n=12・§22-8-1-1-b/-d） | `PREV..HEAD` の距離 1〜9＝CANCELED（9件）／距離 10＝READY（2件）／距離 20＝READY（1件）。**差分 0 行でも距離 10 以上で READY** |
| Vercel のログ | `exit 0` のときだけ「canceled because … exit code 0」が出る。**`exit 1` と `exit 128` は区別できない**（§22-8-1-1-a） |
| `VERCEL_GIT_PREVIOUS_SHA` | 公式定義＝「直前の成功デプロイの SHA」。**ビルドログ・API からは実値を取得できない**（§22-8-1-1-b(3)） |
| 影響 | docs のみのコミットで本番ビルドが走り **sitemap が再生成される（`lastmod` が動く）**。2026-09-04〜09-12 で想定外 READY は 4 件（`eaadd42` / `d669889` / `3f97e6c` / `c8b95b9`） |

## 2. 設計要件（§22-8-1-1-c・CSO 固定）

| # | 要件 | 本起案での実現 |
|---|---|---|
| (a) | `diff` の失敗を検出して**明示ログ**を出す | 終了コードを分岐し、`[ignore]` プレフィクスで標準出力へ理由を書く（Vercel ビルドログに残る） |
| (b) | 失敗時はまず `git fetch --deepen` 等で**再試行** | `git fetch --deepen=N`（段階）→ 不能なら `git fetch origin <PREV> --depth=1` → 再度 `git diff` |
| (c) | それでも不能なら **`exit 1`（ビルド）を明示的に選ぶ**＋「diff 不能のためビルド」と記録 | 最終分岐で `exit 1` とログ |
| (d) | 距離 7〜9 は自然に埋まるのを待つ・**観測目的の push 禁止** | 本起案は観測を要求しない |

## 3. 実装案（差分は 2 ファイル・本番コードの実行文には触れない）

### 3-1. `app-concierge/scripts/vercel-ignore-build.sh`（新規）

```bash
#!/bin/sh
# E19 — Vercel Ignored Build Step。diff 不能を隠さない。
#   exit 0 = ビルドをスキップ / exit 1 = ビルドする（Vercel の規約）
# 【厳守】原因の特定はしない。失敗の経路を明示化するだけ。
set -u
PREV="${VERCEL_GIT_PREVIOUS_SHA:-}"
log() { echo "[ignore-build] $*"; }

if [ -z "$PREV" ]; then
  log "VERCEL_GIT_PREVIOUS_SHA is unset (first deploy or no previous success) -> build"
  exit 1
fi

run_diff() {  # 0=no change / 1=changed / other=diff impossible
  git diff --quiet "$PREV" HEAD -- . 2>/tmp/ignore-diff.err
  return $?
}

run_diff; rc=$?
if [ "$rc" -ge 2 ]; then
  log "git diff failed (rc=$rc): $(tr '\n' ' ' </tmp/ignore-diff.err | cut -c1-200)"
  log "commit count HEAD (shallow?): $(git rev-list --count HEAD 2>/dev/null || echo '?') / shallow=$(test -f "$(git rev-parse --git-dir)/shallow" && echo yes || echo no)"
  for depth in 50 200 1000; do
    log "retry: git fetch --deepen=$depth"
    git fetch --deepen="$depth" origin >/dev/null 2>&1 || log "fetch --deepen=$depth failed"
    if git cat-file -e "$PREV^{commit}" 2>/dev/null; then log "PREV now reachable after deepen=$depth"; break; fi
  done
  if ! git cat-file -e "$PREV^{commit}" 2>/dev/null; then
    log "retry: git fetch origin $PREV --depth=1"
    git fetch origin "$PREV" --depth=1 >/dev/null 2>&1 || log "fetch of PREV failed"
  fi
  run_diff; rc=$?
fi

case "$rc" in
  0) log "no changes under $(pwd) vs $PREV -> skip build"; exit 0 ;;
  1) log "changes under $(pwd) vs $PREV -> build"; exit 1 ;;
  *) log "diff impossible even after retry (rc=$rc) -> build (fail-open, per §22-8-1-1-c(c))"; exit 1 ;;
esac
```

### 3-2. `vercel.json` の 1 行

```json
"ignoreCommand": "sh scripts/vercel-ignore-build.sh"
```

- Vercel プロジェクトの Root Directory は `app-concierge/`（現行の `-- .` がその前提）。**スクリプトはその直下の `scripts/` に置く**（`guard-affiliate-id.mjs` と同じ場所）。
- 現行の `if … fi` / `${VAR:-…}` は POSIX sh でも動く構文であり、ビルドコンテナのシェルが bash か sh かは**未確認**。**スクリプトは POSIX 互換（`[ ]` / `case` / `$( )` のみ・配列や `[[ ]]` を使わない）で書き、`ignoreCommand` は `sh scripts/vercel-ignore-build.sh` とする**（bash 依存を作らない）。

## 4. 想定される挙動（実装後）

| ケース | 現行 | 実装後 |
|---|---|---|
| 距離 1〜9・差分 0 行 | CANCELED | CANCELED（ログ「no changes → skip」） |
| **距離 ≥ 10・差分 0 行** | **READY（暗黙）** | **`--deepen` が効けば CANCELED（ログに retry 経緯）／効かなければ READY（ログ「diff impossible → build」）** |
| `app-concierge/` に差分あり | READY | READY（ログ「changes → build」） |
| `PREV` 未設定 | READY | READY（ログ「unset → build」） |

- **【厳守】(c) により「差分 0 行で READY」は実装後も起こりうる。** **判定はログ行「diff impossible … → build」の有無で行う（§22-8-1-1-c の CTO 併記どおり）。**

## 5. 検証（実装後・通常運用のコミットで）

1. **次の docs コミット（距離 1）**: ビルドログに `[ignore-build] no changes … -> skip build` が出て CANCELED。
2. **距離が 10 を超える docs コミット**（自然に到達したとき・観測目的の push はしない）: ログに `git diff failed (rc=128)` → `retry: git fetch --deepen=50` → **`no changes → skip build` で CANCELED** なら (b) が効いた実証。**`diff impossible → build` なら (c) の経路**で、`--deepen` が Vercel の clone で機能しない事実が確定する（それ自体が H-shallow の追加材料）。
3. **`app-concierge/` 差分ありのコミット**: `changes → build` で READY（回帰なし）。
4. **副次**: ログの `commit count HEAD` / `shallow=yes|no` により、**Vercel の clone が shallow か否かが初めて実測される**（§22-8-1-1-b(2) の未確認事項）。

## 6. リスク・併記

| # | 内容 |
|---|---|
| ① | `git fetch --deepen` はビルド時間を数秒〜数十秒延ばす（距離 ≥ 10 のときのみ）。**Vercel の clone に `origin` 資格情報が無い場合は fetch が失敗し (c) へ落ちる**——その場合も現行と同じ結果（ビルド）で、悪化はしない |
| ② | `vercel.json` の変更は `app-concierge/` 配下の差分＝**この起案の実装コミット自体が 1 回ビルドを起こす**（sitemap `lastmod` が動く。公開面凍結は解除済み） |
| ③ | `set -u` で未定義変数を検出するが、`VERCEL_GIT_PREVIOUS_SHA` は `${…:-}` で既定を与えている |
| ④ | **`/tmp/ignore-diff.err` への書き込み**はビルドコンテナ内のみ。秘密値は扱わない |
| ⑤ | **本起案は sitemap の再生成契機（§16-5(1)「デプロイしなくても再生成される」）には触れない**。デプロイ回数を減らすだけである |

## 7. 実装の規模

- 新規 1 ファイル（約 40 行・POSIX sh）＋ `vercel.json` 1 行。**Next.js 側の実行文は変更なし。**
- 検証手段: ローカルで `VERCEL_GIT_PREVIOUS_SHA=<sha> sh scripts/vercel-ignore-build.sh; echo $?` を距離 1 / 変更あり / 存在しない SHA の 3 ケースで実行し、終了コードとログを確認してから push。

**判定・承認: CSO。**
