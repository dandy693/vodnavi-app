#!/usr/bin/env bash
# ============================================================================
# inject-brief-028.sh — STRATEGY_BRIEF_028 §1 物理注入スクリプト
# ============================================================================
# 対象: post_id 994 / 1018 / 1095 / 1106 (4 件、post-954 は別 CCO タスク)
#
# 実行責任: HUMAN (Tachi) — auto-mode classifier が mixhost SSH を block するため
#           CTO (Claude Code) は本 script を起動できない。HUMAN が自分の terminal
#           で `bash management/runbooks/inject-brief-028.sh` を実行する。
#
# 前提条件 (precondition): site-moterist/03_content/staging/<post_id>_<slug>.html
#   が存在し、装飾 HTML が完成していること。
#   現在 (2026-06-01) は site-moterist/03_content/rewrites/post-*-final-rewrite.md
#   が "Proposed" Markdown draft の状態で、本番投入可能な HTML 形式ではない。
#   → CCO に Proposed → staging HTML 変換を依頼してから本 script を実行する。
#
# 参考: OPERATION_MANUAL.md §3.3 / §3.4 (rollback)
# ============================================================================

set -euo pipefail

KEY_SRC="${HOME}/.ssh/mixhost_codex_pc"
KEY_NORM="/tmp/mixhost_key"
SSH_HOST="rvpuxcjb@133.125.148.25"
WP_PATH="public_html/moterist.com"
STAGING_DIR="site-moterist/03_content/staging"
BACKUP_DIR="site-moterist/07_wp/backups"
TS=$(date +%Y%m%d_%H%M%S)

# ----------------------------------------------------------------------------
# Posts (BRIEF 028 §1、post-954 を除く 4 件)
#   ID → slug マッピング (本番 WordPress と一致)
# ----------------------------------------------------------------------------
declare -A POSTS=(
  [994]="fanza_otoku250114"
  [1018]="saika-kawakita-6"
  [1095]="fanza20250329"
  [1106]="fanza20250331"
)

# ----------------------------------------------------------------------------
# Step 0: 鍵正規化 (CRLF → LF)  / OPERATION_MANUAL §0
# ----------------------------------------------------------------------------
echo "[0/precheck] Key normalize"
tr -d '\r' < "${KEY_SRC}" > "${KEY_NORM}"
chmod 600 "${KEY_NORM}"

# 全 post に対する staging HTML の存在事前チェック
MISSING=()
for ID in "${!POSTS[@]}"; do
  SLUG="${POSTS[$ID]}"
  STAGING="${STAGING_DIR}/${ID}_${SLUG}.html"
  [[ ! -f "${STAGING}" ]] && MISSING+=("${ID} (${STAGING})")
done
if [[ ${#MISSING[@]} -gt 0 ]]; then
  echo "❌ Precondition fail: staging HTML missing for the following posts:"
  printf '   - %s\n' "${MISSING[@]}"
  echo ""
  echo "CCO must convert site-moterist/03_content/rewrites/post-<id>-final-rewrite.md"
  echo "(Proposed draft) → staging HTML per OPERATION_MANUAL §3.1, then re-run this script."
  exit 1
fi

mkdir -p "${BACKUP_DIR}"

# ----------------------------------------------------------------------------
# Per-post injection loop (OPERATION_MANUAL §3.3 steps 2-6)
# ----------------------------------------------------------------------------
for ID in "${!POSTS[@]}"; do
  SLUG="${POSTS[$ID]}"
  STAGING="${STAGING_DIR}/${ID}_${SLUG}.html"
  BODY_TMP="/tmp/post_${ID}_body.html"
  BACKUP="${BACKUP_DIR}/${ID}_${TS}.html"

  echo ""
  echo "=== post_id=${ID} (${SLUG}) ==="

  # Step 2: 現 post_content をバックアップ (ahrefs tracker は sed で除去)
  echo "  [1/4] Backup current post_content → ${BACKUP}"
  ssh -F /dev/null -i "${KEY_NORM}" -p 22 "${SSH_HOST}" \
    "wp post get ${ID} --field=post_content --path=${WP_PATH}" \
    | sed 's|<script src="https://analytics.ahrefs.com[^"]*"[^>]*></script>||' \
    > "${BACKUP}"

  # Step 3: staging HTML をローカル /tmp にコピー (Markdown 変換不要、既に HTML 前提)
  echo "  [2/4] Copy staging HTML → ${BODY_TMP}"
  cp "${STAGING}" "${BODY_TMP}"

  # Step 4: scp + wp post update で本番 DB へ直接注入
  echo "  [3/4] scp body → remote /tmp, then wp post update"
  scp -F /dev/null -i "${KEY_NORM}" "${BODY_TMP}" "${SSH_HOST}:/tmp/post_body.html"
  ssh -F /dev/null -i "${KEY_NORM}" -p 22 "${SSH_HOST}" \
    "cd ${WP_PATH} && wp post update ${ID} /tmp/post_body.html"

  # Step 5: 本番 HTML 検証 (装飾要素の生存確認)
  echo "  [4/4] Verify production HTML"
  REMOTE_HTML=$(curl -s "https://moterist.com/?p=${ID}")
  if echo "${REMOTE_HTML}" | grep -qE 'btn__link-primary|btn-luxury-gold|/concierge'; then
    echo "  ✅ post_id=${ID} updated and verified (concierge CTA detected)"
  else
    echo "  ⚠️  post_id=${ID} update succeeded but verify pattern not found"
    echo "      Backup at ${BACKUP} — rollback with:"
    echo "      ssh -F /dev/null -i ${KEY_NORM} -p 22 ${SSH_HOST} \\"
    echo "        \"cd ${WP_PATH} && wp post update ${ID} ${BACKUP}\""
  fi
done

echo ""
echo "============================================================================"
echo "BRIEF 028 §1 完了: 4 posts (994/1018/1095/1106) を本番 DB 直接注入。"
echo "Backups at: ${BACKUP_DIR}/<id>_${TS}.html"
echo ""
echo "NEXT (BRIEF 028 §2): CSO/CTO triggers GA4 _gl linker + source=moterist"
echo "  cross-domain attribution monitoring within 24h via Chrome MCP."
echo "  Suggested check: /metrics URL with r=top-events + ai_session_start filter."
echo "============================================================================"
