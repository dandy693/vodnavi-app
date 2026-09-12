#!/bin/sh
# E19 — Vercel Ignored Build Step（第124便 裁定5・2026-09-12 採用）。
#   exit 0 = ビルドをスキップ / exit 1 = ビルドする（Vercel の規約）
# 旧 ignoreCommand:
#   if git diff --quiet ${VERCEL_GIT_PREVIOUS_SHA:-HEAD^} HEAD -- . 2>/dev/null; then exit 0; else exit 1; fi
# 旧式は `git diff` が実行不能（rc=128・比較対象のオブジェクト不在等）でも else 側＝
# ビルドへ落ち、2>/dev/null が理由を消していた。差分 0 行の docs コミットが READY に
# なる事象（§22-8-1-1・実測上の閾値＝距離 10）の暗黙経路がこれ。
# 本スクリプトは (a) diff 失敗を検出して明示ログ (b) fetch --deepen で再試行
# (c) それでも不能なら exit 1（ビルド）を明示的に選ぶ（§22-8-1-1-c）。
# 【厳守】原因の特定はしない。失敗の経路を明示化するだけ。
set -u

PREV="${VERCEL_GIT_PREVIOUS_SHA:-}"
ERR_FILE="${TMPDIR:-/tmp}/ignore-diff.err"

log() { echo "[ignore-build] $*"; }

if [ -z "$PREV" ]; then
  log "VERCEL_GIT_PREVIOUS_SHA is unset (first deploy or no previous success) -> build"
  exit 1
fi

# 0=no change / 1=changed / other=diff impossible
run_diff() {
  git diff --quiet "$PREV" HEAD -- . 2>"$ERR_FILE"
  return $?
}

prev_reachable() {
  git cat-file -e "$PREV^{commit}" 2>/dev/null
}

run_diff
rc=$?

if [ "$rc" -ge 2 ]; then
  log "git diff failed (rc=$rc): $(tr '\n' ' ' <"$ERR_FILE" 2>/dev/null | cut -c1-200)"
  log "commit count HEAD: $(git rev-list --count HEAD 2>/dev/null || echo '?') / shallow=$(test -f "$(git rev-parse --git-dir 2>/dev/null)/shallow" && echo yes || echo no)"
  for depth in 50 200 1000; do
    log "retry: git fetch --deepen=$depth"
    git fetch --deepen="$depth" origin >/dev/null 2>&1 || log "fetch --deepen=$depth failed"
    if prev_reachable; then
      log "PREV now reachable after deepen=$depth"
      break
    fi
  done
  if ! prev_reachable; then
    log "retry: git fetch origin $PREV --depth=1"
    git fetch origin "$PREV" --depth=1 >/dev/null 2>&1 || log "fetch of PREV failed"
  fi
  run_diff
  rc=$?
fi

case "$rc" in
  0)
    log "no changes under $(pwd) vs $PREV -> skip build"
    exit 0
    ;;
  1)
    log "changes under $(pwd) vs $PREV -> build"
    exit 1
    ;;
  *)
    log "diff impossible even after retry (rc=$rc) -> build (fail-open, per FACT_GOVERNANCE 22-8-1-1-c(c))"
    exit 1
    ;;
esac
