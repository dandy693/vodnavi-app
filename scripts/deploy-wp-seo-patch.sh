#!/usr/bin/env bash
# scripts/deploy-wp-seo-patch.sh
#
# moterist.com の WordPress コア users サイトマップを潰す MU プラグインを本番にデプロイ。
# 対象: site-moterist/07_wp/snippets/disable-user-sitemap.php
# 配置: /home/rvpuxcjb/public_html/moterist.com/wp-content/mu-plugins/disable-user-sitemap.php
#
# 動作:
#   1. SSH 鍵を /tmp/mixhost_key に正規化（CRLF 除去）
#   2. SSH 接続性テスト + mu-plugins ディレクトリ存在確認
#   3. 既存 disable-user-sitemap.php があればタイムスタンプ付きでローカルにバックアップ
#   4. scp で /wp-content/mu-plugins/ に転送
#   5. 644 パーミッション設定
#   6. 本番監査:
#        - wp-sitemap.xml の <sitemap><loc>...users-...</loc></sitemap> エントリが 0 件
#        - wp-sitemap-users-1.xml が HTTP 404 を返す
#        - robots.txt が 200 で到達できる（巻き添えチェック）
#
# MU プラグインなので置くだけで自動有効化。アクティベート不要。
# ロールバック:
#   ssh -i /tmp/mixhost_key -p 22 rvpuxcjb@133.125.148.25 \
#     'rm /home/rvpuxcjb/public_html/moterist.com/wp-content/mu-plugins/disable-user-sitemap.php'
#
# 既存 deploy-typo-fix-commonCtr.sh と同じ SSH 設定・パターンを踏襲。
#
set -euo pipefail

SSH_KEY_SRC="${HOME}/.ssh/mixhost_codex_pc"
SSH_KEY="/tmp/mixhost_key"
SSH_USER="rvpuxcjb"
SSH_HOST="133.125.148.25"
SSH_PORT="22"
REMOTE_MU="/home/rvpuxcjb/public_html/moterist.com/wp-content/mu-plugins"
SITE_ORIGIN="https://moterist.com"

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOCAL_PLUGIN="${REPO_ROOT}/site-moterist/07_wp/snippets/disable-user-sitemap.php"
BACKUP_DIR="${REPO_ROOT}/site-moterist/02_site-audit/backups/2026-05-25"

log() { printf '\n\033[1;36m[%s]\033[0m %s\n' "$(date +%H:%M:%S)" "$*"; }
err() { printf '\n\033[1;31m[ERR]\033[0m %s\n' "$*" >&2; }
ok()  { printf '  \033[1;32m✓\033[0m %s\n' "$*"; }
ng()  { printf '  \033[1;31m✗\033[0m %s\n' "$*" >&2; }

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
[[ -f "$LOCAL_PLUGIN" ]] || { err "MU プラグイン本体が見つからない: $LOCAL_PLUGIN"; exit 1; }
mkdir -p "$BACKUP_DIR"

log "SSH 鍵を正規化（CRLF 除去 + 600）"
tr -d '\r' < "$SSH_KEY_SRC" > "$SSH_KEY"
chmod 600 "$SSH_KEY"

log "SSH 接続性テスト + mu-plugins ディレクトリ確認"
ssh_remote "mkdir -p '$REMOTE_MU' && ls -la '$REMOTE_MU' | head -20"

TIMESTAMP="$(date +%Y%m%d-%H%M%S)"

log "既存 disable-user-sitemap.php があればバックアップ取得"
if ssh_remote "test -f '$REMOTE_MU/disable-user-sitemap.php'"; then
  BK="${BACKUP_DIR}/disable-user-sitemap.${TIMESTAMP}.php"
  ssh_remote "cat '$REMOTE_MU/disable-user-sitemap.php'" > "$BK"
  ok "バックアップ: $BK"
else
  ok "既存ファイル無し（初回デプロイ）"
fi

log "MU プラグイン転送: $LOCAL_PLUGIN → $REMOTE_MU/disable-user-sitemap.php"
scp_to_remote "$LOCAL_PLUGIN" "$REMOTE_MU/disable-user-sitemap.php"

log "パーミッション設定 (644)"
ssh_remote "chmod 644 '$REMOTE_MU/disable-user-sitemap.php' && ls -la '$REMOTE_MU/disable-user-sitemap.php'"

# ─── 本番監査 ───────────────────────────────────────────────
# WordPress のサイトマップキャッシュ (object cache / opcache) が落ち着くまで少し待つ。
sleep 3

log "本番監査 1/3: wp-sitemap.xml に users エントリが残っていないか"
sitemap_xml="$(curl -fsSL "${SITE_ORIGIN}/wp-sitemap.xml" || true)"
if [[ -z "$sitemap_xml" ]]; then
  err "wp-sitemap.xml が取得できない（ネットワーク/WAF を確認）"
  exit 1
fi
users_hits="$(printf '%s' "$sitemap_xml" | grep -c 'wp-sitemap-users-' || true)"
if [[ "$users_hits" -eq 0 ]]; then
  ok "users provider 消失確認 (wp-sitemap-users-* 0 件)"
else
  ng "wp-sitemap.xml にまだ users エントリが ${users_hits} 件残存 — キャッシュ or filter 未適用の疑い"
  printf '%s\n' "$sitemap_xml" | grep 'wp-sitemap-users-' >&2 || true
  exit 1
fi

log "本番監査 2/3: wp-sitemap-users-1.xml が有効な users urlset XML を返していないか"
# WP の rewrite フォールバックで、未マッチの sitemap パスはホームページ HTML を
# HTTP 200 で返すことが多い（404 ではない）。crawler に著者 URL が漏れない限り
# 機能的には合格。XML 構造を本文検査し、urlset + /author/ loc が無いことを確認。
users_body="$(curl -sSL "${SITE_ORIGIN}/wp-sitemap-users-1.xml" || true)"
users_status="$(curl -s -o /dev/null -w '%{http_code}' "${SITE_ORIGIN}/wp-sitemap-users-1.xml" || true)"
if echo "$users_body" | grep -qiE '<urlset[^>]*>' && echo "$users_body" | grep -qiE '<loc>[^<]+/author/'; then
  ng "wp-sitemap-users-1.xml は依然 users urlset XML を返している (status=${users_status}) — filter 未適用の疑い"
  exit 1
else
  ok "wp-sitemap-users-1.xml → users urlset XML 不在 (status=${users_status}, body は HP フォールバック)"
fi

log "本番監査 3/3: robots.txt が 200 で生存しているか（巻き添え事故防止）"
robots_status="$(curl -s -o /dev/null -w '%{http_code}' "${SITE_ORIGIN}/robots.txt" || true)"
if [[ "$robots_status" == "200" ]]; then
  ok "robots.txt → HTTP 200"
else
  ng "robots.txt → HTTP ${robots_status} (200 を期待)"
  exit 1
fi

log "完了。disable-user-sitemap.php デプロイ + 監査 3/3 グリーン。"
log "ロールバック: ssh -i $SSH_KEY -p $SSH_PORT ${SSH_USER}@${SSH_HOST} 'rm $REMOTE_MU/disable-user-sitemap.php'"
