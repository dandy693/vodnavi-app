#!/usr/bin/env bash
# scripts/deploy-typo-fix-commonCtr.sh
#
# moterist.com commonCtr ヒーローバナーの一文字落ち修正 MU プラグインを本番にデプロイ。
#
# 動作:
#   1. SSH 鍵を /tmp/mixhost_key に正規化
#   2. SSH 接続性テスト
#   3. 既存 mu-plugins/typo-fix-commonCtr.php があればタイムスタンプ付きでバックアップ
#   4. site-moterist/07_wp/mu-plugins/typo-fix-commonCtr.php を scp で /wp-content/mu-plugins/ に転送
#   5. 644 パーミッション設定
#   6. curl で本番 HTML に <style id="typo-fix-commonCtr"> が含まれているか確認
#
# MU プラグインなので置くだけで自動有効化。アクティベート不要。
# ロールバック: ssh -i ... rm /home/rvpuxcjb/public_html/moterist.com/wp-content/mu-plugins/typo-fix-commonCtr.php
#
set -euo pipefail

SSH_KEY_SRC="${HOME}/.ssh/mixhost_codex_pc"
SSH_KEY="/tmp/mixhost_key"
SSH_USER="rvpuxcjb"
SSH_HOST="133.125.148.25"
SSH_PORT="22"
REMOTE_MU="/home/rvpuxcjb/public_html/moterist.com/wp-content/mu-plugins"

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOCAL_PLUGIN="${REPO_ROOT}/site-moterist/07_wp/mu-plugins/typo-fix-commonCtr.php"
BACKUP_DIR="${REPO_ROOT}/site-moterist/02_site-audit/backups/2026-05-22"

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

log "前提チェック"
[[ -f "$SSH_KEY_SRC" ]] || { err "SSH 鍵が見つからない: $SSH_KEY_SRC"; exit 1; }
[[ -f "$LOCAL_PLUGIN" ]] || { err "MU プラグインが見つからない: $LOCAL_PLUGIN"; exit 1; }
mkdir -p "$BACKUP_DIR"

log "SSH 鍵を正規化"
tr -d '\r' < "$SSH_KEY_SRC" > "$SSH_KEY"
chmod 600 "$SSH_KEY"

log "SSH 接続性テスト + mu-plugins ディレクトリ確認"
ssh_remote "mkdir -p '$REMOTE_MU' && ls -la '$REMOTE_MU' | head -20"

TIMESTAMP="$(date +%Y%m%d-%H%M%S)"

log "既存 typo-fix-commonCtr.php があればバックアップ取得"
if ssh_remote "test -f '$REMOTE_MU/typo-fix-commonCtr.php'"; then
  BK="${BACKUP_DIR}/typo-fix-commonCtr.${TIMESTAMP}.php"
  ssh_remote "cat '$REMOTE_MU/typo-fix-commonCtr.php'" > "$BK"
  log "  バックアップ: $BK"
else
  log "  既存ファイル無し（初回デプロイ）"
fi

log "MU プラグイン転送: $LOCAL_PLUGIN → $REMOTE_MU/typo-fix-commonCtr.php"
scp_to_remote "$LOCAL_PLUGIN" "$REMOTE_MU/typo-fix-commonCtr.php"

log "パーミッション設定 (644)"
ssh_remote "chmod 644 '$REMOTE_MU/typo-fix-commonCtr.php' && ls -la '$REMOTE_MU/typo-fix-commonCtr.php'"

log "本番 HTML で <style id=\"typo-fix-commonCtr\"> 反映確認"
sleep 2
hits=$(curl -sL "https://moterist.com/" | grep -c 'id="typo-fix-commonCtr"' || true)
if [[ "$hits" -ge 1 ]]; then
  log "  ✓ HTML に style ブロック反映済 ($hits 件)"
else
  err "  ✗ HTML に style ブロックが見つからない (キャッシュの可能性 / 要再確認)"
  exit 1
fi

log "完了。ロールバック: ssh ... 'rm $REMOTE_MU/typo-fix-commonCtr.php'"
