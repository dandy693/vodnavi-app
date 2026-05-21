#!/usr/bin/env bash
# scripts/inject-pillar-articles.sh
#
# Moterist 3 ピラー記事 (1095/1106/994) の本番 WP 注入スクリプト。
#
# 動作：
#   1. SSH 鍵を /tmp/mixhost_key に正規化（CRLF → LF）
#   2. SSH 接続性テスト
#   3. 現行 post_content / post_title を site-moterist/02_site-audit/backups/2026-05-22/ にバックアップ
#   4. site-moterist/03_content/published/2026-05-22/post-<id>.html を scp で /tmp/ に転送
#   5. wp post update <id> /tmp/post-<id>.html で注入
#   6. curl で本番 URL の HTTP 200 を確認
#
# 設計原則：
#   - 一括 abort：いずれかの記事で失敗したら直ちに停止（set -e）
#   - バックアップ先：管理リポジトリ内（git で追えるが gitignore 対象になっている可能性あり）
#   - 冪等：再実行しても古い post_content バックアップを上書きしない（タイムスタンプ付き）
#
# 注意：このスクリプトは Bash で動かす（Git Bash on Windows / WSL / mixhost ローカル）。
# Windows PowerShell からは `bash scripts/inject-pillar-articles.sh` で起動する。
#
set -euo pipefail

# ===== 設定 =====
SSH_KEY_SRC="${HOME}/.ssh/mixhost_codex_pc"
SSH_KEY="/tmp/mixhost_key"
SSH_USER="rvpuxcjb"
SSH_HOST="133.125.148.25"
SSH_PORT="22"
REMOTE_WP="/home/rvpuxcjb/public_html/moterist.com"
REMOTE_TMP="/tmp"

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HTML_DIR="${REPO_ROOT}/site-moterist/03_content/published/2026-05-22"
BACKUP_DIR="${REPO_ROOT}/site-moterist/02_site-audit/backups/2026-05-22"

# 記事 ID とスラッグ（検証用 URL の組み立てに使う）
declare -A POST_SLUGS=(
  [1095]="fanza20250329"
  [1106]="fanza20250331"
  [994]="fanza_otoku250114"
)

# ===== ユーティリティ =====
log() { printf '\n\033[1;36m[%s]\033[0m %s\n' "$(date +%H:%M:%S)" "$*"; }
err() { printf '\n\033[1;31m[ERR]\033[0m %s\n' "$*" >&2; }

ssh_remote() {
  ssh -F /dev/null -i "$SSH_KEY" \
      -o BatchMode=yes -o ConnectTimeout=10 \
      -o StrictHostKeyChecking=accept-new \
      -p "$SSH_PORT" "${SSH_USER}@${SSH_HOST}" "$@"
}

scp_to_remote() {
  scp -F /dev/null -i "$SSH_KEY" -P "$SSH_PORT" \
      -o StrictHostKeyChecking=accept-new \
      "$1" "${SSH_USER}@${SSH_HOST}:$2"
}

# ===== 0. 前提チェック =====
log "前提チェック開始"

if [[ ! -f "$SSH_KEY_SRC" ]]; then
  err "SSH 鍵が見つからない: $SSH_KEY_SRC"
  exit 1
fi

for post_id in "${!POST_SLUGS[@]}"; do
  if [[ ! -f "${HTML_DIR}/post-${post_id}.html" ]]; then
    err "HTML が見つからない: ${HTML_DIR}/post-${post_id}.html"
    exit 1
  fi
done

mkdir -p "$BACKUP_DIR"

# ===== 1. SSH 鍵正規化 =====
log "SSH 鍵を正規化 (CRLF → LF)"
tr -d '\r' < "$SSH_KEY_SRC" > "$SSH_KEY"
chmod 600 "$SSH_KEY"

# ===== 2. SSH 接続性テスト =====
log "SSH 接続性テスト"
ssh_remote "echo connected:\$(hostname) wp_path=${REMOTE_WP} wp_cli=\$(which wp)"

# ===== 3. バックアップ =====
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
log "現行 post_content / post_title をバックアップ ($TIMESTAMP)"

for post_id in "${!POST_SLUGS[@]}"; do
  BACKUP_HTML="${BACKUP_DIR}/post-${post_id}.${TIMESTAMP}.html"
  BACKUP_META="${BACKUP_DIR}/post-${post_id}.${TIMESTAMP}.meta.txt"

  ssh_remote "cd ${REMOTE_WP} && wp post get ${post_id} --field=post_content" > "$BACKUP_HTML"
  ssh_remote "cd ${REMOTE_WP} && wp post get ${post_id} --fields=ID,post_title,post_status,post_modified,post_name --format=json" > "$BACKUP_META"

  log "  - ${post_id}: $(wc -c < "$BACKUP_HTML") bytes → $BACKUP_HTML"
done

# ===== 4. HTML 転送 + WP-CLI 注入 =====
for post_id in "${!POST_SLUGS[@]}"; do
  LOCAL_HTML="${HTML_DIR}/post-${post_id}.html"
  REMOTE_PATH="${REMOTE_TMP}/inject-${post_id}-${TIMESTAMP}.html"

  log "[$post_id] HTML 転送: $LOCAL_HTML → $REMOTE_PATH"
  scp_to_remote "$LOCAL_HTML" "$REMOTE_PATH"

  log "[$post_id] wp post update を実行"
  ssh_remote "cd ${REMOTE_WP} && wp post update ${post_id} '${REMOTE_PATH}'"

  log "[$post_id] /tmp クリーンアップ"
  ssh_remote "rm -f '${REMOTE_PATH}'"
done

# ===== 5. 本番 URL の HTTP 200 検証 =====
log "本番 URL の HTTP 200 検証"
for post_id in "${!POST_SLUGS[@]}"; do
  slug="${POST_SLUGS[$post_id]}"
  url="https://moterist.com/${slug}/"
  status=$(curl -sL -o /dev/null -w "%{http_code}" "$url")
  if [[ "$status" == "200" ]]; then
    log "  ✓ ${post_id} (${url}) → $status"
  else
    err "  ✗ ${post_id} (${url}) → $status (ロールバック検討)"
    exit 1
  fi
done

log "完了。バックアップ参照: $BACKUP_DIR"
log "ロールバック手順: バックアップ HTML を wp post update <id> /tmp/<backup>.html で再注入"
