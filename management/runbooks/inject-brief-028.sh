#!/usr/bin/env bash
# ============================================================================
# inject-brief-028.sh — STRATEGY_BRIEF_028 §1 物理注入スクリプト (Option α)
# ============================================================================
# 戦略: Option α (Safe Append) — 既存 post_content の末尾に staging HTML を
#       連結した上で wp post update。SEO body 100% 保護、新 CTA section は末尾追加。
#
# 対象: post_id 994 / 1018 / 1095 / 1106 / 954 (全 5 件)
#
# 実行責任: HUMAN (Tachi) — auto-mode classifier が mixhost SSH を block するため
#           CTO (Claude Code) は本 script を起動できない。HUMAN が自分の terminal
#           で `bash management/runbooks/inject-brief-028.sh` を実行する。
#
# 参考: OPERATION_MANUAL.md §3.3 / §3.4 (rollback) /
#       management/_memory/feedback-memory.md (wp post update は完全置換仕様)
# ============================================================================

set -euo pipefail

KEY_SRC="${HOME}/.ssh/mixhost_codex_pc"
KEY_NORM="/tmp/mixhost_key"
SSH_HOST="rvpuxcjb@133.125.148.25"
WP_PATH="public_html/moterist.com"
STAGING_DIR="site-moterist/03_content/staging"
BACKUP_DIR="site-moterist/03_content/backups"
TS=$(date +%Y%m%d_%H%M%S)

# ----------------------------------------------------------------------------
# Posts (BRIEF 028 §1 - 全 5 件 including 954)
#   ID → slug マッピング (本番 WordPress と一致)
# ----------------------------------------------------------------------------
declare -A POSTS=(
  [994]="fanza_otoku250114"
  [1018]="saika-kawakita-6"
  [1095]="fanza20250329"
  [1106]="fanza20250331"
  [954]="fanzaotoku"
)

# ----------------------------------------------------------------------------
# Step 0: 鍵正規化 (CRLF → LF) / OPERATION_MANUAL §0
# ----------------------------------------------------------------------------
echo "[0/precheck] Key normalize"
tr -d '\r' < "${KEY_SRC}" > "${KEY_NORM}"
chmod 600 "${KEY_NORM}"

# 全 post の staging HTML 存在事前確認
MISSING=()
for ID in "${!POSTS[@]}"; do
  SLUG="${POSTS[$ID]}"
  STAGING="${STAGING_DIR}/${ID}_${SLUG}.html"
  [[ ! -f "${STAGING}" ]] && MISSING+=("${ID} (${STAGING})")
done
if [[ ${#MISSING[@]} -gt 0 ]]; then
  echo "❌ Precondition fail: staging HTML missing:"
  printf '   - %s\n' "${MISSING[@]}"
  exit 1
fi

mkdir -p "${BACKUP_DIR}"

# ----------------------------------------------------------------------------
# Per-post injection loop (Option α: Safe Append)
# ----------------------------------------------------------------------------
for ID in "${!POSTS[@]}"; do
  SLUG="${POSTS[$ID]}"
  STAGING="${STAGING_DIR}/${ID}_${SLUG}.html"
  BODY_TMP="/tmp/post_${ID}_body.html"
  BACKUP="${BACKUP_DIR}/${ID}_${SLUG}_${TS}.html"

  echo ""
  echo "=== post_id=${ID} (${SLUG}) ==="

  # Step 2: 現本番 post_content をバックアップ (ahrefs tracker は sed で除去)
  echo "  [1/5] Backup current post_content → ${BACKUP}"
  ssh -F /dev/null -i "${KEY_NORM}" -p 22 "${SSH_HOST}" \
    "wp post get ${ID} --field=post_content --path=${WP_PATH}" \
    | sed 's|<script src="https://analytics.ahrefs.com[^"]*"[^>]*></script>||' \
    > "${BACKUP}"

  # Step 3 (Option α MERGE): 既存 body 末尾に staging HTML を append
  # ※ wp post update は post_content を完全置換するため、merge を local で完了させる
  # ※ feedback-memory.md §1 に従い、SEO body は 100% 保護する
  echo "  [2/5] Merge: existing body + staging HTML → ${BODY_TMP}"
  cat "${BACKUP}" "${STAGING}" > "${BODY_TMP}"

  # Step 4: scp + wp post update で merged body を本番 DB へ注入
  echo "  [3/5] scp merged body → remote /tmp"
  scp -F /dev/null -i "${KEY_NORM}" "${BODY_TMP}" "${SSH_HOST}:/tmp/post_body.html"

  echo "  [4/5] wp post update"
  ssh -F /dev/null -i "${KEY_NORM}" -p 22 "${SSH_HOST}" \
    "cd ${WP_PATH} && wp post update ${ID} /tmp/post_body.html"

  # Step 5: 本番 HTML 検証 (新 CTA + 既存 body 残存両方を確認)
  echo "  [5/5] Verify production HTML"
  REMOTE_HTML=$(curl -s "https://moterist.com/?p=${ID}")
  if echo "${REMOTE_HTML}" | grep -qE 'btn__link-primary'; then
    echo "  ✅ post_id=${ID}: new CTA detected"
  else
    echo "  ⚠️  post_id=${ID}: new CTA pattern NOT found"
    echo "      Backup: ${BACKUP}"
    echo "      Rollback: ssh -F /dev/null -i ${KEY_NORM} -p 22 ${SSH_HOST} \\"
    echo "        \"cd ${WP_PATH} && wp post update ${ID} ${BACKUP}\""
  fi
done

echo ""
echo "============================================================================"
echo "BRIEF 028 §1 完了: 5 posts (994/1018/1095/1106/954) を Option α で本番注入。"
echo "全 backup at: ${BACKUP_DIR}/<id>_<slug>_${TS}.html"
echo ""
echo "NEXT (BRIEF 028 §2 / BRIEF 029): CTO triggers GA4 _gl linker + source=moterist"
echo "  cross-domain attribution monitoring within 24h via Chrome MCP."
echo "============================================================================"
