#!/usr/bin/env bash
#
# inject-pillars.sh
# 5 ピラー記事（1095 / 1106 / 994 / 954 / 1018）の WP-CLI 経由 DB 直接注入を冪等に行う雛形。
#
# Source of Truth:
#   - management/OPERATION_MANUAL.md §3   ＝ 記事反映自動化（DB 直接注入）
#   - management/OPERATION_MANUAL.md §3.3 ＝ Claude Code 指示テンプレ
#   - management/OPERATION_MANUAL.md §3.5 ＝ 安全弁
#   - site-moterist/THE_THOR_DICTIONARY.md ＝ 装飾規則（HTML はすでに準拠済みとして素通し）
#
# 既定モード: --dry-run（バックアップ取得 + diff 表示のみ。wp post update は実行しない）。
# 本番反映には明示的に --apply を付与する。--apply 時も §3.5 の閾値で自動 ABORT する。
#
# Usage:
#   bash management/scripts/inject-pillars.sh                  # 5 記事すべて dry-run
#   bash management/scripts/inject-pillars.sh --post 1095      # 単記事 dry-run
#   bash management/scripts/inject-pillars.sh --post 1095 --apply  # 単記事を本番反映
#   bash management/scripts/inject-pillars.sh --apply          # 5 記事一斉反映（HUMAN 立会推奨）

set -euo pipefail

# --- リモート接続情報（§3.3 と一致） ---
SSH_HOST="rvpuxcjb@133.125.148.25"
SSH_PORT="22"
SSH_KEY_SRC="${HOME}/.ssh/mixhost_codex_pc"
SSH_KEY_TMP="/tmp/mixhost_key"
WP_PATH="public_html/moterist.com"

# --- §3.5 安全弁パラメータ ---
DELETE_LINE_THRESHOLD=1000   # これを超える削除は --apply で自動 ABORT
DRY_RUN=1
TARGET_POST=""

# --- 5 ピラー（post_id → slug） ---
PILLAR_IDS=(1095 1106 994 954 1018)
PILLAR_SLUGS=(fanza20250329 fanza20250331 fanza_otoku250114 fanzaotoku saika-kawakita-6)

# --- パス解決 ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
CONTENT_DIR="${REPO_ROOT}/site-moterist/03_content"
BACKUP_DIR="${REPO_ROOT}/site-moterist/07_wp/backups"

# --- 引数 ---
while [[ $# -gt 0 ]]; do
  case "$1" in
    --apply)   DRY_RUN=0; shift ;;
    --dry-run) DRY_RUN=1; shift ;;
    --post)    TARGET_POST="${2:-}"; shift 2 ;;
    -h|--help) sed -n '2,20p' "$0"; exit 0 ;;
    *)         echo "ERROR: unknown argument '$1'" >&2; exit 2 ;;
  esac
done

# --- 補助関数 ---
lookup_slug() {
  local needle="$1"
  local i
  for i in "${!PILLAR_IDS[@]}"; do
    if [[ "${PILLAR_IDS[$i]}" == "${needle}" ]]; then
      printf '%s\n' "${PILLAR_SLUGS[$i]}"
      return 0
    fi
  done
  return 1
}

prepare_ssh_key() {
  if [[ ! -f "${SSH_KEY_SRC}" ]]; then
    echo "ERROR: SSH key not found at ${SSH_KEY_SRC}" >&2
    return 1
  fi
  tr -d '\r' < "${SSH_KEY_SRC}" > "${SSH_KEY_TMP}"
  chmod 600 "${SSH_KEY_TMP}"
}

remote_exec() {
  ssh -F /dev/null -i "${SSH_KEY_TMP}" -p "${SSH_PORT}" \
      -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
      "${SSH_HOST}" "$@"
}

resolve_md() {
  local pid="$1" slug="$2"
  if [[ -f "${CONTENT_DIR}/staging/${pid}_${slug}.md" ]]; then
    printf '%s\n' "${CONTENT_DIR}/staging/${pid}_${slug}.md"
  elif [[ -f "${CONTENT_DIR}/${pid}_${slug}.md" ]]; then
    printf '%s\n' "${CONTENT_DIR}/${pid}_${slug}.md"
  else
    return 1
  fi
}

# --- 1 記事処理 ---
process_post() {
  local pid="$1"
  local slug="$2"
  local stamp body backup md_file deleted hit

  stamp="$(date +%Y%m%d_%H%M%S)"
  body="/tmp/post_body_${pid}.html"
  backup="${BACKUP_DIR}/${pid}_${stamp}.html"

  echo "=== ${pid} (${slug}) ==="

  if ! md_file="$(resolve_md "${pid}" "${slug}")"; then
    echo "  ERROR: source markdown not found in staging/ or canonical position"
    return 1
  fi
  echo "  source: ${md_file}"

  # フロントマター除去（YAML --- ブロックを 2 回スキップ）
  awk 'BEGIN{n=0} /^---$/ {n++; next} n>=2 {print}' "${md_file}" > "${body}"
  echo "  body  : ${body} ($(wc -l < "${body}") lines)"

  # §3.3 step 4: バックアップ取得
  mkdir -p "${BACKUP_DIR}"
  remote_exec "wp post get ${pid} --field=post_content --path=${WP_PATH}" \
    | sed 's|<script src="https://analytics.ahrefs.com[^"]*"[^>]*></script>||' \
    > "${backup}"
  echo "  backup: ${backup} ($(wc -l < "${backup}") lines)"

  # §3.5 安全弁: 削除行数閾値
  deleted="$(diff "${backup}" "${body}" 2>/dev/null | grep -c '^<' || true)"
  echo "  proposed deletion lines: ${deleted}"
  if (( deleted > DELETE_LINE_THRESHOLD )); then
    echo "  WARN: deletion exceeds ${DELETE_LINE_THRESHOLD} lines (§3.5 — HUMAN 確認推奨)"
    if (( DRY_RUN == 0 )); then
      echo "  ABORT: refusing to apply — re-run with explicit override or fix source"
      return 1
    fi
  fi

  if (( DRY_RUN == 1 )); then
    echo "  DRY-RUN: skipping wp post update (pass --apply to fire)"
    return 0
  fi

  # §3.3 step 4: 本文転送 → §3.3 step 5: wp post update
  scp -F /dev/null -i "${SSH_KEY_TMP}" "${body}" "${SSH_HOST}:/tmp/post_body_${pid}.html"
  remote_exec "cd ${WP_PATH} && wp post update ${pid} /tmp/post_body_${pid}.html"

  # §3.3 step 5: 反映検証
  hit="$(curl -fsS "https://moterist.com/${slug}/" 2>/dev/null | grep -c 'btn__link-primary' || true)"
  echo "  verify (btn__link-primary hits): ${hit}"
  if (( hit == 0 )); then
    echo "  WARN: marker not found — §3.4 ロールバック検討"
  fi
}

main() {
  prepare_ssh_key
  if (( DRY_RUN == 1 )); then
    echo "Mode: DRY-RUN (no production writes)"
  else
    echo "Mode: APPLY (will execute wp post update against moterist.com)"
  fi
  echo "Target: ${TARGET_POST:-ALL 5 pillars}"
  echo "----"

  if [[ -n "${TARGET_POST}" ]]; then
    local slug
    if ! slug="$(lookup_slug "${TARGET_POST}")"; then
      echo "ERROR: post ${TARGET_POST} is not in the pillar set" >&2
      exit 2
    fi
    process_post "${TARGET_POST}" "${slug}"
  else
    local i
    for i in "${!PILLAR_IDS[@]}"; do
      process_post "${PILLAR_IDS[$i]}" "${PILLAR_SLUGS[$i]}" || echo "[${PILLAR_IDS[$i]}] FAILED"
    done
  fi
}

main "$@"
